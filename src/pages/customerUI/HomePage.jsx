import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, User, ChefHat, X, KeyRound, MapPin } from 'lucide-react';
import { continueAsGuest } from '../../services/guestService';

const HomePage = () => {
  const navigate = useNavigate();

  const [showTableModal, setShowTableModal] = React.useState(false);
  const [tableInputValue, setTableInputValue] = React.useState('');
  const [pinInput, setPinInput] = React.useState('');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [pinError, setPinError] = React.useState('');
  const [isClickingHeader, setIsClickingHeader] = React.useState(false);

  const handleHeaderClick = (e) => {
    if (e.detail === 3) {
      setTableInputValue(localStorage.getItem('DEVICE_TABLE_NUMBER') || '');
      setShowTableModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowTableModal(false);
    setTimeout(() => {
        setIsAuthenticated(false);
        setPinInput('');
        setPinError('');
        setTableInputValue('');
    }, 300); // Wait for unmount animation
  };

  const handleVerifyPin = () => {
    const validPin = import.meta.env.VITE_DEVICE_PIN || '1234';
    if (pinInput === validPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN');
      setPinInput(''); // clear on fail
    }
  };

  const handleSaveTable = () => {
    const trimmed = tableInputValue.trim();
    if (trimmed) {
      localStorage.setItem('DEVICE_TABLE_NUMBER', trimmed);
      if (trimmed === '0000') {
        alert("Device locked to Takeaway Kiosk Mode");
      } else {
        alert(`Device Table Number set to: ${trimmed}`);
      }
    } else {
      localStorage.removeItem('DEVICE_TABLE_NUMBER');
      alert("Device Table Number cleared.");
    }
    handleCloseModal();
  };

  const saveSession = (data) => {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("customerId", data.customerId); // Stores "GUEST-..." or DB ID
      localStorage.setItem("customerName", data.customerName);
      localStorage.setItem("userRole", data.role || "CUSTOMER");
      
      if (data.customerPhone) localStorage.setItem("customerPhone", data.customerPhone);
      else localStorage.removeItem("customerPhone");
  };

  const handleGuest = async () => {
    try {
      const response = await continueAsGuest();
      saveSession(response.data);
      navigate('/menu');
    } catch (err) {
      console.error('Guest login failed:', err);
      navigate('/menu');
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black flex flex-col items-center justify-center p-4 font-poppins selection:bg-orange-500/30 overflow-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-10 flex flex-col items-center w-full max-w-5xl"
      >
        {/* Header */}
        <motion.div 
            variants={itemVariants}
            onClick={handleHeaderClick}
            onMouseDown={() => setIsClickingHeader(true)}
            onMouseUp={() => setIsClickingHeader(false)}
            onMouseLeave={() => setIsClickingHeader(false)}
            className={`text-center mb-16 cursor-pointer select-none transition-transform duration-100 ${isClickingHeader ? 'scale-95' : 'scale-100'}`}
        >
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="inline-block p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.15)] mb-6"
          >
            <ChefHat className="w-20 h-20 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 drop-shadow-sm mb-4">
            TASTE TREK
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-gray-400 tracking-widest uppercase">
            How would you like to order?
          </h2>
        </motion.div>

        {/* Landing Buttons */}
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center px-4">
          
          {/* Log In Card */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/CustomerLogin')}
            className="group relative w-full md:w-[400px] h-[350px] rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:border-orange-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_30px_rgba(249,115,22,0.5)] group-hover:shadow-[0_0_50px_rgba(249,115,22,0.8)] transition-shadow duration-300 mb-6">
                    <User className="w-16 h-16 text-white" />
                </div>
                <span className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-orange-400 transition-colors">Log In</span>
                <span className="text-lg text-gray-300 font-medium tracking-wide">& Earn Points</span>
            </div>
          </motion.button>
          
          {/* Order as Guest Card */}
          <motion.button 
            variants={itemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGuest}
            className="group relative w-full md:w-[400px] h-[350px] rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_rgba(13,148,136,0.3)] hover:border-teal-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-5 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-[0_0_30px_rgba(20,184,166,0.5)] group-hover:shadow-[0_0_50px_rgba(20,184,166,0.8)] transition-shadow duration-300 mb-6">
                    <Utensils className="w-16 h-16 text-white" />
                </div>
                <span className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-teal-400 transition-colors">Order</span>
                <span className="text-lg text-gray-300 font-medium tracking-wide">as Guest</span>
            </div>
          </motion.button>

        </div>
      </motion.div>

      {/* Custom Tailwind Admin Modal */}
      <AnimatePresence>
        {showTableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 font-poppins">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="relative w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Decorative Top Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <button 
                    onClick={handleCloseModal}
                    className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {!isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <KeyRound className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Device PIN</label>
                            <input
                                autoFocus
                                type="password"
                                placeholder="Enter admin PIN..."
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                                className={`w-full bg-black/50 border ${pinError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'} rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors shadow-inner`}
                            />
                            {pinError && <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">! {pinError}</p>}
                        </div>
                        
                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={handleCloseModal}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleVerifyPin}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <MapPin className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Device Configuration</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Table Assignment</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. 12 or 0000 for Takeaway"
                                value={tableInputValue}
                                onChange={(e) => setTableInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTable()}
                                className="w-full bg-black/50 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors shadow-inner"
                            />
                            <p className="text-xs text-gray-500 mt-2">Enter <strong className="text-white">0000</strong> to lock this device in Takeaway Kiosk mode.</p>
                        </div>
                        
                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={handleCloseModal}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveTable}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                  </>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HomePage;