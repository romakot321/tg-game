from fastapi import APIRouter, HTTPException, WebSocket

import db
from schemas import UserSchema, UserUpdateSchema
from pvp import PVPService


router = APIRouter(prefix='/api/user', tags=['User'])


@router.get('/{telegram_id}', response_model=UserSchema)
async def get_user(telegram_id: int):
    user = await db.get_user(telegram_id)
    if user is None:
        raise HTTPException(404)
    return UserSchema.model_validate(user)


@router.get('', response_model=list[UserSchema])
async def get_users():
    users = await db.get_users(order_by_score=True)
    return [UserSchema.model_validate(user) for user in users]


@router.patch('/{telegram_id}')
async def update_user(telegram_id: int, schema: UserUpdateSchema):
    if schema.score is not None:
        await db.add_user_score(telegram_id, schema.score)
    schema.score = None
    await db.update_user(telegram_id, schema.model_dump(exclude_none=True))


pvp_router = APIRouter(prefix="/api/pvp", tags=["PVP"])
pvp_service = PVPService()


@pvp_router.websocket("/create/{user1_id}/{user2_id}")
async def run_pvp(websocket: WebSocket, user1_id: int, user2_id: int):
    await websocket.accept()
    await pvp_service.connect(websocket, user1_id, user2_id)
