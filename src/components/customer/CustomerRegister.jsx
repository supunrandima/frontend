import React, { useState } from "react";
import { registerCustomer } from "../../services/customerService.js";
import { User, Mail, Phone, Calendar, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    birthday: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field-specific error when user starts typing
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: "" });
    }
    // Clear general message
    if (message.text) {
        setMessage({ type: "", text: "" });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    // Relaxed phone validation to match backend: optional +, 10 to 15 digits
    const phonePattern = /^[+]?[0-9]{10,15}$/; 
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.phone.match(phonePattern)) {
        newErrors.phone = "Phone must be 10-15 digits (optional starting '+')";
    }
    
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
      setMessage({ type: "error", text: "Please correct the highlighted form errors." });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage({ type: "", text: "" });

    // Convert birthday to LocalDateTime string format (YYYY-MM-DDTHH:mm:ss)
    const formattedData = {
      ...formData,
      birthday: formData.birthday ? formData.birthday + "T00:00:00" : null,
    };

    try {
      const response = await registerCustomer(formattedData);
      
      setMessage({
        type: "success",
        text: `Registration successful! Welcome, ${response.data.firstName}. You can now log in.`,
      });
      
      // Clear form after successful registration
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        birthday: "",
      });
      
    } catch (error) {
        console.error("Registration error:", error);
      let errorMessage = "Error registering customer.";
      
      if (error.response?.status === 400 && error.response.data?.error) {
        // Handle specific backend uniqueness errors
        errorMessage = error.response.data.error; 
      } else if (error.response?.data?.message) {
        // Handle generic validation failure messages
        errorMessage = error.response.data.message;
      }
      
      // Display general error message
      setMessage({ type: "error", text: errorMessage });
      
    } finally {
        setIsLoading(false);
    }
  };

  const inputStyle = (fieldName) => `w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
    errors[fieldName] ? "border-red-500 border-2" : "border-white/30"
  }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff3131', top: '-10%', left: '-10%' }}></div>
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff914d', bottom: '-10%', right: '-10%' }}></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Customer Registration</h1>
          <p className="text-gray-300">Join the TasteTrek family today</p>
        </div>

        {/* Main Form Card - Glassmorphism Design */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20" style={{ boxShadow: '0 8px 32px 0 rgba(255, 49, 49, 0.2)' }}>
          
          {/* General Message/Error Display */}
          {message.text && (
            <div 
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm ${
                message.type === 'success' ? 'bg-green-500/20 border border-green-400/30 text-green-100' : 'bg-red-500/20 border border-red-400/30 text-red-100'
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className={inputStyle("firstName")}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className={inputStyle("lastName")}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Phone and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (+XXYYYYYYYYYY)"
                  className={inputStyle("phone")}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={inputStyle("email")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Birthday */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                className={inputStyle("birthday")}
                value={formData.birthday}
                onChange={handleChange}
                required
              />
              {errors.birthday && <p className="text-red-400 text-xs mt-1">{errors.birthday}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3.5 rounded-xl font-semibold focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)',
                boxShadow: '0 4px 15px rgba(255, 49, 49, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 49, 49, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 49, 49, 0.3)';
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register Customer</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Already registered?{" "}
            <a href="/CustomerLogin" className="font-semibold hover:underline" style={{ color: '#ff914d' }}>
              Sign in here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
