import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import FastfoodIcon from '@mui/icons-material/FastfoodOutlined';
import { motion } from 'framer-motion';

import { loginCustomer } from '../../services/customerService';
import { continueAsGuest } from '../../services/guestService';
import { isValidSriLankanMobileNumber } from '../../utils/validation';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const brandOrange = '#f97316';
  const brandTeal = '#0d9488';

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setPhoneNumber('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleHeaderDoubleClick = () => {
    const currentTable = localStorage.getItem('DEVICE_TABLE_NUMBER') || '';
    const newTable = window.prompt("Enter Device Table Number:", currentTable);
    if (newTable !== null) {
      const trimmed = newTable.trim();
      if (trimmed) {
        localStorage.setItem('DEVICE_TABLE_NUMBER', trimmed);
        alert(`Device Table Number set to: ${trimmed}`);
      } else {
        localStorage.removeItem('DEVICE_TABLE_NUMBER');
        alert("Device Table Number cleared.");
      }
    }
  };

  const handleKeypadClick = (value) => {
    setError('');
    if (value === 'backspace') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setPhoneNumber('');
    } else {
      setPhoneNumber(prev => prev.length < 10 ? prev + value : prev); 
    }
  };

  const saveSession = (data) => {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("customerId", data.customerId); // Stores "GUEST-..." or DB ID
      localStorage.setItem("customerName", data.customerName);
      localStorage.setItem("userRole", data.role || "CUSTOMER");
      
      if (data.customerPhone) localStorage.setItem("customerPhone", data.customerPhone);
      else localStorage.removeItem("customerPhone");
  };

  const handleProceed = async () => {
    if (!isValidSriLankanMobileNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit number starting with 07');
      return;
    }
    
    try {
      const response = await loginCustomer(phoneNumber);
      saveSession(response.data); 
      handleCloseModal();
      navigate('/order-mode');
    } catch (err) {
      console.error('Login Error:', err);
      const errorMsg = err.response?.data?.error || "Login failed. Please check your number or register.";
      setError(errorMsg);
    }
  };

  const handleGuest = async () => {
    try {
      const response = await continueAsGuest();
      saveSession(response.data);
      navigate('/order-mode');
    } catch (err) {
      console.error('Guest login failed:', err);
      // Fallback
      navigate('/order-mode');
    }
  };

  const keypadButtons = [
    { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' },
    { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' },
    { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' },
    { label: <ClearIcon fontSize="large" />, value: 'clear', isAction: true },
    { label: '0', value: '0' },
    { label: <BackspaceIcon fontSize="large" />, value: 'backspace', isAction: true }
  ];

  const isPhoneValid = isValidSriLankanMobileNumber(phoneNumber);
  const displayError = (phoneNumber.length > 0 && !isPhoneValid) 
    ? 'Enter a valid 10-digit number starting with 07' 
    : error;

  const renderFormattedNumber = (num) => {
    const padded = num.padEnd(10, '0');
    
    const getSegment = (segment, startIndex) => {
      return segment.split('').map((char, idx) => {
        const globalIdx = startIndex + idx;
        const isTyped = globalIdx < num.length;
        return (
          <motion.span key={globalIdx} animate={{ opacity: isTyped ? 1 : 0.3 }}>
            {char}
          </motion.span>
        );
      });
    };

    const p1 = padded.substring(0, 3);
    const p2 = padded.substring(3, 6);
    const p3 = padded.substring(6, 10);

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box>{getSegment(p1, 0)}</Box>
        <Box>{getSegment(p2, 3)}</Box>
        <Box>{getSegment(p3, 6)}</Box>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
      
      {/* Header */}
      <Box onDoubleClick={handleHeaderDoubleClick} sx={{ textAlign: 'center', mb: 8, cursor: 'pointer' }}>
        <RestaurantIcon sx={{ fontSize: 80, color: '#ffffff', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#ffffffff', letterSpacing: 3 }}>TASTE TREK</Typography>
        <Typography variant="h5" sx={{ color: '#aaaaaa', mt: 2 }}>HOW WOULD YOU LIKE TO ORDER?</Typography>
      </Box>

      {/* Landing Buttons */}
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <Card onClick={handleOpenModal} sx={{ width: 350, height: 350, borderRadius: 8, background: `linear-gradient(135deg, ${brandOrange} 0%, #c2410c 100%)`, color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <PersonIcon sx={{ fontSize: 100, mb: 2 }} />
            <Typography variant="h4" fontWeight={700}>Log In</Typography>
            <Typography variant="h6" opacity={0.9}>& Earn Points</Typography>
          </Card>
          
          <Card onClick={handleGuest} sx={{ width: 350, height: 350, borderRadius: 8, background: `linear-gradient(135deg, ${brandTeal} 0%, #0f766e 100%)`, color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FastfoodIcon sx={{ fontSize: 100, mb: 2 }} />
            <Typography variant="h4" fontWeight={700}>Order</Typography>
            <Typography variant="h6" opacity={0.9}>as Guest</Typography>
          </Card>
        </Box>
      </Container>

      {/* Modern Kiosk Keypad Modal */}
      <Dialog
        open={isModalOpen} 
        onClose={handleCloseModal}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0, 0, 0, 0.7)' } } }}
        PaperProps={{
          sx: { 
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff', 
            borderRadius: '50px', 
            minWidth: '600px', 
            maxWidth: '700px',
            p: 4 
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleCloseModal} sx={{ color: '#e10e0eff' }}><CloseIcon fontSize="large" /></IconButton>
        </Box>
        
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 6 }}>
          <Typography variant="h3" sx={{fontFamily:"'Poppins', sans-serif", fontWeight: 800, mb: 2 }}>Loyalty Number</Typography>

          {/* Borderless Number Display */}
          <Box sx={{ bgcolor: 'rgba(243, 228, 228, 0.8)', borderRadius: 8, py: 5, px: 6, mb: 2, width: '100%', minHeight: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', color: '#1a1a1a' }}>
              {renderFormattedNumber(phoneNumber)}
            </Typography>
          </Box>

          <Box sx={{ height: 32, mb: 2, width: '100%', textAlign: 'center' }}>
            {displayError && (
              <Typography sx={{ color: '#ff4d4d', fontSize: '1.2rem', fontWeight: 600 }}>
                {displayError}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, width: '100%', mb: 6 }}>
            {keypadButtons.map((btn, i) => (
              <Button key={i} variant="contained" onClick={() => handleKeypadClick(btn.value)} sx={{ height: 90, fontSize: '2.5rem',color: '#f97316',fontWeight:500, borderRadius: 5, background: 'rgba(162, 26, 26, 0.05)'}}>
                {btn.label}
              </Button>
            ))}
          </Box>

          <Button fullWidth disabled={!isPhoneValid} variant="contained" onClick={handleProceed} sx={{ background: brandOrange, py: 3, fontSize: '1.5rem', fontWeight: 800, borderRadius: 5, '&:disabled': { opacity: 0.5 } }}>
            PROCEED
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HomePage;