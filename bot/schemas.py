from pydantic import BaseModel


class UserSchema(BaseModel):
    telegram_id: int
    score: int


class UserUpdateSchema(BaseModel):
    telegram_id: int
    score: int | None = None
