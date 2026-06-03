import { useEffect, useState } from "react";
import API from "../api";

function Products() {
    const [products, setProducts] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        sku: "",
        price: "",
        stock_quantity: "",
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const res = await API.get("/products");
        setProducts(res.data);
    };

    const validateForm = () => {
        if (!form.name.trim()) return "Product name is required";
        if (!form.sku.trim()) return "SKU is required";
        if (!form.price || Number(form.price) <= 0)
            return "Price must be greater than 0";
        if (Number(form.stock_quantity) < 0) return "Stock cannot be negative";

        return null;
    };

    const saveProduct = async () => {
        setError("");
        setMessage("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                stock_quantity: Number(form.stock_quantity),
            };

            if (editingId) {
                await API.put(`/products/${editingId}`, payload);
                setMessage("Product updated successfully");
            } else {
                await API.post("/products", payload);
                setMessage("Product added successfully");
            }

            setForm({
                name: "",
                sku: "",
                price: "",
                stock_quantity: "",
            });

            setEditingId(null);

            loadProducts();
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong");
        }
    };

    const editProduct = (product) => {
        setEditingId(product.id);

        setForm({
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock_quantity: product.stock_quantity,
        });
    };

    const deleteProduct = async (id) => {
        try {
            await API.delete(`/products/${id}`);
            setMessage("Product deleted successfully");
            loadProducts();
        } catch {
            setError("Failed to delete product");
        }
    };

    return (
        <div>
            <h2>Products</h2>

            {message && <div className="alert alert-success">{message}</div>}

            {error && <div className="alert alert-danger">{error}</div>}

            <input
                className="form-control mb-2"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                    setForm({
                        ...form,
                        name: e.target.value,
                    })
                }
            />

            <input
                className="form-control mb-2"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) =>
                    setForm({
                        ...form,
                        sku: e.target.value,
                    })
                }
            />

            <input
                type="number"
                className="form-control mb-2"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                    setForm({
                        ...form,
                        price: e.target.value,
                    })
                }
            />

            <input
                type="number"
                className="form-control mb-2"
                placeholder="Stock"
                value={form.stock_quantity}
                onChange={(e) =>
                    setForm({
                        ...form,
                        stock_quantity: e.target.value,
                    })
                }
            />

            <button className="btn btn-success mb-4" onClick={saveProduct}>
                {editingId ? "Update Product" : "Add Product"}
            </button>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{p.price}</td>
                            <td>{p.stock_quantity}</td>

                            <td>
                                <button
                                    className="btn btn-warning me-2"
                                    onClick={() => editProduct(p)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => deleteProduct(p.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Products;
