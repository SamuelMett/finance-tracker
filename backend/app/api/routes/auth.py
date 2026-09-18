import base64
import io

import pyotp
import qrcode
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import Login2FARequest, LoginRequest
from app.schemas.user import UserCreate, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # If 2FA is enabled, do NOT issue token yet
    if user.twofa_enabled:
        return {
            "access_token": None,
            "token_type": "bearer",
            "twofa_enabled": True,
            "requires_2fa": True,
            "message": "2FA code required",
        }

    token = create_access_token(subject=user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "twofa_enabled": False,
        "requires_2fa": False,
    }


@router.post("/login/2fa")
def login_2fa(payload: Login2FARequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.twofa_enabled or not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA is not enabled for this account")

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(payload.otp):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid 2FA code")

    token = create_access_token(subject=user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "twofa_enabled": True,
        "requires_2fa": False,
    }


@router.post("/2fa/setup")
def twofa_setup(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generates a TOTP secret + QR code. Stores secret but does NOT enable 2FA until confirmed."""
    secret = pyotp.random_base32()
    user.twofa_secret = secret
    user.twofa_enabled = False

    db.commit()
    db.refresh(user)

    issuer = "Finance Tracker"
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=issuer)

    img = qrcode.make(otp_uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "otp_uri": otp_uri,
        "qr_png_base64": qr_b64,
        "message": "Scan QR in authenticator app, then confirm with a 6-digit code.",
    }


@router.post("/2fa/confirm")
def twofa_confirm(
    code: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA is not set up yet")

    totp = pyotp.TOTP(user.twofa_secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    user.twofa_enabled = True

    db.commit()
    db.refresh(user)

    return {"message": "2FA enabled successfully", "twofa_enabled": True}


@router.post("/2fa/disable")
def twofa_disable(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.twofa_enabled = False
    user.twofa_secret = None

    db.commit()
    db.refresh(user)

    return {"message": "2FA disabled", "twofa_enabled": False}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
