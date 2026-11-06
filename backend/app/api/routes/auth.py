import base64
import io
import logging

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.core import ratelimit
from app.core.middleware import client_ip
from app.core.security import create_access_token, hash_password, verify_password, verify_password_or_dummy
from app.models.user import User
from app.schemas.auth import Login2FARequest, LoginRequest, TwoFactorConfirm, TwoFactorDisable
from app.schemas.user import UserCreate, UserOut

router = APIRouter()
log = logging.getLogger("runway.security")

INVALID_LOGIN = "Invalid email or password"


def _lock_guard(identity: str) -> None:
    remaining = ratelimit.is_locked(identity)
    if remaining:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {max(1, remaining // 60)} minute(s).",
            headers={"Retry-After": str(remaining)},
        )


def _fail(identity: str, detail: str, request: Request, what: str) -> HTTPException:
    ratelimit.record_failure(identity)
    log.warning("%s failed ip=%s", what, client_ip(request))
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _check_totp(user: User, code: str) -> bool:
    if not user.twofa_secret or ratelimit.otp_already_used(user.id, code):
        return False
    return pyotp.TOTP(user.twofa_secret).verify(code, valid_window=1)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    identity = f"{payload.email}|{client_ip(request)}"
    _lock_guard(identity)
    if not ratelimit.allow(f"login-email:{payload.email}", 10):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts. Slow down.")

    user = db.query(User).filter(User.email == payload.email).first()
    if not verify_password_or_dummy(payload.password, user.password_hash if user else None):
        raise _fail(identity, INVALID_LOGIN, request, "login")

    if user.twofa_enabled:
        return {
            "access_token": None,
            "token_type": "bearer",
            "twofa_enabled": True,
            "requires_2fa": True,
            "message": "2FA code required",
        }

    ratelimit.clear_failures(identity)
    return {
        "access_token": create_access_token(subject=user.email),
        "token_type": "bearer",
        "twofa_enabled": False,
        "requires_2fa": False,
    }


@router.post("/login/2fa")
def login_2fa(payload: Login2FARequest, request: Request, db: Session = Depends(get_db)):
    identity = f"{payload.email}|{client_ip(request)}"
    _lock_guard(identity)

    user = db.query(User).filter(User.email == payload.email).first()
    if not verify_password_or_dummy(payload.password, user.password_hash if user else None):
        raise _fail(identity, INVALID_LOGIN, request, "login (2fa step)")

    if not user.twofa_enabled or not _check_totp(user, payload.otp):
        raise _fail(identity, "Invalid or expired 2FA code", request, "2fa code")

    ratelimit.clear_failures(identity)
    return {
        "access_token": create_access_token(subject=user.email),
        "token_type": "bearer",
        "twofa_enabled": True,
        "requires_2fa": False,
    }


@router.post("/2fa/setup")
def twofa_setup(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Generates a TOTP secret + QR code. 2FA stays off until the code is confirmed."""
    if user.twofa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled. Disable it first to re-enroll.")

    secret = pyotp.random_base32()
    user.twofa_secret = secret
    db.commit()

    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="Runway")
    buf = io.BytesIO()
    qrcode.make(otp_uri).save(buf, format="PNG")

    return {
        "otp_uri": otp_uri,
        "qr_png_base64": base64.b64encode(buf.getvalue()).decode("utf-8"),
        "message": "Scan QR in authenticator app, then confirm with a 6-digit code.",
    }


@router.post("/2fa/confirm")
def twofa_confirm(payload: TwoFactorConfirm, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    identity = f"2fa-confirm:{user.id}"
    _lock_guard(identity)
    if not user.twofa_secret:
        raise HTTPException(status_code=400, detail="2FA is not set up yet")
    if not pyotp.TOTP(user.twofa_secret).verify(payload.code, valid_window=1):
        ratelimit.record_failure(identity)
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    user.twofa_enabled = True
    db.commit()
    ratelimit.clear_failures(identity)
    return {"message": "2FA enabled successfully", "twofa_enabled": True}


@router.post("/2fa/disable")
def twofa_disable(
    payload: TwoFactorDisable,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Needs the password AND a live code, so a stolen session token alone can't switch 2FA off."""
    identity = f"2fa-disable:{user.id}"
    _lock_guard(identity)
    if not user.twofa_enabled:
        raise HTTPException(status_code=400, detail="2FA is not enabled")
    if not verify_password(payload.password, user.password_hash) or not _check_totp(user, payload.code):
        raise _fail(identity, "Password or code is incorrect", request, "2fa disable")

    user.twofa_enabled = False
    user.twofa_secret = None
    db.commit()
    ratelimit.clear_failures(identity)
    return {"message": "2FA disabled", "twofa_enabled": False}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
