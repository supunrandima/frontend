import React from 'react';
import { useNavigate } from 'react-router-dom';
import useIdleTimeout from '../../hooks/useIdleTimeout';

const StaffIdleWrapper = ({ children }) => {
  const navigate = useNavigate();
  
  const role = localStorage.getItem('role');

  let idleTime = 600000; // Default to 10 minutes (WAITER)
  
  if (role === 'WAITER') {
    idleTime = 600000;
  } else if (role === 'KITCHEN') {
    idleTime = 3600000; // 1 hour
  }

  const handleIdle = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('staffId');
    localStorage.removeItem('role');

    alert('Session expired due to inactivity.');
    navigate('/staffLogin');
  };

  useIdleTimeout(handleIdle, idleTime);

  return <>{children}</>;
};

export default StaffIdleWrapper;
