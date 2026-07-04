import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const OrderModeSelection = () => {
  const navigate = useNavigate();

  const handleModeSelection = (mode) => {
    localStorage.setItem('orderMode', mode);
    navigate('/menu');
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#1f2937' }}>
          Welcome
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 8 }}>
          Please select how you would like to receive your order
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, justifyContent: 'center' }}>
          {/* Dine In Option */}
          <Card 
            sx={{ 
              flex: 1, 
              cursor: 'pointer', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              borderRadius: 4
            }}
            onClick={() => handleModeSelection('dine-in')}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
              <Box sx={{ 
                bgcolor: '#e0f2fe', 
                p: 3, 
                borderRadius: '50%', 
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <RestaurantIcon sx={{ fontSize: 64, color: '#0284c7' }} />
              </Box>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
                Dine In
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enjoy your meal at our restaurant
              </Typography>
            </CardContent>
          </Card>

          {/* Takeaway Option */}
          <Card 
            sx={{ 
              flex: 1, 
              cursor: 'pointer', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
              borderRadius: 4
            }}
            onClick={() => handleModeSelection('takeaway')}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 6 }}>
              <Box sx={{ 
                bgcolor: '#fef3c7', 
                p: 3, 
                borderRadius: '50%', 
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ShoppingBagIcon sx={{ fontSize: 64, color: '#d97706' }} />
              </Box>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
                Takeaway
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Grab your food and go
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default OrderModeSelection;
