import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone

DB = os.path.join(tempfile.gettempdir(), "runway_security_test.db")
if os.path.exists(DB):
    os.remove(DB)
os.environ["DATABASE_URL"] = f"sqlite:///{DB}"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-0123456789abcdef"
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pyotp  # noqa: E402
import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from jose import jwt  # noqa: E402

from app.core import ratelimit  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)
GOOD_PW = "correct-horse-9"


@pytest.fixture(autouse=True)
def _reset():
    ratelimit.reset_all()
    yield


def register(email, pw=GOOD_PW):
    return client.post("/auth/register", json={"email": email, "password": pw})


def login(email, pw=GOOD_PW):
    return client.post("/auth/login", json={"email": email, "password": pw})


def auth(email):
    register(email)
    token = login(email).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_weak_passwords_rejected_server_side():
    for pw in ["short1", "password123", "aaaaaaaaaaaa", "onlyletterslong"]:
        assert register(f"weak{abs(hash(pw))}@x.com", pw).status_code == 422


def test_email_is_normalised_to_lowercase():
    register("MiXeD@Example.com")
    assert login("mixed@example.com").status_code == 200


def test_security_headers_present():
    r = client.get("/health")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"
    assert r.headers["referrer-policy"] == "no-referrer"
    assert "frame-ancestors 'none'" in r.headers["content-security-policy"]
    assert r.headers["cache-control"] == "no-store"


def test_login_lockout_after_repeated_failures():
    register("lock@x.com")
    for _ in range(settings.LOGIN_MAX_ATTEMPTS):
        assert login("lock@x.com", "wrong-password-1").status_code == 401
    r = login("lock@x.com")  # even the CORRECT password is refused while locked
    assert r.status_code == 429
    assert "Retry-After" in r.headers


def test_unknown_user_and_wrong_password_look_identical():
    register("real@x.com")
    a = login("real@x.com", "wrong-password-1")
    b = login("ghost@x.com", "wrong-password-1")
    assert a.status_code == b.status_code == 401
    assert a.json() == b.json()


def test_auth_endpoint_rate_limited(monkeypatch):
    monkeypatch.setattr(settings, "AUTH_RATE_LIMIT", 3)
    codes = [client.post("/auth/login", json={"email": f"n{i}@x.com", "password": "whatever-1"}).status_code for i in range(6)]
    assert 429 in codes


def test_oversized_body_rejected():
    r = client.post("/auth/login", content=b"x" * 2_000_000, headers={"Content-Type": "application/json"})
    assert r.status_code == 413


def test_forged_and_malformed_tokens_rejected():
    now = datetime.now(timezone.utc)
    base = {"sub": "a@x.com", "iss": settings.JWT_ISSUER, "exp": now + timedelta(minutes=5)}
    bad = [
        jwt.encode(base, "attacker-secret-attacker-secret-1234567", algorithm="HS256"),
        jwt.encode({**base, "iss": "someone-else"}, settings.JWT_SECRET_KEY, algorithm="HS256"),
        jwt.encode({**base, "exp": now - timedelta(minutes=1)}, settings.JWT_SECRET_KEY, algorithm="HS256"),
        jwt.encode({"sub": "a@x.com", "exp": now + timedelta(minutes=5)}, settings.JWT_SECRET_KEY, algorithm="HS256"),
        "not.a.jwt",
    ]
    for t in bad:
        assert client.get("/auth/me", headers={"Authorization": f"Bearer {t}"}).status_code == 401
    assert client.get("/auth/me").status_code == 401


def test_users_cannot_touch_each_others_data():
    a, b = auth("alice@x.com"), auth("bob@x.com")
    acc = client.post("/accounts", json={"name": "A", "type": "checking", "starting_balance": 10}, headers=a).json()

    assert client.patch(f"/accounts/{acc['id']}", json={"name": "pwn"}, headers=b).status_code == 404
    assert client.delete(f"/accounts/{acc['id']}", headers=b).status_code == 404
    assert client.get("/accounts", headers=b).json() == []

    tx = {"account_id": acc["id"], "kind": "expense", "amount": 5, "date": "2026-01-01"}
    assert client.post("/transactions", json=tx, headers=b).status_code == 400
    rec = {"name": "x", "amount": 5, "account_id": acc["id"]}
    assert client.post("/recurring", json=rec, headers=b).status_code == 400


def test_input_validation_rejects_garbage():
    h = auth("val@x.com")
    assert client.post("/accounts", json={"name": "", "type": "checking"}, headers=h).status_code == 422
    assert client.post("/accounts", json={"name": "x" * 500, "type": "checking"}, headers=h).status_code == 422
    assert client.post("/accounts", json={"name": "ok", "type": "<script>"}, headers=h).status_code == 422
    assert client.post("/categories", json={"name": "c", "color": "red; background:url(x)"}, headers=h).status_code == 422
    assert client.post("/debts", json={"name": "d", "balance": 1e15}, headers=h).status_code == 422
    assert client.post("/debts", json={"name": "d", "balance": 5, "due_day": 40}, headers=h).status_code == 422


def test_two_factor_cannot_be_disabled_with_token_alone():
    h = auth("tfa@x.com")
    secret = pyotp.parse_uri(client.post("/auth/2fa/setup", headers=h).json()["otp_uri"]).secret
    totp = pyotp.TOTP(secret)
    assert client.post("/auth/2fa/confirm", json={"code": totp.now()}, headers=h).status_code == 200

    assert client.post("/auth/2fa/setup", headers=h).status_code == 400  # can't silently re-enroll
    assert client.post("/auth/2fa/disable", json={"password": "wrong-password-1", "code": totp.now()}, headers=h).status_code == 401
    assert client.post("/auth/2fa/disable", headers=h).status_code == 422  # body required

    # an OTP can only be redeemed once
    first = client.post("/auth/login/2fa", json={"email": "tfa@x.com", "password": GOOD_PW, "otp": totp.now()})
    assert first.status_code == 200
    replay = client.post("/auth/login/2fa", json={"email": "tfa@x.com", "password": GOOD_PW, "otp": totp.now()})
    assert replay.status_code == 401


def test_api_docs_hidden_in_prod(monkeypatch):
    monkeypatch.setattr(settings, "ENV", "prod")
    assert settings.is_prod
