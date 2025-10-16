import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/customerService";


// const CustomerLogin = () => {
//   const [phone, setPhone] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await loginCustomer(phone);
//       setMessage(`Welcome back, ${response.data.firstName} ${response.data.lastName}!`);
//       setPhone("");

//       // Redirect to menu page
//       Navigate("/menu");
//     } catch (error) {
//       setMessage(error.response?.data || "Customer not found!");
//     }
//   };

const CustomerLogin = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [message] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.post("http://localhost:8080/api/v1/customer/customerLogin", { phone });
      const response = await loginCustomer(phone);
      // Save token & customer details
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("customerPhone", response.data.phone);

      // Redirect to menu page
      navigate("/menu");
    } catch (error) {
      alert(error.response?.data || "Customer not found!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Customer Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="phone"
            placeholder="Enter Phone Number"
            className="w-full p-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Login
          </button>
        </form>
        {message && <p className="text-center mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}

export default CustomerLogin

