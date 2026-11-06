"""In-memory abuse protection: per-IP sliding-window rate limits and login lockout.

State lives in process memory, which is right for a single-instance deployment.
Behind multiple workers or instances, swap the dicts for Redis.
"""

import threading
import time
from collections import defaultdict, deque

from app.core.config import settings

_lock = threading.Lock()
_hits: dict[str, deque] = defaultdict(deque)
_failures: dict[str, deque] = defaultdict(deque)
_used_otps: dict[tuple, float] = {}


def allow(key: str, limit: int, window: int = 60) -> bool:
    """Sliding-window limiter. Returns False once `limit` hits land inside `window` seconds."""
    now = time.monotonic()
    with _lock:
        q = _hits[key]
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit:
            return False
        q.append(now)
        return True


def is_locked(identity: str) -> int:
    """Seconds of lockout remaining for this identity (0 when not locked)."""
    now = time.monotonic()
    window = settings.LOGIN_LOCKOUT_SECONDS
    with _lock:
        q = _failures[identity]
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= settings.LOGIN_MAX_ATTEMPTS:
            return int(window - (now - q[0])) + 1
        return 0


def record_failure(identity: str) -> None:
    with _lock:
        _failures[identity].append(time.monotonic())


def clear_failures(identity: str) -> None:
    with _lock:
        _failures.pop(identity, None)


def otp_already_used(user_id: int, code: str) -> bool:
    """TOTP replay protection: a code may be redeemed once within its validity window."""
    now = time.monotonic()
    with _lock:
        for k in [k for k, t in _used_otps.items() if now - t > 120]:
            del _used_otps[k]
        key = (user_id, code)
        if key in _used_otps:
            return True
        _used_otps[key] = now
        return False


def reset_all() -> None:
    """Test helper."""
    with _lock:
        _hits.clear()
        _failures.clear()
        _used_otps.clear()
