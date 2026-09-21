from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, APIRouter
from database import engine, Base, get_db
from models import User
from crud import (
    create_note, create_user, delete_note, get_notes, get_trash, login_user,
    update_note, toggle_pin_note, toggle_favorite_note, restore_note,
    get_note_stats, permanently_delete_note, get_dashboard_data,
    share_note, get_shared_notes
)
from sqlalchemy.orm import Session
from auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

from schemas import (
    LoginResponse,
    NoteCreate,
    NoteResponse,
    NoteUpdate,
    NoteShareRequest,
    UserLogin,
    UserRegister,
    UserResponse
)


app = FastAPI()
router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://192.168.0.100:5173",
        "http://192.168.0.100:5174",
        "http://192.168.0.101:5173",
        "http://192.168.0.101:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    return create_user(db, user)


@router.get("/profile", response_model=UserResponse)
def profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get("/dashboard")
def dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_data(db, current_user)


@router.post("/login", response_model=LoginResponse)
def user_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = UserLogin(
        identifier=form_data.username,
        password=form_data.password
    )

    return login_user(db, user)


@router.post("/notes", response_model=NoteResponse)
def make_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_note(db, note, current_user)


@router.get("/notes", response_model=list[NoteResponse])
def fetch_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_notes(db, current_user)


@router.get("/trash", response_model=list[NoteResponse])
def fetch_trash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_trash(db, current_user)


@router.put("/trash/{note_id}/restore", response_model=NoteResponse)
def restore_deleted_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return restore_note(db, current_user, note_id)


@router.delete("/trash/{note_id}")
def permanently_delete(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return permanently_delete_note(db, current_user, note_id)


@router.put("/notes/{note_id}", response_model=NoteResponse)
def note_update(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_note(db, current_user, note, note_id)


@router.get("/notes/stats")
def note_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_note_stats(db, current_user)

@router.post("/notes/{note_id}/share")
def share_note_with_user(
    note_id: int,
    share_request: NoteShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return share_note(
        db,
        current_user,
        note_id,
        share_request.recipient
    )

@router.get("/notes/shared", response_model=list[NoteResponse])
def get_shared_notes_for_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_shared_notes(
        db,
        current_user
    )


@router.put("/notes/{note_id}/pin", response_model=NoteResponse)
def pin_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return toggle_pin_note(db, current_user, note_id)


@router.put("/notes/{note_id}/favorite", response_model=NoteResponse)
def favorite_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return toggle_favorite_note(db, current_user, note_id)


@router.delete("/notes/{note_id}")
def note_delete(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_note(db, current_user, note_id)


@router.get("/wellness/insights")
def wellness_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notes = get_notes(db, current_user)
    if not notes:
        return {"average_sentiment": 0.0, "status": "No notes yet", "total_analyzed": 0}
    
    scores = [n.sentiment_score for n in notes if n.sentiment_score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0.0

    status = "Calm & Balanced"
    if avg_score < -0.2:
        status = "Carrying Heavy Stress"
    elif avg_score > 0.3:
        status = "Positive & Uplifted"

    return {
        "average_sentiment": round(avg_score, 2),
        "status": status,
        "total_analyzed": len(scores)
    }


app.include_router(router)

Base.metadata.create_all(bind=engine)