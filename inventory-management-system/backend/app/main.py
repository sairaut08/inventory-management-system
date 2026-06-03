from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Product, Customer, Order, OrderItem
from .schemas import ProductCreate, CustomerCreate, OrderCreate

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management System"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# PRODUCTS
# =========================

@app.post("/products")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Product)\
        .filter(Product.sku == product.sku)\
        .first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )

    if product.stock_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    new_product = Product(**product.model_dump())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@app.get("/products")
def get_products(
    db: Session = Depends(get_db)
):
    return db.query(Product).all()


@app.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product)\
        .filter(Product.id == product_id)\
        .first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Product)\
        .filter(Product.id == product_id)\
        .first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing.name = product.name
    existing.sku = product.sku
    existing.price = product.price
    existing.stock_quantity = product.stock_quantity

    db.commit()
    db.refresh(existing)

    return existing


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product)\
        .filter(Product.id == product_id)\
        .first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


# =========================
# CUSTOMERS
# =========================

@app.post("/customers")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Customer)\
        .filter(Customer.email == customer.email)\
        .first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_customer = Customer(**customer.model_dump())

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@app.get("/customers")
def get_customers(
    db: Session = Depends(get_db)
):
    return db.query(Customer).all()


@app.get("/customers/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer)\
        .filter(Customer.id == customer_id)\
        .first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


@app.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer)\
        .filter(Customer.id == customer_id)\
        .first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully"
    }


# =========================
# ORDERS
# =========================

@app.post("/orders")
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer)\
        .filter(Customer.id == order.customer_id)\
        .first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    total_amount = 0

    new_order = Order(
        customer_id=order.customer_id,
        total_amount=0
    )

    db.add(new_order)
    db.flush()

    for item in order.items:

        product = db.query(Product)\
            .filter(Product.id == item.product_id)\
            .first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}"
            )

        product.stock_quantity -= item.quantity

        subtotal = product.price * item.quantity

        total_amount += subtotal

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

    new_order.total_amount = total_amount

    db.commit()
    db.refresh(new_order)

    return {
        "order_id": new_order.id,
        "total_amount": total_amount
    }


@app.get("/orders")
def get_orders(
    db: Session = Depends(get_db)
):
    return db.query(Order).all()


@app.get("/orders/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "total_amount": order.total_amount,
        "items": [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in order.items
        ],
    }


@app.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order)\
        .filter(Order.id == order_id)\
        .first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Order deleted successfully"
    }


# =========================
# DASHBOARD
# =========================

@app.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db)
):
    total_products = db.query(Product).count()

    total_customers = db.query(Customer).count()

    total_orders = db.query(Order).count()

    low_stock_products = db.query(Product)\
        .filter(Product.stock_quantity < 5)\
        .count()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }