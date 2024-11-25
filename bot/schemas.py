from pydantic import BaseModel


class UserSchema(BaseModel):
    telegram_id: int
    score: int
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None


class UserUpdateSchema(BaseModel):
    score: int | None = None
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None
