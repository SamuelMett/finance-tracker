from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.models.account import Account
from app.models.debt import Debt
from app.models.recurring import RecurringSeries
from app.models.transaction import Transaction
from app.models.user import User
from app.services.forecast import build_forecast

router = APIRouter()


@router.get("/daily")
def daily_forecast(
    days: int = Query(60, ge=7, le=180),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = db.query(Account).filter(Account.user_id == user.id).all()
    starting_balance = 0.0
    for account in accounts:
        income = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.account_id == account.id, Transaction.kind == "income")
            .scalar()
        )
        expense = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.account_id == account.id, Transaction.kind == "expense")
            .scalar()
        )
        starting_balance += account.starting_balance + income - expense

    recurring = (
        db.query(RecurringSeries)
        .filter(
            RecurringSeries.user_id == user.id,
            RecurringSeries.status == "active",
            RecurringSeries.next_due_date.isnot(None),
        )
        .all()
    )
    recurring_items = [
        {"id": r.id, "name": r.name, "kind": r.kind, "amount": r.amount, "frequency": r.frequency, "next_due_date": r.next_due_date}
        for r in recurring
    ]

    debts = db.query(Debt).filter(Debt.user_id == user.id).all()
    debt_items = [
        {"id": d.id, "name": d.name, "minimum_payment": d.minimum_payment, "due_day": d.due_day} for d in debts
    ]

    return build_forecast(starting_balance, recurring_items, debt_items, date.today(), days)
