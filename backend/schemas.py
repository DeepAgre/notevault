from pydantic import BaseModel, ConfigDict
from datetime import datetime


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    identifier: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    pinned: bool
    favorite: bool
    is_deleted: bool
    deleted_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class NoteUpdate(BaseModel):
    title: str
    content: str