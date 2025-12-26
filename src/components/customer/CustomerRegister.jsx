import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../../services/customerService";
import { User, Mail, Phone, Calendar, UserPlus, CheckCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate(); 

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

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    // Basic length check for phone
    if (formData.phone.length < 9) newErrors.phone = "Valid phone number required";
    if (!formData.email.includes("@")) newErrors.email = "Valid email required";
    if (!formData.birthday) newErrors.birthday = "Birthday is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
        // Prepare data (ensure birthday format if backend needs LocalDateTime)
        const payload = {
            ...formData,
            birthday: formData.birthday ? formData.birthday + "T00:00:00" : null
        };

        const response = await registerCustomer(payload);

        // 1. Show Success Message
        setMessage({
            type: "success",
            text: `Registration successful! Welcome, ${response.data.firstName}. Redirecting to login...`,
        });

        // 2. Redirect to Login Page after 2 seconds
        // 
        setTimeout(() => {
            navigate("/CustomerLogin"); 
        }, 2000);

    } catch (error) {
        console.error("Registration error:", error);
        let errorMessage = "Registration failed. Please try again.";
        
        if (error.response?.data?.error) {
             errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
             errorMessage = error.response.data.message;
        }
        
        setMessage({ type: "error", text: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  // --- Styles ---
  const inputStyle = (fieldName) => `w-full pl-11 pr-4 py-3 backdrop-blur-sm bg-white/10 border rounded-xl focus:ring-2 focus:border-transparent transition-all text-white placeholder-gray-400 ${
    errors[fieldName] ? "border-red-500 border-2" : "border-white/30"
  }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff3131', top: '-10%', left: '-10%' }}></div>
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ff914d', bottom: '-10%', right: '-10%' }}></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join TasteTrek for exclusive offers</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 backdrop-blur-sm ${message.type === 'success' ? 'bg-green-500/20 border-green-400/30 text-green-100' : 'bg-red-500/20 border-red-400/30 text-red-100'}`}>
              {message.type === "success" ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" name="firstName" placeholder="First Name" className={inputStyle("firstName")} value={formData.firstName} onChange={handleChange} />
                        {errors.firstName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.firstName}</p>}
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" name="lastName" placeholder="Last Name" className={inputStyle("lastName")} value={formData.lastName} onChange={handleChange} />
                        {errors.lastName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.lastName}</p>}
                    </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="tel" name="phone" placeholder="Phone" className={inputStyle("phone")} value={formData.phone} onChange={handleChange} />
                        {errors.phone && <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>}
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="email" name="email" placeholder="Email" className={inputStyle("email")} value={formData.email} onChange={handleChange} />
                        {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>
                </div>

                {/* Birthday */}
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="date" name="birthday" className={inputStyle("birthday")} value={formData.birthday} onChange={handleChange} />
                    {errors.birthday && <p className="text-red-400 text-xs mt-1 ml-1">{errors.birthday}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="w-full text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
                    style={{ background: 'linear-gradient(135deg, #ff3131 0%, #ff914d 100%)' }}>
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <>Register <ArrowRight className="w-5 h-5" /></>}
                </button>
          </form>

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