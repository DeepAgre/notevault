from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from database import get_db
from models import User
from sqlalchemy.orm import Session


load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)


if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def verify_access_token(
    token: str,
    db: Session
):
    try:
        decoded_jwt = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_identifier = decoded_jwt.get("sub")

        if not user_identifier:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        db_user = (
            db.query(User)
            .filter(User.email == user_identifier)
            .first()
        )

        if not db_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return db_user

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    return verify_access_token(token, db)

