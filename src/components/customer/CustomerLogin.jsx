import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, InputAdornment, CircularProgress } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { loginCustomer } from '../../services/customerService';
import { isValidSriLankanMobileNumber } from '../../utils/validation';
import lockscreenBg from '../../assets/lockscreen-bg.jpg';

const CustomerLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Keep only numbers
    const cleanVal = val.replace(/\D/g, '');
    setPhoneNumber(cleanVal);
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Phone number is required.');
      return;
    }
    if (!isValidSriLankanMobileNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit Sri Lankan phone number (e.g. 07xxxxxxxx).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginCustomer(phoneNumber);
      const data = response.data;

      // Properly save and map session information to local storage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("customerName", data.customerName || "Customer");
      localStorage.setItem("userName", data.customerName || "Customer");
      localStorage.setItem("customerPhone", data.customerPhone || phoneNumber);
      localStorage.setItem("userRole", "CUSTOMER");

      navigate('/menu');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.error || 'Login failed. Please register if you do not have an account.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    mb: 4,
    width: '100%',
    '& .MuiInputBase-input': {
      color: '#ffffff',
      fontSize: '1rem',
      py: 2,
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#FF914D',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
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
      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-[#1a1a1a]/80 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10 transform transition-all duration-300">
        
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
            Sign in to your customer account
          </Typography>
        </div>

        {/* Styled Feedback Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-[#ff4d4d] text-sm font-medium flex items-center justify-center text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col">
          <TextField
            label="Phone Number"
            variant="outlined"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="07xxxxxxxx"
            error={!!error}
            helperText={error && error.includes('Sri Lankan') ? 'Format: 07xxxxxxxx' : ''}
            sx={textFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon className="text-gray-400 mr-2" />
                </InputAdornment>
              ),
            }}
          />

          {/* Rounded submission button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-2xl bg-gradient-to-r from-[#FF3131] to-[#FF914D] hover:from-[#FF4D4D] hover:to-[#FFA066] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mb-6"
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#ffffff' }} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation Switch Option */}
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <span 
            onClick={() => navigate('/CustomerRegister')}
            className="text-[#FF914D] hover:text-[#FFA066] font-semibold hover:underline cursor-pointer transition-colors"
          >
            Sign up here
          </span>
        </div>

      </div>
    </div>
  );
};

export default CustomerLogin;
