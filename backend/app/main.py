import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import accounts, auth, categories, dashboard, debts, forecast, recurring, transactions
from app.core.config import settings
from app.core.middleware import SecurityMiddleware
from app.db.base import Base
from app.db.session import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("runway")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Runway API",
    docs_url=None if settings.is_prod else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_prod else "/openapi.json",
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if not settings.is_prod:
    origins += ["http://localhost:5173", "http://127.0.0.1:5173"]

# Auth uses a bearer header, not cookies, so credentials are never needed cross-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)
app.add_middleware(SecurityMiddleware)

allowed_hosts = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]
if allowed_hosts:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.exception("unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse({"detail": "Something went wrong on our side."}, status_code=500)


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(debts.router, prefix="/debts", tags=["debts"])
app.include_router(recurring.router, prefix="/recurring", tags=["recurring"])
app.include_router(forecast.router, prefix="/forecast", tags=["forecast"])


@app.get("/health")
def health():
    return {"status": "ok"}
