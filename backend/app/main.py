import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.session import engine
from app.api.routes import accounts, auth, categories, dashboard, debts, recurring, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Tracker API")

raw = os.getenv("CORS_ORIGINS", "")
origins = [o.strip() for o in raw.split(",") if o.strip()]

# optional: allow localhost during dev
if os.getenv("ENV", "").lower() != "prod":
    origins += ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(debts.router, prefix="/debts", tags=["debts"])
app.include_router(recurring.router, prefix="/recurring", tags=["recurring"])


@app.get("/health")
def health():
    return {"status": "ok"}
