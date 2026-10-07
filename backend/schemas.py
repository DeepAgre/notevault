from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    identifier: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50000)


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
    sentiment_score: float | None = None

    model_config = ConfigDict(from_attributes=True)


class NoteUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=50000)

class NoteShareRequest(BaseModel):
    recipient: str = Field(min_length=1, max_length=100)

# --- NEW FEEDBACK SCHEMAS ---

class FeedbackCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    accuracy: str = Field(min_length=1, max_length=100)
    rating: int = Field(ge=1, le=5, description="Star rating from 1 to 5")
    comment: str | None = Field(default=None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: int
    name: str
    accuracy: str
    rating: int
    comment: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)