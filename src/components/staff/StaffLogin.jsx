import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginStaff } from "../../services/staffService"; // Ensure this service exists (see below)
import { User, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react";

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
      
    
      const { token, role } = response.data;
      localStorage.setItem("staffToken", token);
      localStorage.setItem("staffRole", role); 

    
      if (role === 'ADMIN') {
           navigate('/adminDashboard');
      } else {
           
           navigate("/kitchen"); 
      }
      
    } catch (error) {
      console.error("Login Error:", error);
      setMessage(error.response?.data?.error || "Login failed. Invalid ID or Password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden font-poppins">
      {/* Header Bar */}
      <div className="w-full p-4 bg-[#2d2d2d] shadow-md border-b border-white/10 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold gradient-text">Taste Trek Staff</h1>
        <div className="flex gap-4 text-gray-400">
            <User className="w-6 h-6" />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md backdrop-blur-md bg-white/5 rounded-[2rem] p-12 border border-white/10 shadow-2xl">
          
          <div className="mb-8 text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Kitchen Login</h2>
             <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Staff ID Input */}
            <div className="space-y-2">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        name="staffId"
                        placeholder="Staff ID"
                        className="w-full pl-12 pr-6 py-4 bg-[#333333] rounded-2xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all border border-transparent"
                        value={formData.staffId}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full pl-12 pr-6 py-4 bg-[#333333] rounded-2xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3131] transition-all border border-transparent"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Error Message */}
            {message && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            {/* Login Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                style={{ background: 'linear-gradient(90deg, #FF3131 0%, #FF914D 100%)' }}
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;