import { useEffect, useState } from "react";
import API from "../api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [customerId, setCustomerId] = useState("");
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");

    useEffect(() => {
        loadOrders();
        loadCustomers();
        loadProducts();
    }, []);

    const loadOrders = async () => {
        const res = await API.get("/orders");
        setOrders(res.data);
    };

    const loadCustomers = async () => {
        const res = await API.get("/customers");
        setCustomers(res.data);
    };

    const loadProducts = async () => {
        const res = await API.get("/products");
        setProducts(res.data);
    };

    const createOrder = async () => {
        setError("");
        setMessage("");

        if (!customerId) {
            setError("Please select customer");
            return;
        }

        if (!productId) {
            setError("Please select product");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Quantity must be greater than 0");
            return;
        }

        try {
            await API.post("/orders", {
                customer_id: Number(customerId),
                items: [
                    {
                        product_id: Number(productId),
                        quantity: Number(quantity),
                    },
                ],
            });

            setMessage("Order created successfully");

            setCustomerId("");
            setProductId("");
            setQuantity("");

            loadOrders();
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create order");
        }
    };

    const viewOrder = async (id) => {
        try {
            const res = await API.get(`/orders/${id}`);
            setSelectedOrder(res.data);
        } catch {
            setError("Unable to load order details");
        }
    };

    return (
        <div>
            <h2>Orders</h2>

            {message && <div className="alert alert-success">{message}</div>}

            {error && <div className="alert alert-danger">{error}</div>}

            <select
                className="form-control mb-2"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
            >
                <option value="">Select Customer</option>

                {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.full_name}
                    </option>
                ))}
            </select>

            <select
                className="form-control mb-2"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
            >
                <option value="">Select Product</option>

                {products.map((p) => (
                    <option key={p.id} value={p.id}>
                        {p.name}
                    </option>
                ))}
            </select>

            <input
                type="number"
                className="form-control mb-2"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
            />

            <button className="btn btn-primary mb-4" onClick={createOrder}>
                Create Order
            </button>

            <table className="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer ID</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((o) => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.customer_id}</td>
                            <td>{o.total_amount}</td>

                            <td>
                                <button
                                    className="btn btn-info"
                                    onClick={() => viewOrder(o.id)}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedOrder && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h4>Order #{selectedOrder.id}</h4>

                        <p>Customer ID: {selectedOrder.customer_id}</p>

                        <p>Total Amount: ₹{selectedOrder.total_amount}</p>

                        <h5>Items</h5>

                        <ul>
                            {selectedOrder.items?.map((item, index) => (
                                <li key={index}>
                                    Product ID: {item.product_id}
                                    {" | "}
                                    Qty: {item.quantity}
                                    {" | "}
                                    Price: ₹{item.price}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;
