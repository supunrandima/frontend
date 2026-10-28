import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdleTimeout from '../../hooks/useIdleTimeout';
import { useCart } from '../../context/CartContext';

const CustomerIdleWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const handleIdle = () => {
    // Only reset if they are not already on the home page
    if (location.pathname !== '/') {
      console.log('User inactive for 15 seconds. Clearing cart and redirecting to home.');
      clearCart();
      // Ensure we don't clear DEVICE_TABLE_NUMBER from localStorage here
      navigate('/');
    }
  };

  // 15000 ms = 15 seconds timeout
  useIdleTimeout(handleIdle, 15000);

  return <>{children}</>;
};

export default CustomerIdleWrapper;
