import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer } from "../../services/customerService.js";
import { Phone, LogIn, CheckCircle, AlertCircle, User } from "lucide-react";

const CustomerLogin = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Handle input change
  const handleChange = (e) => {
    setPhone(e.target.value);
    // Clear message on input change
    if (message.text) {
        setMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" }); // Clear previous messages
    
    // Client-side phone validation (matching backend constraint: optional +, 10-15 digits)
    const phonePattern = /^[+]?[0-9]{10,15}$/; 
    if (!phone.match(phonePattern)) {
      setMessage({ type: "error", text: "Please enter a valid phone number (10-15 digits, optional +)." });
      setIsLoading(false);
      return;
    }

    try {
      // Call the service with the phone number, which formats it as { phone: "..." }
      const response = await loginCustomer(phone);
      
      // Save token & customer details
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("customerId", response.data.customerId); 
      localStorage.setItem("customerPhone", response.data.phone);
      
      setMessage({ type: "success", text: "Login successful! Redirecting to menu..." });

      // Redirect to menu page after a short delay
      setTimeout(() => {
          navigate("/menu");
      }, 500);

    } catch (error) {
      console.error("Login error:", error);

      // Parse backend error messages
      let errorMessage = "Login failed. Please check your phone number.";
      
      if (error.response) {
        const errorData = error.response.data;
        
        // Handle UNAUTHORIZED (401) or specific backend errors
        if ((error.response.status === 401 || error.response.status === 400) && errorData && errorData.error) {
             errorMessage = errorData.error; 
        } else {
             errorMessage = `Server Error (${error.response.status}). Could not connect to API.`;
        }
      }
      
      setMessage({ type: "error", text: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      {/* Animated Background Elements (Visual cohesion with Admin Login) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff3131', top: '-10%', left: '-10%' }}></div>
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff914d', bottom: '-10%', right: '-10%' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
            <Phone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Customer Login</h1>
          <p className="text-gray-300">Sign in to TasteTrek using your phone number</p>
        </div>

        {/* Main Form Card - Glassmorphism Design */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20" style={{ boxShadow: '0 8px 32px 0 rgba(255, 49, 49, 0.2)' }}>
          {/* Alert Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-400/30 text-green-100"
                  : "bg-red-500/20 border border-red-400/30 text-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="tel" 
                  name="phone"
                  placeholder="Enter your phone number"
                  className="w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400"
                  value={phone}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3.5 rounded-xl font-semibold focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)',
                boxShadow: '0 4px 15px rgba(255, 49, 49, 0.3)',
                transform: isLoading ? 'translateY(0)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 49, 49, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 49, 49, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-400 backdrop-blur-sm bg-white/5 rounded-full">
                New to TasteTrek?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <a
              href="/CustomerRegister"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
              style={{ color: '#ff914d' }}
            >
              <User className="w-4 h-4" />
              New Customer
            </a>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>TasteTrek</p>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin
