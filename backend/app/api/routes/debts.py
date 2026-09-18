from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_db
from app.models.debt import Debt
from app.models.user import User
from app.schemas.debt import DebtCreate, DebtOut, DebtUpdate, PayoffPlan, PayoffRequest
from app.services.payoff import simulate_payoff

router = APIRouter()


@router.get("", response_model=list[DebtOut])
def list_debts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Debt).filter(Debt.user_id == user.id).order_by(Debt.id).all()


@router.post("", response_model=DebtOut, status_code=status.HTTP_201_CREATED)
def create_debt(payload: DebtCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debt = Debt(user_id=user.id, **payload.model_dump())
    db.add(debt)
    db.commit()
    db.refresh(debt)
    return debt


def _get_owned_debt(db: Session, user: User, debt_id: int) -> Debt:
    debt = db.query(Debt).filter(Debt.id == debt_id, Debt.user_id == user.id).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    return debt


@router.patch("/{debt_id}", response_model=DebtOut)
def update_debt(
    debt_id: int,
    payload: DebtUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    debt = _get_owned_debt(db, user, debt_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(debt, field, value)
    db.commit()
    db.refresh(debt)
    return debt


@router.delete("/{debt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_debt(debt_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debt = _get_owned_debt(db, user, debt_id)
    db.delete(debt)
    db.commit()


@router.post("/payoff-plan", response_model=PayoffPlan)
def payoff_plan(payload: PayoffRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    debts = db.query(Debt).filter(Debt.user_id == user.id).all()
    debt_dicts = [
        {
            "id": d.id,
            "name": d.name,
            "balance": d.balance,
            "interest_rate": d.interest_rate,
            "minimum_payment": d.minimum_payment,
        }
        for d in debts
    ]
    result = simulate_payoff(debt_dicts, payload.strategy, max(payload.extra_payment, 0.0))
    return result
