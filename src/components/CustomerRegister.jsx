import React, { useState } from "react";
import { registerCustomer } from "../services/customerService";

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.match(phonePattern)) newErrors.phone = "Phone must be 10 digits";
    if (!formData.email.match(emailPattern)) newErrors.email = "Valid email required";
    if (!formData.birthday) newErrors.birthday = "Birthday is required";

    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert birthday to LocalDateTime string format (YYYY-MM-DDTHH:mm:ss)
    const formattedData = {
      ...formData,
      birthday: formData.birthday ? formData.birthday + "T00:00:00" : null,
    };

    try {
      const response = await registerCustomer(formattedData);
      setMessage(`Registration successful! Welcome, ${response.data.firstName}`);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
      });
      setErrors({});
    } catch (error) {
      if (error.response?.status === 400) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Error registering customer." });
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Customer Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className={`w-full p-2 border rounded ${errors.firstName ? "border-red-500" : ""}`}
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
          
          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className={`w-full p-2 border rounded ${errors.lastName ? "border-red-500" : ""}`}
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className={`w-full p-2 border rounded ${errors.phone ? "border-red-500" : ""}`}
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`w-full p-2 border rounded ${errors.email ? "border-red-500" : ""}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              className={`w-full p-2 border rounded ${errors.birthday ? "border-red-500" : ""}`}
              value={formData.birthday}
              onChange={handleChange}
              required
            />
            {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
        </form>
        
        {errors.general && <p className="text-red-500 text-center mt-3 text-sm">{errors.general}</p>}
        {message && <p className="text-green-500 text-center mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default CustomerRegister
