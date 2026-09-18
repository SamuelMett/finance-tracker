import re
import statistics
from collections import Counter, defaultdict
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.models.recurring import RecurringSeries
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.recurring import RecurringCreate, RecurringOut, RecurringUpdate

router = APIRouter()

FREQUENCY_BUCKETS = [
    ("weekly", 5, 9),
    ("biweekly", 10, 18),
    ("monthly", 25, 35),
    ("yearly", 350, 380),
]


def _normalize(description: str) -> str:
    text = re.sub(r"[\d#*]+", "", description or "").strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def _classify_frequency(median_interval: float) -> str | None:
    for label, lo, hi in FREQUENCY_BUCKETS:
        if lo <= median_interval <= hi:
            return label
    return None


@router.get("", response_model=list[RecurringOut])
def list_recurring(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(RecurringSeries)
        .filter(RecurringSeries.user_id == user.id)
        .order_by(RecurringSeries.next_due_date.is_(None), RecurringSeries.next_due_date)
        .all()
    )


@router.post("", response_model=RecurringOut, status_code=status.HTTP_201_CREATED)
def create_recurring(
    payload: RecurringCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    series = RecurringSeries(user_id=user.id, source="manual", **payload.model_dump())
    db.add(series)
    db.commit()
    db.refresh(series)
    return series


def _get_owned_series(db: Session, user: User, series_id: int) -> RecurringSeries:
    series = (
        db.query(RecurringSeries)
        .filter(RecurringSeries.id == series_id, RecurringSeries.user_id == user.id)
        .first()
    )
    if not series:
        raise HTTPException(status_code=404, detail="Recurring item not found")
    return series


@router.patch("/{series_id}", response_model=RecurringOut)
def update_recurring(
    series_id: int,
    payload: RecurringUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    series = _get_owned_series(db, user, series_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(series, field, value)
    db.commit()
    db.refresh(series)
    return series


@router.delete("/{series_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurring(series_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    series = _get_owned_series(db, user, series_id)
    db.delete(series)
    db.commit()


@router.post("/detect")
def detect_recurring(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id, Transaction.kind == "expense")
        .order_by(Transaction.date)
        .all()
    )

    groups: dict[str, list[Transaction]] = defaultdict(list)
    for t in transactions:
        key = _normalize(t.description or "")
        if key:
            groups[key].append(t)

    existing = {
        _normalize(s.name): s
        for s in db.query(RecurringSeries).filter(RecurringSeries.user_id == user.id).all()
    }

    created = 0
    updated = 0

    for key, txs in groups.items():
        if len(txs) < 2:
            continue

        dates = sorted(t.date for t in txs)
        intervals = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
        intervals = [i for i in intervals if i > 0]
        if not intervals:
            continue

        median_interval = statistics.median(intervals)
        frequency = _classify_frequency(median_interval)
        if not frequency:
            continue

        amounts = [t.amount for t in txs]
        avg_amount = statistics.mean(amounts)
        relative_spread = (statistics.pstdev(amounts) / avg_amount) if avg_amount else 0
        if relative_spread > 0.3:
            continue

        last_date = dates[-1]
        next_due = last_date + timedelta(days=round(median_interval))

        account_id = Counter(t.account_id for t in txs).most_common(1)[0][0]
        category_ids = [t.category_id for t in txs if t.category_id]
        category_id = Counter(category_ids).most_common(1)[0][0] if category_ids else None

        display_name = max(txs, key=lambda t: t.date).description or key.title()

        existing_series = existing.get(key)
        if existing_series:
            if existing_series.status == "active":
                existing_series.amount = round(avg_amount, 2)
                existing_series.frequency = frequency
                existing_series.last_seen_date = last_date
                existing_series.next_due_date = next_due
                updated += 1
        else:
            series = RecurringSeries(
                user_id=user.id,
                name=display_name,
                amount=round(avg_amount, 2),
                frequency=frequency,
                next_due_date=next_due,
                last_seen_date=last_date,
                status="active",
                source="detected",
                account_id=account_id,
                category_id=category_id,
            )
            db.add(series)
            created += 1

    db.commit()

    all_series = (
        db.query(RecurringSeries)
        .filter(RecurringSeries.user_id == user.id)
        .order_by(RecurringSeries.next_due_date.is_(None), RecurringSeries.next_due_date)
        .all()
    )
    return {
        "created": created,
        "updated": updated,
        "series": [RecurringOut.model_validate(s) for s in all_series],
    }
