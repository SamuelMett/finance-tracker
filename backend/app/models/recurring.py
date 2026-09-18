from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class RecurringSeries(Base):
    __tablename__ = "recurring_series"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    name = Column(String, nullable=False)
    kind = Column(String, nullable=False, default="expense")  # income, expense
    amount = Column(Float, nullable=False)
    frequency = Column(String, nullable=False, default="monthly")  # weekly, biweekly, monthly, yearly
    next_due_date = Column(Date, nullable=True)
    last_seen_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="active")  # active, cancelled
    source = Column(String, nullable=False, default="detected")  # detected, manual

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="recurring_series")
    account = relationship("Account")
    category = relationship("Category")
