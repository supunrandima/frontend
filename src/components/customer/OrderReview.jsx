import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeNewOrder } from '../../services/orderService';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Fade,
  Grid
} from '@mui/material';

// MUI Icons
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import TableBarRoundedIcon from '@mui/icons-material/TableBarRounded';
import TakeoutDiningRoundedIcon from '@mui/icons-material/TakeoutDiningRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { ArrowLeft } from 'lucide-react';

const OrderReview = () => {
  const { cartItems, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const deviceTable = localStorage.getItem('DEVICE_TABLE_NUMBER');

  // UI State
  const [orderType, setOrderType] = useState(deviceTable === '0000' ? 'TAKEOUT' : 'TABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Redirect to menu if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) {
      navigate('/menu');
    }
  }, [cartItems, navigate, isSubmitting]);

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    setIsSubmitting(true);

    const customerId = localStorage.getItem('customerId');
    const customerPhone = localStorage.getItem('customerPhone');
    const deviceTableNumber = localStorage.getItem('DEVICE_TABLE_NUMBER') || 'UNASSIGNED';

    const payload = {
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        itemCode: item.itemCode,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        selectedCustomizations: item.selectedCustomizations || [],
        specialNote: item.specialNote || "",
      })),
      orderType: orderType,
      tableNumber: deviceTableNumber,
      customerId,
      customerPhone,
      totalAmount: totalPrice,
      paymentStatus: 'PENDING_PAYMENT',
      orderStatus: 'PLACED'
    };

    try {
      const response = await placeNewOrder(payload);
      const { orderId } = response.data;

      localStorage.setItem('currentOrderId', orderId);
      clearCart();
      navigate(`/order-status/${orderId}`);
    } catch (error) {
      console.error("Dine-In order placement failed:", error);
      setMessage({ type: 'error', text: "Failed to place order. Please try again." });
      setIsSubmitting(false);
    }
  };

  // Shared glassmorphism styling
  const optionCardSx = (isSelected) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 3,
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: isSelected ? '2px solid #FF914D' : '2px solid rgba(255, 255, 255, 0.1)',
    background: isSelected ? 'rgba(255, 145, 77, 0.1)' : 'transparent',
    '&:hover': {
      border: isSelected ? '2px solid #FF914D' : '2px solid rgba(255, 255, 255, 0.3)',
      background: isSelected ? 'rgba(255, 145, 77, 0.1)' : 'rgba(255, 255, 255, 0.02)',
    }
  });

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FF3131' }} size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 700,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          color: 'white',
        }}
      >
        {/* Back to Menu Button */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={20} />
            Back to Menu
          </button>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, rgba(255,49,49,0.2), rgba(255,145,77,0.2))', mb: 2 }}>
            <ShoppingCartRoundedIcon sx={{ color: '#FF914D', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center' }}>Review Order</Typography>
          <Typography variant="body1" sx={{ color: '#aaaaaa', textAlign: 'center' }}>{totalItems} items in your cart</Typography>
        </Box>

        {/* Error Message */}
        {message.text && (
          <Fade in={!!message.text}>
            <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
              {message.text}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleConfirmOrder}>
          
          {/* Cart Items List */}
          <Box sx={{ maxHeight: '280px', overflowY: 'auto', pr: 1, mb: 4, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' } }}>
            {cartItems.map((item) => (
              <Box key={item.cartItemId} sx={{ display: 'flex', alignItems: 'center', py: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>{item.name}</Typography>
                  
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <Typography sx={{ color: 'gray', fontSize: '0.8rem', mb: 0.5 }}>
                      + {item.selectedCustomizations.map(c => c.name).join(', ')}
                    </Typography>
                  )}
                  
                  {item.specialNote && (
                    <Typography sx={{ color: '#FF914D', fontSize: '0.8rem', fontStyle: 'italic', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EditNoteRoundedIcon sx={{ fontSize: '14px' }} /> Note: {item.specialNote}
                    </Typography>
                  )}

                  <Typography sx={{ color: '#FF914D', fontWeight: 500 }}>
                    ${item.unitPrice.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(0,0,0,0.3)', p: 0.5, borderRadius: 2, mx: 2 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={isSubmitting}
                    sx={{ color: '#aaaaaa', '&:hover': { color: 'white' } }}
                  >
                    <RemoveRoundedIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, width: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    disabled={isSubmitting}
                    sx={{ color: '#aaaaaa', '&:hover': { color: 'white' } }}
                  >
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography sx={{ width: '80px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

          {/* Dining Options */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>Dining Options</Typography>
          <Grid container spacing={2} sx={{ mb: 5 }}>
            {deviceTable !== '0000' && (
              <Grid item xs={deviceTable !== '0000' ? 6 : 12}>
                <Box onClick={() => !isSubmitting && setOrderType('TABLE')} sx={optionCardSx(orderType === 'TABLE')}>
                  <TableBarRoundedIcon sx={{ fontSize: 32, color: orderType === 'TABLE' ? '#FF914D' : '#aaaaaa', mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, color: orderType === 'TABLE' ? 'white' : '#aaaaaa' }}>Dine-In</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#888', mt: 0.5 }}>Pay after eating</Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={deviceTable !== '0000' ? 6 : 12}>
              <Box onClick={() => !isSubmitting && setOrderType('TAKEOUT')} sx={optionCardSx(orderType === 'TAKEOUT')}>
                <TakeoutDiningRoundedIcon sx={{ fontSize: 32, color: orderType === 'TAKEOUT' ? '#FF914D' : '#aaaaaa', mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: orderType === 'TAKEOUT' ? 'white' : '#aaaaaa' }}>Takeaway</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#888', mt: 0.5 }}>Pay now to prep</Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* Totals */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ color: '#aaaaaa' }}>Subtotal</Typography>
            <Typography sx={{ fontWeight: 500 }}>${totalPrice.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Total</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF914D' }}>
              ${totalPrice.toFixed(2)}
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting || cartItems.length === 0}
            sx={{
              py: 2.5,
              borderRadius: 3,
              fontSize: '1.2rem',
              fontWeight: 800,
              textTransform: 'none',
              background: 'linear-gradient(90deg, #FF3131, #FF914D)',
              color: 'white',
              boxShadow: '0 8px 20px rgba(255, 49, 49, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #ff4b4b, #ffa56b)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 25px rgba(255, 49, 49, 0.4)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
                boxShadow: 'none',
              }
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={28} sx={{ color: 'white' }} />
            ) : (
              orderType === 'TABLE' ? 'Confirm Dine-In Order' : 'Proceed to Payment'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderReview;