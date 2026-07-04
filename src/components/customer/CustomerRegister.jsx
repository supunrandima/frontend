import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../../services/customerService";
import { Box, Typography, TextField, InputAdornment, CircularProgress } from '@mui/material';
import UserIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import lockscreenBg from '../../assets/lockscreen-bg.jpg';

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
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Valid 10-15 digit phone number required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Valid email address required";
    }
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

      // Show Success Message
      setMessage({
        type: "success",
        text: `Registration successful! Welcome, ${response.data.firstName || 'User'}. Redirecting to login...`,
      });

      // Redirect to Login Page after 2 seconds
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

  const textFieldSx = {
    mb: 2.5,
    width: '100%',
    '& .MuiInputBase-input': {
      color: '#ffffff',
      fontSize: '0.95rem',
      py: 1.8,
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.9rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#FF914D',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        transition: 'all 0.3s ease-in-out',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.25)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FF914D',
        boxShadow: '0 0 12px rgba(255, 145, 77, 0.15)',
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#ff4d4d',
      fontWeight: 500,
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4"
      style={{ backgroundImage: `url(${lockscreenBg})` }}
    >
      {/* Dark Overlay for overlay readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      {/* Central Glassmorphic Authentication Card */}
      <div className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-[#1a1a1a]/80 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10 transform transition-all duration-300">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <Typography 
            variant="h3" 
            className="font-extrabold tracking-wider bg-gradient-to-r from-[#FF3131] to-[#FF914D] bg-clip-text text-transparent mb-2"
            sx={{ fontWeight: 900 }}
          >
            TASTE TREK
          </Typography>
          <Typography className="text-gray-400 font-medium text-sm">
            Create a customer account to start ordering
          </Typography>
        </div>

        {/* Styled Feedback Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-medium border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/25 text-[#4ade80]' 
              : 'bg-red-500/10 border-red-500/25 text-[#ff4d4d]'
          }`}>
            {message.text}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Name Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-1">
            <TextField
              label="First Name"
              name="firstName"
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon className="text-gray-400 mr-1" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Last Name"
              name="lastName"
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon className="text-gray-400 mr-1" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Contact Details Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-1">
            <TextField
              label="Phone Number"
              name="phone"
              variant="outlined"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon className="text-gray-400 mr-1" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email Address"
              name="email"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon className="text-gray-400 mr-1" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Birthday Row */}
          <TextField
            label="Birthday"
            name="birthday"
            variant="outlined"
            type="date"
            value={formData.birthday}
            onChange={handleChange}
            error={!!errors.birthday}
            helperText={errors.birthday}
            sx={textFieldSx}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon className="text-gray-400 mr-1" />
                </InputAdornment>
              ),
            }}
          />

          {/* Rounded submission button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 text-white font-bold rounded-2xl bg-gradient-to-r from-[#FF3131] to-[#FF914D] hover:from-[#FF4D4D] hover:to-[#FFA066] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mb-6 mt-2"
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: '#ffffff' }} />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Navigation Switch Option */}
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <span 
            onClick={() => navigate('/CustomerLogin')}
            className="text-[#FF914D] hover:text-[#FFA066] font-semibold hover:underline cursor-pointer transition-colors"
          >
            Log in
          </span>
        </div>

      </div>
    </div>
  );
};

export default CustomerRegister;