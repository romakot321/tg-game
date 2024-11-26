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


class PVPCreateSchema(BaseModel):
    user1_telegram_id: int
    user2_telegram_id: int

    def __eq__(self, other):
        return self.user1_telegram_id == other.user1_telegram_id and self.user2_telegram_id == other.user2_telegram_id \
                or self.user2_telegram_id == other.user1_telegram_id and self.user1_telegram_id == other.user2_telegram_id


class PVPStateSchema(BaseModel):
    scores: dict[int, int]
    objects: list[list]
    time_left: float


class PVPMessageSchema(BaseModel):
    event: str
    data: dict | None = None
