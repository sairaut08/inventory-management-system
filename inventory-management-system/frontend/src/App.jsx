import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";

function App() {
    return (
        <BrowserRouter>
            <div className="container mt-4">
                <h1 className="mb-4">Inventory Management System</h1>

                <nav className="mb-4">
                    <Link className="btn btn-primary me-2" to="/">
                        Dashboard
                    </Link>

                    <Link className="btn btn-success me-2" to="/products">
                        Products
                    </Link>

                    <Link className="btn btn-warning me-2" to="/customers">
                        Customers
                    </Link>

                    <Link className="btn btn-info" to="/orders">
                        Orders
                    </Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="/products" element={<Products />} />

                    <Route path="/customers" element={<Customers />} />

                    <Route path="/orders" element={<Orders />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
