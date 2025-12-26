import React from "react";
import CustomerRegisterPage from "./pages/customerUI/CustomerRegisterPage";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import AdminRegisterPage from "./pages/adminUI/AdminRegisterPage";
import HomePage from "./pages/HomePage";
import CustomerLoginPage from "./pages/customerUI/CustomerLoginPage";
import MenuPage from "./pages/MenuPage";
import AdminLoginPage from "./pages/adminUI/AdminLoginPage";
import AdminDashboardPage from "./pages/adminUI/AdminDashboardPage";
import StaffLoginPage from "./pages/staffUI/StaffLoginPage";
import KitchenDashboard from "./components/staff/KitchenDashboard";
import Checkout from "./components/customer/Checkout";
import OrderHistory from "./components/customer/OrderHistory";
import OrderStatus from "./components/customer/OrderStatus";
// import ShoppingCart from "./components/customer/ShoppingCart";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/CustomerRegister" element={<CustomerRegisterPage />} />
        <Route path="/registerAdmin" element={<AdminRegisterPage />} />
        <Route path="/customerLogin" element={<CustomerLoginPage />} />
        <Route path="/adminLogin" element={<AdminLoginPage />} />
        <Route path="/adminDashboard" element={<AdminDashboardPage />} />

        <Route path="/menu" element={<MenuPage />} />
        {/* <Route path="/cart" element={<ShoppingCart} /> */}
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/order-status/:orderId" element={<OrderStatus/>} />
        <Route path="/history" element={<OrderHistory />} />


        <Route path="/staffLogin" element={<StaffLoginPage />} />
        {/* <Route path="/kitchenDashboard" element={<KitchenDashboard/>} /> */}
        <Route path="/kitchen" element={<KitchenDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;