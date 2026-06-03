from pydantic import BaseModel
from pydantic import EmailStr
from typing import List


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    stock_quantity: int


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class CustomerResponse(CustomerCreate):
    id: int

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]