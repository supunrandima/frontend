import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ItemCustomizationModal = ({ open, onClose, item, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [specialNote, setSpecialNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset state when modal opens with a new item
  useEffect(() => {
    if (open) {
      setSelectedOptions([]);
      setSpecialNote('');
      setQuantity(1);
    }
  }, [open, item]);

  if (!item) return null;

  const handleOptionToggle = (option) => {
    const currentIndex = selectedOptions.findIndex(o => o.name === option.name);
    const newSelectedOptions = [...selectedOptions];

    if (currentIndex === -1) {
      newSelectedOptions.push(option);
    } else {
      newSelectedOptions.splice(currentIndex, 1);
    }

    setSelectedOptions(newSelectedOptions);
  };

  const customizationsPrice = selectedOptions.reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);
  const totalPrice = (item.price + customizationsPrice) * quantity;

  const handleAdd = () => {
    onAddToCart(item, quantity, selectedOptions, specialNote);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: '#1a1a1a', // Set dark background
          color: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none' // Disable MUI default elevation gradient
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#2d2d2d', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          Customize {item.name}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: '#aaaaaa', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ borderColor: 'rgba(255,255,255,0.1)', bgcolor: '#1a1a1a', pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
            {item.description}
          </Typography>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#FF914D' }}>
            Base Price: ${item.price.toFixed(2)}
          </Typography>
        </Box>

        {item.customizationOptions && item.customizationOptions.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, textTransform: 'uppercase', color: 'gray' }}>
              Add-ons & Modifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {item.customizationOptions.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedOptions.some(o => o.name === option.name)}
                      onChange={() => handleOptionToggle(option)}
                      sx={{
                        color: 'rgba(255,255,255,0.5)',
                        '&.Mui-checked': {
                          color: '#FF914D',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', ml: 1 }}>
                      <Typography sx={{ color: 'white' }}>{option.name}</Typography>
                      {option.additionalPrice > 0 && (
                        <Typography sx={{ color: '#FF914D', fontWeight: 'bold', ml: 2 }}>
                          +${option.additionalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, '& .MuiFormControlLabel-label': { width: '100%' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, textTransform: 'uppercase', color: 'gray' }}>
            Special Instructions
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="E.g., No onions, dressing on the side..."
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white', // Makes the typed text white
                backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle grey/white background instead of red
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF914D',
                },
                // Specifically target the placeholder to make it visible
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 1, // Overrides MUI's default low opacity
                },
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4 }}>
          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(0,0,0,0.3)', p: 0.5, borderRadius: 2 }}>
            <Button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              sx={{ minWidth: '40px', color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
            >
              -
            </Button>
            <Typography sx={{ fontWeight: 'bold', color: 'white', width: '20px', textAlign: 'center' }}>
              {quantity}
            </Typography>
            <Button 
              onClick={() => setQuantity(quantity + 1)}
              sx={{ minWidth: '40px', color: 'white', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
            >
              +
            </Button>
          </Box>
        </Box>

      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: '#1a1a1a' }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: '#aaaaaa', 
            fontWeight: 'bold', 
            textTransform: 'none',
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAdd}
          startIcon={<AddShoppingCartIcon />}
          sx={{ 
            background: 'linear-gradient(90deg, #FF3131, #FF914D)',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'none',
            px: 4,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(255, 49, 49, 0.4)',
            '&:hover': {
              background: 'linear-gradient(90deg, #ff4b4b, #ffa56b)',
            }
          }}
        >
          Add to Cart - ${totalPrice.toFixed(2)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemCustomizationModal;
