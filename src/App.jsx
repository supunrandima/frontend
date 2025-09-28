import React from "react";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";
import { BrowserRouter,Routes, Route } from "react-router-dom";
import AdminRegisterPage from "./pages/AdminRegisterPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/CustomerRegister" element={<CustomerRegisterPage />} />
        <Route path="/AdminRegister" element={<AdminRegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;