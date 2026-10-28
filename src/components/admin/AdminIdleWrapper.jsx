import React from 'react';
import { useNavigate } from 'react-router-dom';
import useIdleTimeout from '../../hooks/useIdleTimeout';

const AdminIdleWrapper = ({ children }) => {
  const navigate = useNavigate();

  const handleIdle = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminId');
    localStorage.removeItem('role');

    alert('Session expired due to inactivity.');
    navigate('/adminLogin');
  };

  useIdleTimeout(handleIdle, 120000); // 2 minutes

  return <>{children}</>;
};

export default AdminIdleWrapper;
