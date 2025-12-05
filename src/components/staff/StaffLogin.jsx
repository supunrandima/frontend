import React, { useState } from "react";
import { loginStaff } from "../../services/staffService";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";

const StaffLogin = () => {
  const [formData, setFormData] = useState({
    staffId: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await loginStaff(formData);
      
      // Store token and role
      localStorage.setItem("staffToken", response.data.token);
      localStorage.setItem("staffRole", response.data.role); 
      
      // Redirect to Kitchen Dashboard
      navigate("/kitchenDashboard");
      
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden font-poppins">
      {/* Header Bar */}
      <div className="w-full p-4 bg-[#2d2d2d] shadow-md border-b border-white/10 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold gradient-text">Taste Trek</h1>
        <div className="flex gap-4 text-gray-400">
            <User className="w-6 h-6" />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md backdrop-blur-md bg-white/5 rounded-[2rem] p-12 border border-white/10 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-8 mt-4">
            
            {/* Staff ID Input */}
            <div className="space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        name="staffId"
                        placeholder="Staff ID"
                        className="w-full px-6 py-4 bg-[#333333] rounded-2xl text-center text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all border border-transparent"
                        value={formData.staffId}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
                <div className="relative">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full px-6 py-4 bg-[#333333] rounded-2xl text-center text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all border border-transparent"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Error Message */}
            {message && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-4 flex justify-center">
                <button
                type="submit"
                disabled={isLoading}
                className="w-40 py-3 rounded-2xl font-medium text-white shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #D9381E 0%, #F55D3E 100%)' }}
                >
                {isLoading ? "..." : "Login"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;