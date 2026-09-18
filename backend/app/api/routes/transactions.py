from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionUpdate

router = APIRouter()


def _check_account(db: Session, user: User, account_id: int):
    if not db.query(Account).filter(Account.id == account_id, Account.user_id == user.id).first():
        raise HTTPException(status_code=400, detail="Invalid account")


def _check_category(db: Session, user: User, category_id: int | None):
    if category_id is None:
        return
    if not db.query(Category).filter(Category.id == category_id, Category.user_id == user.id).first():
        raise HTTPException(status_code=400, detail="Invalid category")


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    account_id: int | None = None,
    category_id: int | None = None,
    kind: str | None = None,
    start_date: date_type | None = Query(None),
    end_date: date_type | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Transaction).filter(Transaction.user_id == user.id)
    if account_id is not None:
        q = q.filter(Transaction.account_id == account_id)
    if category_id is not None:
        q = q.filter(Transaction.category_id == category_id)
    if kind is not None:
        q = q.filter(Transaction.kind == kind)
    if start_date is not None:
        q = q.filter(Transaction.date >= start_date)
    if end_date is not None:
        q = q.filter(Transaction.date <= end_date)
    return q.order_by(Transaction.date.desc(), Transaction.id.desc()).all()


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _check_account(db, user, payload.account_id)
    _check_category(db, user, payload.category_id)

    transaction = Transaction(user_id=user.id, **payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def _get_owned_transaction(db: Session, user: User, transaction_id: int) -> Transaction:
    transaction = (
        db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user.id).first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = _get_owned_transaction(db, user, transaction_id)
    data = payload.model_dump(exclude_unset=True)

    if "account_id" in data:
        _check_account(db, user, data["account_id"])
    if "category_id" in data:
        _check_category(db, user, data["category_id"])

    for field, value in data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    transaction = _get_owned_transaction(db, user, transaction_id)
    db.delete(transaction)
    db.commit()
