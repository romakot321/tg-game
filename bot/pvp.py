from fastapi import WebSocket
from pydantic import BaseModel, ConfigDict
from uuid import uuid4
import time
import asyncio
from loguru import logger

from schemas import PVPCreateSchema, PVPMessageSchema, PVPStateSchema
from db import get_user


class Room(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    clients: dict[int, WebSocket | None]
    state: PVPStateSchema | None = None


class PVPService:
    room_lifetime = 60.0

    def __init__(self):
        self.rooms = []

    async def connect(self, client: WebSocket, user1_id: int, user2_id: int):
        room = await self._connect(client, user1_id, user2_id)
        if room is None:
            room = await self._create(client, user1_id, user2_id)
            logger.info(f"Room {room.id} created for {user1_id} vs {user2_id}")
        await self._wait_start(client, room.id)
        room.state = PVPStateSchema(scores={user1_id: 0, user2_id: 0}, time_left=self.room_lifetime)
        logger.info(f"Room {room.id} started")
        await self._run(client, user1_id, room)
        logger.info(f"Room {room.id} finished")

    async def _run(self, client: WebSocket, user_id: int, room: Room):
        while room.state.time_left > 0:
            timer = time.time()
            data = await client.receive_json()
            room.state.time_left -= time.time() - timer
            
            msg = PVPMessageSchema.model_validate(data)
            if msg.event == "score":
                room.state.scores[user_id] += msg.data["value"]
                room.state.time_left = max(float(msg.data["time_left"]), room.state.time_left)
            for i, enemy_client in room.clients.items():
                if i == user_id:
                    continue
                await enemy_client.send_json(msg.model_dump())
        await client.send_json(PVPMessageSchema(event="end", data=room.state.model_dump()).model_dump())
        if room in self.rooms:
            self.rooms.remove(room)

    async def _connect(self, client: WebSocket, user1_id, user2_id) -> Room | None:
        for room in self.rooms:
            if user1_id in room.clients.keys() and user2_id in room.clients.keys() and room.clients[user1_id] is None:
                room.clients[user1_id] = client
                msg = PVPMessageSchema(event='connect', data={"id": room.id})
                await client.send_json(msg.model_dump())
                return room

    async def _create(self, client: WebSocket, user1_id, user2_id) -> Room:
        room = Room(
            id=str(uuid4()),
            clients={user1_id: client, user2_id: None}
        )
        self.rooms.append(room)
        msg = PVPMessageSchema(event='create', data={"id": room.id})
        await client.send_json(msg.model_dump())
        return room

    async def _wait_start(self, client: WebSocket, room_id: str):
        finish = False
        while not finish:
            for room in self.rooms:
                if room.id != room_id:
                    continue
                if all(client is not None for client in room.clients.values()):
                    finish = True
                    break
            await client.send_json(PVPMessageSchema(event="wait", data=None).model_dump())
            await asyncio.sleep(1)
        await client.send_json(PVPMessageSchema(event="start", data={"id": room_id}).model_dump())
