import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
    const [data, setData] = useState({});

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        const res = await API.get("/dashboard");
        setData(res.data);
    };

    return (
        <div>
            <h2>Dashboard</h2>

            <div className="row">
                <div className="col-md-3">
                    <div className="card p-3">
                        <h5>Total Products</h5>
                        <h3>{data.total_products || 0}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3">
                        <h5>Total Customers</h5>
                        <h3>{data.total_customers || 0}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3">
                        <h5>Total Orders</h5>
                        <h3>{data.total_orders || 0}</h3>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card p-3">
                        <h5>Low Stock</h5>
                        <h3>{data.low_stock_products || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
