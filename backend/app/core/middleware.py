import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core import ratelimit
from app.core.config import settings

log = logging.getLogger("runway.security")

DOC_PATHS = ("/docs", "/redoc", "/openapi.json")


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


class SecurityMiddleware(BaseHTTPMiddleware):
    """Body-size cap, per-IP rate limiting, and hardened response headers."""

    async def dispatch(self, request: Request, call_next):
        ip = client_ip(request)
        path = request.url.path

        try:
            declared = int(request.headers.get("content-length", "0"))
        except ValueError:
            declared = 0
        if declared > settings.MAX_BODY_BYTES:
            return JSONResponse({"detail": "Request body too large"}, status_code=413)

        if request.method != "OPTIONS":
            is_auth = path.startswith("/auth/login") or path.startswith("/auth/register")
            key, limit = (f"auth:{ip}", settings.AUTH_RATE_LIMIT) if is_auth else (f"api:{ip}", settings.API_RATE_LIMIT)
            if not ratelimit.allow(key, limit):
                log.warning("rate limit hit ip=%s path=%s", ip, path)
                return JSONResponse(
                    {"detail": "Too many requests. Slow down and try again shortly."},
                    status_code=429,
                    headers={"Retry-After": "60"},
                )

        response = await call_next(request)

        h = response.headers
        h["X-Content-Type-Options"] = "nosniff"
        h["X-Frame-Options"] = "DENY"
        h["Referrer-Policy"] = "no-referrer"
        h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        h["Cross-Origin-Opener-Policy"] = "same-origin"
        h["Cross-Origin-Resource-Policy"] = "same-site"
        if not path.startswith(DOC_PATHS):
            h["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
            h["Cache-Control"] = "no-store"
            h["Pragma"] = "no-cache"
        if settings.is_prod:
            h["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response
