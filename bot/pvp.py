from fastapi import WebSocket
from pydantic import BaseModel, ConfigDict
from uuid import uuid4
import time
import asyncio
import starlette
import random
from loguru import logger

from schemas import PVPCreateSchema, PVPMessageSchema, PVPStateSchema, PVPObjectSchema
from db import get_user


class RoomClient(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    connection: WebSocket
    screen_width: float | None = None
    screen_height: float | None = None


class Room(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    clients: dict[int, RoomClient | None]
    state: PVPStateSchema | None = None


class PVPService:
    room_lifetime = 60.0
    map_columns = 5
    map_rows = 7

    def __init__(self):
        self.rooms = []

    async def connect(self, client: WebSocket, user1_id: int, user2_id: int):
        room = await self._connect(client, user1_id, user2_id)
        if room is None:
            room = await self._create(client, user1_id, user2_id)
            logger.info(f"Room {room.id} created for {user1_id} vs {user2_id}")
        await self._init_client(client, room, user1_id)
        await self._wait_start(client, room.id, user1_id)
        logger.info(f"Room {room.id} started")
        await self._run(client, user1_id, room)
        logger.info(f"Room {room.id} finished")

    async def _send(self, room, user_id, msg: PVPMessageSchema):
        try:
            await room.clients[user_id].connection.send_json(msg.model_dump())
        except starlette.websockets.WebSocketDisconnect:
            if room.state is not None:
                room.state.time_left = -1;
            if room in self.rooms:
                self.rooms.remove(room)

    async def _init_client(self, client, room, user_id):
        data = await client.receive_json()
        msg = PVPMessageSchema.model_validate(data)
        await self._process_request(client, msg, room, user_id)

    def _generate_object(self, room):
        screen_size = self._get_room_screen_size(room)
        x = random.randint(50, screen_size[0] - 50)
        y = random.randint(50, screen_size[1] - 50)
        return PVPObjectSchema(x=x, y=y, type="coin")

    async def _process_request(self, client: WebSocket, msg: PVPMessageSchema, room: Room, user_id):
        if msg.event == "score":
            room.state.scores[user_id] += msg.data["value"]
            room.state.time_left = max(float(msg.data["time_left"]), room.state.time_left)
        elif msg.event == "remove":
            founded = False
            for obj in room.state.objects:
                if (obj.x, obj.y) == (msg.data['x'], msg.data['y']):
                    room.state.objects.remove(obj)
                    founded = True
                    break
            if founded:
                room.state.objects.append(self._generate_object(room))
                logger.debug((room.state.objects, msg))
                msg = PVPMessageSchema(event="objects", data={'objects': room.state.objects})
                await self._send(room, user_id, msg)
            else:
                return
        elif msg.event == "init":
            room.clients[user_id].screen_width = msg.data["screen_width"]
            room.clients[user_id].screen_height = msg.data["screen_height"]

        for i, enemy_client in room.clients.items():
            if i == user_id:
                continue
            if enemy_client is None:
                continue
            await self._send(room, i, msg)

    async def _run(self, client: WebSocket, user_id: int, room: Room):
        while room.state.time_left > 0:
            timer = time.time()
            data = await client.receive_json()
            room.state.time_left -= time.time() - timer
            
            msg = PVPMessageSchema.model_validate(data)
            await self._process_request(client, msg, room, user_id)
            
        await self._send(room, user_id, PVPMessageSchema(event="end", data=room.state.model_dump()))
        if room in self.rooms:
            self.rooms.remove(room)

    async def _connect(self, client: WebSocket, user1_id, user2_id) -> Room | None:
        for room in self.rooms:
            if user1_id in room.clients.keys() and user2_id in room.clients.keys() and room.clients[user1_id] is None:
                room.clients[user1_id] = RoomClient(connection=client)
                msg = PVPMessageSchema(event='connect', data={"id": room.id})
                await self._send(room, user1_id, msg)
                return room

    async def _create(self, client: WebSocket, user1_id, user2_id) -> Room:
        room = Room(
            id=str(uuid4()),
            clients={user1_id: RoomClient(connection=client), user2_id: None},
            state=PVPStateSchema(
                scores={user1_id: 0, user2_id: 0},
                time_left=self.room_lifetime,
                objects=[]
            )
        )
        self.rooms.append(room)
        msg = PVPMessageSchema(event='create', data={"id": room.id})
        await self._send(room, user1_id, msg)
        return room

    def _get_room_screen_size(self, room) -> tuple[int, int]:
        first_client = room.clients[list(room.clients.keys())[0]]
        minsize = (first_client.screen_width, first_client.screen_height)
        for cl in room.clients.values():
            if sum(minsize) > cl.screen_width + cl.screen_height:
                minsize = (cl.screen_width, cl.screen_height)
        return minsize

    def _get_room_map_columns(self, room) -> int:
        return self._get_room_screen_size(room)[0] // 50

    def _get_object_step(self, room, user_id) -> float:
        client_screen_size = (room.clients[user_id].screen_width, room.clients[user_id].screen_height)
        return client_screen_size[0] / self._get_room_map_columns(room)

    async def _wait_start(self, client: WebSocket, room_id: str, user_id: int):
        finish = False
        start_room = None
        
        while not finish:
            for room in self.rooms:
                if room.id != room_id:
                    continue
                if all(client is not None and client.screen_width is not None for client in room.clients.values()):
                    finish = True
                    start_room = room
                    break
                await self._send(room, user_id, PVPMessageSchema(event="wait", data=None))
                break
            await asyncio.sleep(1)

        if not start_room.state.objects:
            start_room.state.objects.append(self._generate_object(start_room))
            start_room.state.objects.append(self._generate_object(start_room))
        await self._send(
            start_room,
            user_id,
            PVPMessageSchema(
                event="start",
                data={"id": room_id, "object_step": self._get_object_step(start_room, user_id), "objects": start_room.state.objects}
            )
        )
