import os
import joblib
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from database import engine, Base, get_db
from models import User, Note, Feedback
from crud import (
    create_note, create_user, delete_note, get_notes, get_trash, login_user,
    update_note, toggle_pin_note, toggle_favorite_note, restore_note,
    get_note_stats, permanently_delete_note, get_dashboard_data,
    share_note, get_shared_notes, get_feedbacks, create_feedback
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
    UserResponse,
    FeedbackCreate,
    FeedbackResponse
)
from pydantic import BaseModel

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

# --- LOAD LOCAL MACHINE LEARNING SENTIMENT MODEL ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "sentiment_model.pkl")

try:
    ml_model = joblib.load(MODEL_PATH)
    print("ML Model loaded successfully from:", MODEL_PATH)
except Exception as e:
    ml_model = None
    print(f"Warning: Could not load sentiment model from {MODEL_PATH}: {e}")

class SentimentRequest(BaseModel):
    content: str


@router.post("/register", response_model=UserResponse)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/profile", response_model=UserResponse)
def profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/dashboard")
def dashboard_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Auto-backfill sentiment for any existing old notes that lack a band
    notes = get_notes(db, current_user)
    if ml_model:
        for note in notes:
            if not note.sentiment_band:
                try:
                    pred = ml_model.predict([note.content])[0]
                    prob = float(max(ml_model.predict_proba([note.content])[0]))
                    note.sentiment_band = pred
                    note.sentiment_score = prob
                    db.commit()
                except Exception:
                    pass

    return get_dashboard_data(db, current_user)


@router.post("/login", response_model=LoginResponse)
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = UserLogin(identifier=form_data.username, password=form_data.password)
    return login_user(db, user)


@router.post("/notes", response_model=NoteResponse)
def make_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Run ML Model on note content upon creation
    band = "Reflecting & Processing"
    score = 0.5
    if ml_model:
        try:
            full_text = f"{note.title} {note.content}"
            band = ml_model.predict([full_text])[0]
            score = float(max(ml_model.predict_proba([full_text])[0]))
        except Exception as e:
            print("ML prediction error on note creation:", e)

    # Create note with AI sentiment fields populated
    db_note = Note(
        title=note.title,
        content=note.content,
        user_id=current_user.id,
        sentiment_band=band,
        sentiment_score=score
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/notes", response_model=list[NoteResponse])
def fetch_notes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notes = get_notes(db, current_user)
    # Lazy backfill for old notes missing sentiment
    if ml_model:
        for note in notes:
            if not note.sentiment_band:
                try:
                    note.sentiment_band = ml_model.predict([note.content])[0]
                    note.sentiment_score = float(max(ml_model.predict_proba([note.content])[0]))
                    db.commit()
                except Exception:
                    pass
    return notes


@router.get("/trash", response_model=list[NoteResponse])
def fetch_trash(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_trash(db, current_user)


@router.put("/trash/{note_id}/restore", response_model=NoteResponse)
def restore_deleted_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return restore_note(db, current_user, note_id)


@router.delete("/trash/{note_id}")
def permanently_delete(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return permanently_delete_note(db, current_user, note_id)


@router.put("/notes/{note_id}", response_model=NoteResponse)
def note_update(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = update_note(db, current_user, note, note_id)
    # Re-run ML if content changed
    if ml_model and updated and note.content:
        try:
            updated.sentiment_band = ml_model.predict([note.content])[0]
            updated.sentiment_score = float(max(ml_model.predict_proba([note.content])[0]))
            db.commit()
            db.refresh(updated)
        except Exception:
            pass
    return updated


@router.get("/notes/stats")
def note_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_note_stats(db, current_user)


@router.post("/notes/{note_id}/share")
def share_note_with_user(
    note_id: int,
    share_request: NoteShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return share_note(db, current_user, note_id, share_request.recipient)


@router.get("/notes/shared", response_model=list[NoteResponse])
def get_shared_notes_for_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_shared_notes(db, current_user)


@router.put("/notes/{note_id}/pin", response_model=NoteResponse)
def pin_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return toggle_pin_note(db, current_user, note_id)


@router.put("/notes/{note_id}/favorite", response_model=NoteResponse)
def favorite_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return toggle_favorite_note(db, current_user, note_id)


@router.delete("/notes/{note_id}")
def note_delete(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return delete_note(db, current_user, note_id)


# --- STANDALONE AI/ML SENTIMENT ANALYSIS ENDPOINT ---
@router.post("/analyze-sentiment")
def analyze_sentiment(entry: SentimentRequest, current_user: User = Depends(get_current_user)):
    if not ml_model:
        raise HTTPException(status_code=500, detail="ML sentiment model is not initialized on the server.")
    
    predicted_band = ml_model.predict([entry.content])[0]
    probabilities = ml_model.predict_proba([entry.content])[0]
    confidence = float(max(probabilities))
    
    return {
        "text": entry.content,
        "emotional_spectrum_band": predicted_band,
        "confidence_score": round(confidence, 2),
        "engine": "Trained ML Classifier (Scikit-Learn)"
    }


@router.get("/wellness/insights")
def wellness_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notes = get_notes(db, current_user)
    if not notes:
        return {"average_sentiment": 0.0, "status": "No notes yet", "total_analyzed": 0}
    
    # Calculate counts based on ML sentiment bands across all notes (old and new!)
    heavy_count = sum(1 for n in notes if n.sentiment_band == "Carrying Heavy Weight")
    light_count = sum(1 for n in notes if n.sentiment_band == "Grounded & Light")
    total = len(notes)

    status = "Calm & Balanced"
    if heavy_count > light_count:
        status = "Carrying Heavy Stress"
    elif light_count > heavy_count:
        status = "Positive & Uplifted"

    return {
        "status": status,
        "total_analyzed": total,
        "heavy_reflections": heavy_count,
        "grounded_reflections": light_count
    }


# --- FEEDBACK ENDPOINTS ---

@router.get("/feedbacks", response_model=list[FeedbackResponse])
def fetch_feedbacks(db: Session = Depends(get_db)):
    return get_feedbacks(db)


@router.post("/feedbacks", response_model=FeedbackResponse)
def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    return create_feedback(db, feedback)


app.include_router(router)

Base.metadata.create_all(bind=engine)