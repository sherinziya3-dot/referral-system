

import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import SalesLogin from "./pages/SalesLogin";
import SalesDashboard from "./pages/SalesDashboard";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;

    if (
      hash.includes("type=recovery") ||
      hash.includes("access_token=")
    ) {
      navigate("/reset-password");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Register />} />

      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/sales-login" element={<SalesLogin />} />

      <Route path="/sales" element={<SalesDashboard />} />
    </Routes>
  );
}

export default App;
