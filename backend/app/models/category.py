from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    kind = Column(String, nullable=False, default="expense")  # income, expense
    color = Column(String, nullable=False, default="#6366f1")

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
