import React, { useState } from "react";
import { loginAdmin } from "../services/adminService.js"; // <-- FIX: Added .js extension
import { Eye, EyeOff, Lock, User, LogIn, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.password) {
      setMessage({ type: "error", text: "Please enter both userId and password" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await loginAdmin(formData);
      
      // The backend returns a flat structure (token, userId, firstName) 
      // instead of a nested 'admin' object. Update storage logic accordingly.
      const { token, userId, firstName } = response.data;
      
      const adminData = { userId, firstName };

      if (rememberMe) {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      } else {
        sessionStorage.setItem('adminToken', token);
        sessionStorage.setItem('adminUser', JSON.stringify(adminData));
      }
      
      setMessage({
        type: "success",
        // Use firstName from the response if available
        text: `Welcome back, ${firstName || userId}!`,
      });
      
      // Redirect to admin dashboard after successful login
      setTimeout(() => {
        navigate('/menu');
      }, 1500);
      
    } catch (error) {
      // Use the 'error' field returned by the backend's ResponseEntity
      const errorMessage = error.response?.data?.error || "Login failed. Invalid User ID or password.";
      setMessage({
        type: "error",
        text: errorMessage,
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
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-4 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-300">Sign in to your TasteTrek admin account</p>
        </div>

        {/* Main Form Card - Glassmorphism Design */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20" style={{ boxShadow: '0 8px 32px 0 rgba(255, 49, 49, 0.2)' }}>
          {/* Alert Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-400/30"
                  : "bg-red-500/20 border border-red-400/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-100" : "text-red-100"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  name="userId"
                  placeholder="Enter your userId"
                  className="w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  autoComplete="userId"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 backdrop-blur-sm bg-white/10 border border-white/30 rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-red-500 focus:ring-2 focus:ring-offset-0 cursor-pointer"
                  style={{ accentColor: '#ff3131' }}
                />
                <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="/admin/forgot-password"
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: '#ff914d' }}
              >
                Forgot password?
              </a>
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
                  <span>Sign In</span>
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
              href="/registerAdmin"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
              style={{ color: '#ff914d' }}
            >
              <User className="w-4 h-4" />
              New Admin
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
};

export default AdminLogin;
