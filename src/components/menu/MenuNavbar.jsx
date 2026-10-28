import React, { useState } from 'react';
import { Search, ShoppingBag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const MenuNavbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableInputValue, setTableInputValue] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  const handleCloseModal = () => {
    setShowTableModal(false);
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
    setTableInputValue('');
  };

  const handleVerifyPin = () => {
    const validPin = import.meta.env.VITE_DEVICE_PIN || '1234';
    if (pinInput === validPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN');
    }
  };

  const handleSaveTable = () => {
    localStorage.setItem('DEVICE_TABLE_NUMBER', tableInputValue);
    if (tableInputValue === '0000') {
      alert("Device locked to Takeaway Kiosk Mode");
    }
    handleCloseModal();
    window.location.reload();
  };

  return (
    <>
    <nav className="bg-[#2d2d2d] px-6 py-4 sticky top-0 z-50 shadow-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer select-none" 
          onClick={(e) => {
            if (e.detail === 3) {
              setShowTableModal(true);
            } else {
              navigate("/");
            }
          }}
        >
          <h1 className="text-2xl font-bold gradient-text tracking-tight">TasteTrek</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 w-full max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF3131] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search for your favorite food..."
            className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3131]/50 focus:border-transparent transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#333333] hover:bg-[#3d3d3d] text-white transition-all border border-white/5 hover:border-white/10 group"
          >
            <ShoppingBag className="w-5 h-5 text-[#FF914D] group-hover:text-[#FF3131] transition-colors" />
            <span className="font-medium text-sm">My Orders</span>
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3131] to-[#FF914D] flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </nav>

      {/* Table Assignment Modal */}
      <Dialog open={showTableModal} onClose={handleCloseModal}>
        {!isAuthenticated ? (
          <>
            <DialogTitle>Admin Authentication Required</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Admin PIN"
                type="password"
                fullWidth
                variant="outlined"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                error={!!pinError}
                helperText={pinError}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyPin();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleVerifyPin} variant="contained" color="primary">
                Verify
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Admin: Assign Device to Table</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Table Number (0000 for Takeaway Kiosk)"
                type="text"
                fullWidth
                variant="outlined"
                value={tableInputValue}
                onChange={(e) => setTableInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTable();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleSaveTable} variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default MenuNavbar;