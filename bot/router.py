from fastapi import APIRouter, HTTPException

import db
from schemas import UserSchema, UserUpdateSchema


router = APIRouter(prefix='/api/user', tags=['User'])


@router.get('/{telegram_id}', response_model=UserSchema)
async def get_user(telegram_id: int):
    user = await db.get_user(telegram_id)
    if user is None:
        raise HTTPException(404)
    return UserSchema.model_validate(user)


@router.get('', response_model=list[UserSchema])
async def get_users():
    users = await db.get_users()
    return [UserSchema.model_validate(user) for user in users]


@router.patch('')
async def update_user(schema: UserUpdateSchema):
    await db.add_user_score(schema.telegram_id, schema.score)
