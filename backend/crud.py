from models import User, Note, NoteShare
from schemas import NoteCreate, NoteUpdate, UserRegister, UserLogin
from auth import hash_password, verify_password, create_access_token
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta


def create_user(db: Session, user: UserRegister):

    email = user.email.strip().lower()
    username = user.username.strip()

    if not username or not email or not user.password:
        raise HTTPException(
            status_code=400,
            detail="All fields are required"
        )

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    existing_username = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(db: Session, user: UserLogin):

    identifier = user.identifier.strip()

    if not identifier or not user.password:
        raise HTTPException(
            status_code=400,
            detail="Username/email and password are required"
        )

    db_user = (
        db.query(User)
        .filter(
            (User.email == identifier.lower()) |
            (User.username == identifier)
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password"
        )

    access_token = create_access_token({
        "sub": db_user.email
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


def create_note(
    db: Session,
    note: NoteCreate,
    current_user: User
):

    new_note = Note(
        title=note.title,
        content=note.content,
        owner_id=current_user.id
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


def get_notes(
    db: Session,
    current_user: User
):

    all_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .all()
    )

    return all_notes


def get_trash(
    db: Session,
    current_user: User
):

    trash_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == True
        )
        .all()
    )

    return trash_notes


def restore_note(
    db: Session,
    current_user: User,
    note_id: int
):

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == True
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Deleted note not found"
        )

    note.is_deleted = False
    note.deleted_at = None

    db.commit()
    db.refresh(note)

    return note


def permanently_delete_note(
    db: Session,
    current_user: User,
    note_id: int
):

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == True
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Deleted note not found"
        )

    db.delete(note)
    db.commit()

    return {
        "message": "Note permanently deleted"
    }


def update_note(
    db: Session,
    current_user: User,
    note: NoteUpdate,
    note_id: int
):

    existing_note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .first()
    )

    if not existing_note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    existing_note.title = note.title
    existing_note.content = note.content
    existing_note.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(existing_note)

    return existing_note


def delete_note(
    db: Session,
    current_user: User,
    note_id: int
):

    note_exists = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .first()
    )

    if not note_exists:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note_exists.is_deleted = True
    note_exists.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(note_exists)

    return note_exists


def toggle_pin_note(
    db,
    current_user,
    note_id
):

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.pinned = not note.pinned

    db.commit()
    db.refresh(note)

    return note


def toggle_favorite_note(
    db,
    current_user,
    note_id
):

    note = (
        db.query(Note)
        .filter(
            Note.id == note_id,
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .first()
    )

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.favorite = not note.favorite

    db.commit()
    db.refresh(note)

    return note


def delete_expired_notes(db: Session):

    expiry_time = (
        datetime.now(timezone.utc)
        - timedelta(days=30)
    )

    expired_notes = (
        db.query(Note)
        .filter(
            Note.is_deleted == True,
            Note.deleted_at <= expiry_time
        )
        .all()
    )

    for note in expired_notes:
        db.delete(note)

    db.commit()

    return len(expired_notes)


def get_note_stats(
    db: Session,
    current_user: User
):

    total_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == False
        )
        .count()
    )

    favorite_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == False,
            Note.favorite == True
        )
        .count()
    )

    pinned_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == False,
            Note.pinned == True
        )
        .count()
    )

    trash_notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.is_deleted == True
        )
        .count()
    )

    return {
        "total_notes": total_notes,
        "favorite_notes": favorite_notes,
        "pinned_notes": pinned_notes,
        "trash_notes": trash_notes
    }

def get_dashboard_data(db, current_user):
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
        },
        "notes": get_notes(db, current_user),
        "stats": get_note_stats(db, current_user),
    }

def share_note(db: Session, current_user: User, note_id: int, recipient: str):
    recipient = recipient.strip()

    # Verify that the note belongs to the sender
    original_note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id,
        Note.is_deleted == False
    ).first()

    if not original_note:
        raise HTTPException(status_code=404, detail="Note not found")

    # Find recipient by username or email
    recipient_user = db.query(User).filter(
        (User.email == recipient.lower()) |
        (User.username == recipient)
    ).first()

    if not recipient_user:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Prevent sharing with yourself
    if recipient_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot share a note with yourself"
        )

    # Create an independent copy for the recipient
    copied_note = Note(
        title=original_note.title,
        content=original_note.content,
        owner_id=recipient_user.id,
        pinned=False,
        favorite=False,
        is_deleted=False
    )

    db.add(copied_note)
    db.commit()
    db.refresh(copied_note)

    # Keep a record of the sharing event
    new_share = NoteShare(
        note_id=original_note.id,
        sender_id=current_user.id,
        recipient_id=recipient_user.id
    )

    db.add(new_share)
    db.commit()
    db.refresh(new_share)

    return {
        "message": "Note copied and shared successfully",
        "recipient": recipient_user.username,
        "new_note_id": copied_note.id
    }

def get_shared_notes(db: Session, current_user: User):
    shared_notes = db.query(Note).join(
        NoteShare,
        NoteShare.note_id == Note.id
    ).filter(
        NoteShare.recipient_id == current_user.id,
        Note.is_deleted == False
    ).all()

    return shared_notes