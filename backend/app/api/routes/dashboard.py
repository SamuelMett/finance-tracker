from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.models.account import Account
from app.models.category import Category
from app.models.debt import Debt
from app.models.recurring import RecurringSeries
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter()

MONTHLY_MULTIPLIER = {"weekly": 4.345, "biweekly": 2.1725, "monthly": 1.0, "yearly": 1 / 12}


@router.get("/summary")
def summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    month_start = today.replace(day=1)

    def total(kind: str, from_date=None):
        q = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
            Transaction.user_id == user.id, Transaction.kind == kind
        )
        if from_date is not None:
            q = q.filter(Transaction.date >= from_date)
        return q.scalar()

    total_income = total("income")
    total_expense = total("expense")

    month_income = total("income", month_start)
    month_expense = total("expense", month_start)

    starting_balances = (
        db.query(func.coalesce(func.sum(Account.starting_balance), 0.0))
        .filter(Account.user_id == user.id)
        .scalar()
    )
    net_worth = starting_balances + total_income - total_expense

    by_category = (
        db.query(
            Category.id,
            Category.name,
            Category.color,
            func.coalesce(func.sum(Transaction.amount), 0.0).label("total"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user.id,
            Transaction.kind == "expense",
            Transaction.date >= month_start,
        )
        .group_by(Category.id, Category.name, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    recent = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(8)
        .all()
    )

    total_debt = (
        db.query(func.coalesce(func.sum(Debt.balance), 0.0)).filter(Debt.user_id == user.id).scalar()
    )

    active_recurring = (
        db.query(RecurringSeries)
        .filter(RecurringSeries.user_id == user.id, RecurringSeries.status == "active")
        .all()
    )
    active_bills = [r for r in active_recurring if r.kind == "expense"]
    monthly_recurring_total = sum(r.amount * MONTHLY_MULTIPLIER.get(r.frequency, 1.0) for r in active_bills)

    soon = today + timedelta(days=14)
    upcoming_bills = sorted(
        (r for r in active_bills if r.next_due_date is not None and today <= r.next_due_date <= soon),
        key=lambda r: r.next_due_date,
    )[:8]

    return {
        "net_worth": net_worth,
        "total_debt": total_debt,
        "month_income": month_income,
        "month_expense": month_expense,
        "monthly_recurring_total": round(monthly_recurring_total, 2),
        "spend_by_category": [
            {"category_id": c.id, "name": c.name, "color": c.color, "total": c.total} for c in by_category
        ],
        "recent_transactions": [
            {
                "id": t.id,
                "account_id": t.account_id,
                "category_id": t.category_id,
                "kind": t.kind,
                "amount": t.amount,
                "description": t.description,
                "date": t.date.isoformat(),
            }
            for t in recent
        ],
        "upcoming_bills": [
            {
                "id": r.id,
                "name": r.name,
                "amount": r.amount,
                "frequency": r.frequency,
                "next_due_date": r.next_due_date.isoformat() if r.next_due_date else None,
            }
            for r in upcoming_bills
        ],
    }
