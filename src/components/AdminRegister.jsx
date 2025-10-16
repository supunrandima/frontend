import React, { useState } from "react";
import { registerAdmin } from "../services/adminService";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Lock, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userId: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    role: "ADMIN",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }
    if (formData.userId.length < 4) {
      newErrors.userId = "User ID must be at least 4 characters";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors below" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await registerAdmin(formData);
      setMessage({
        type: "success",
        text: `Registration successful! Welcome, ${response.data.firstName}`,
      });
      setFormData({
        firstName: "",
        lastName: "",
        userId: "",
        password: "",
        email: "",
        phone: "",
        address: "",
        role: "ADMIN",
      });
      setErrors({});
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Error registering Admin. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff3131', top: '-10%', left: '-10%' }}></div>
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff914d', bottom: '-10%', right: '-10%' }}></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Registration</h1>
          <p className="text-gray-300">Create your administrator account for TasteTrek</p>
        </div>

        {/* Main Form Card - Glassmorphism Design */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20" style={{ boxShadow: '0 8px 32px 0 rgba(255, 49, 49, 0.2)' }}>
          {/* Alert Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    style={{ focusRingColor: '#ff3131' }}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="userId"
                  placeholder="johndoe"
                  className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                    errors.userId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.userId}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.userId && (
                <p className="mt-1 text-xs text-red-600">{errors.userId}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Email and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0771234567"
                    className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="address"
                  placeholder="Enter your full address"
                  rows="3"
                  className={`w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 resize-none ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
              )}
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
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 49, 49, 0.4)';
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
                  <span>Register Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-100">
            Already have an account?{" "}
            <a href="/adminLogin" className="font-semibold hover:underline" style={{ color: '#ff3131' }}>
              Sign in here
            </a>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By registering, you agree to TasteTrek's Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;