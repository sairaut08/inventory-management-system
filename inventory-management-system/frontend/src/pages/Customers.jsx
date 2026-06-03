import { useEffect, useState } from "react";
import API from "../api";

function Customers() {
    const [customers, setCustomers] = useState([]);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        const res = await API.get("/customers");
        setCustomers(res.data);
    };

    const addCustomer = async () => {
        await API.post("/customers", form);

        setForm({
            full_name: "",
            email: "",
            phone: "",
        });

        loadCustomers();
    };

    const deleteCustomer = async (id) => {
        await API.delete(`/customers/${id}`);
        loadCustomers();
    };

    return (
        <div>
            <h2>Customers</h2>

            <input
                className="form-control mb-2"
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                }
            />

            <input
                className="form-control mb-2"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
                className="form-control mb-2"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <button className="btn btn-success mb-4" onClick={addCustomer}>
                Add Customer
            </button>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {customers.map((c) => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.full_name}</td>
                            <td>{c.email}</td>
                            <td>{c.phone}</td>

                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => deleteCustomer(c.id)}
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

export default Customers;
