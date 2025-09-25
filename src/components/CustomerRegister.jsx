import React, { useState } from "react";
import { registerCustomer } from "../services/customerService";

export default function CustomerRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
  });

  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert birthday to LocalDateTime string format (YYYY-MM-DDTHH:mm:ss)
    const formattedData = {
      ...formData,
      birthday: formData.birthday ? formData.birthday + "T00:00:00" : null,
    };

    try {
      const response = await registerCustomer(formattedData);
      setMessage(
        `Registration successful! Welcome, ${response.data.firstName}`
      );
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error registering customer.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Customer Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="w-full p-2 border rounded"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="w-full p-2 border rounded"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="birthday"
            placeholder="Birthday"
            className="w-full p-2 border rounded"
            value={formData.birthday}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        {message && <p className="text-center mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}
