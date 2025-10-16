import React from "react";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import HomePage from "./pages/HomePage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import MenuPage from "./pages/MenuPage";
import AdminLoginPage from "./pages/AdminLoginPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/CustomerRegister" element={<CustomerRegisterPage />} />
        <Route path="/registerAdmin" element={<AdminRegisterPage />} />
        <Route path="/customerLogin" element={<CustomerLoginPage />} />
        <Route path="/adminLogin" element={<AdminLoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;