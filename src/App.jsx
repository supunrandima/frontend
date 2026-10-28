import React from "react";
import CustomerRegisterPage from "./pages/customerUI/CustomerRegisterPage";
import CustomerLoginPage from "./pages/customerUI/CustomerLoginPage";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import AdminRegisterPage from "./pages/adminUI/AdminRegisterPage";
import HomePage from "./pages/customerUI/HomePage";
import MenuPage from "./pages/MenuPage";
import AdminLoginPage from "./pages/adminUI/AdminLoginPage";
import AdminDashboardPage from "./pages/adminUI/AdminDashboardPage";
import StaffLoginPage from "./pages/staffUI/StaffLoginPage";
import KitchenDashboard from "./components/staff/KitchenDashboard";
import WaiterDashboard from "./components/staff/WaiterDashboard";
import OrderReview from "./components/customer/OrderReview";
import PaymentCheckout from "./components/customer/PaymentCheckout";
import OrderHistory from "./components/customer/OrderHistory";
import OrderStatus from "./components/customer/OrderStatus";
import CustomerProfile from "./components/customer/CustomerProfile";
import MobilePayment from "./components/payment/MobilePayment";
import CustomerIdleWrapper from "./components/customer/CustomerIdleWrapper";
import AdminIdleWrapper from "./components/admin/AdminIdleWrapper";
import StaffIdleWrapper from "./components/staff/StaffIdleWrapper";

// import ShoppingCart from "./components/customer/ShoppingCart";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/CustomerRegister" element={<CustomerRegisterPage />} />
        <Route path="/CustomerLogin" element={<CustomerLoginPage />} />
        <Route path="/customerLogin" element={<CustomerLoginPage />} />
        <Route path="/registerAdmin" element={<AdminRegisterPage />} />
        <Route path="/adminLogin" element={<AdminLoginPage />} />
        <Route path="/adminDashboard" element={<AdminIdleWrapper><AdminDashboardPage /></AdminIdleWrapper>} />

        <Route path="/menu" element={<CustomerIdleWrapper><MenuPage /></CustomerIdleWrapper>} />
        <Route path="/review" element={<CustomerIdleWrapper><OrderReview /></CustomerIdleWrapper>} />
        <Route path="/checkout" element={<CustomerIdleWrapper><PaymentCheckout /></CustomerIdleWrapper>} />
        <Route path="/order-status/:orderId" element={<OrderStatus/>} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/profile" element={<CustomerProfile />} />

        <Route path="/pay/:orderId" element={<MobilePayment />} />


        <Route path="/staffLogin" element={<StaffLoginPage />} />
        {/* <Route path="/kitchenDashboard" element={<KitchenDashboard/>} /> */}
        <Route path="/kitchen" element={<StaffIdleWrapper><KitchenDashboard /></StaffIdleWrapper>} />
        <Route path="/waiter" element={<StaffIdleWrapper><WaiterDashboard /></StaffIdleWrapper>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;