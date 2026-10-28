import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeNewOrder, getOrderById } from '../../services/orderService'; 
import { createCheckoutSession } from '../../services/paymentService';
import { QRCodeCanvas } from "qrcode.react"; 
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  ArrowLeft
} from 'lucide-react';
import { Dialog, DialogContent, CircularProgress, Box, Typography } from '@mui/material';

const PaymentCheckout = () => {
    const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    
    // UI State
    const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' or 'CASH'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // QR / Payment State
    const [pendingOrder, setPendingOrder] = useState(null); 
    const [checkoutUrl, setCheckoutUrl] = useState('');
    
    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    // Protect the route: must have cart items and come from Step 1 (OrderReview)
    useEffect(() => {
        if (cartItems.length === 0 && !pendingOrder) {
            navigate('/menu'); 
        } else if (!location.state?.orderType && !pendingOrder) {
            navigate('/review');
        }
    }, [cartItems, location.state, navigate, pendingOrder]);

    // POLL FOR PAYMENT SUCCESS (For Online Payment via Stripe QR)
    useEffect(() => {
        let interval;
        if (pendingOrder) {
            interval = setInterval(async () => {
                try {
                    const response = await getOrderById(pendingOrder);
                    if (response.data.paymentStatus === 'PAID') {
                        clearInterval(interval);
                        localStorage.setItem('currentOrderId', pendingOrder);
                        clearCart();
                        navigate(`/order-status/${pendingOrder}`);
                    }
                } catch (error) {
                    console.error("Polling payment status error:", error);
                }
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [pendingOrder, navigate, clearCart]);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        const customerId = localStorage.getItem('customerId'); 
        const customerPhone = localStorage.getItem('customerPhone');

        const payload = {
            items: cartItems.map(item => ({
                menuItemId: item.menuItemId,
                name: item.name,
                itemCode: item.itemCode,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
            })),
            orderType: 'TAKEOUT',
            tableNumber: null,
            customerId, 
            customerPhone,
            totalAmount: totalPrice,
            // Status: 'AWAITING_CASH' if paying cash, otherwise 'PENDING_PAYMENT' for CARD (polled to PAID)
            paymentStatus: paymentMethod === 'CASH' ? 'AWAITING_CASH' : 'PENDING_PAYMENT',
            orderStatus: 'PLACED'
        };

        try {
            // Save order in backend
            const response = await placeNewOrder(payload);
            const { orderId } = response.data; 

            if (paymentMethod === 'CASH') {
                localStorage.setItem('currentOrderId', orderId);
                clearCart();
                navigate(`/order-status/${orderId}`); 
            } else {
                // Initialize Stripe session for online payment
                try {
                    const sessionRes = await createCheckoutSession(orderId);
                    const url = sessionRes.data.checkoutUrl;
                    
                    if (url) {
                        setCheckoutUrl(url);
                        setPendingOrder(orderId); // Show the QR code Dialog
                    } else {
                        throw new Error("No checkout URL returned from the server.");
                    }
                } catch (sessionError) {
                    console.error("Stripe Checkout initialization error:", sessionError);
                    setMessage({ type: 'error', text: "Failed to initialize payment. Please try again." });
                }
                setIsSubmitting(false); 
            }
        } catch (error) {
            console.error("Order placement failed:", error);
            setMessage({ type: 'error', text: "Order placement failed." });
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0 && !isSubmitting && !pendingOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF3131]" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#1a1a1a] flex justify-center items-start font-poppins relative">
            
            {/* --- QR CODE MODAL --- */}
            <Dialog 
                open={!!pendingOrder} 
                onClose={() => setPendingOrder(null)}
                slotProps={{
                    backdrop: {
                        sx: {
                            backdropFilter: 'blur(15px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                }}
                PaperProps={{
                    sx: { 
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)', 
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff', 
                        borderRadius: 8,
                        minWidth: 450,
                        textAlign: 'center',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                    }
                }}
            >
                <DialogContent sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                        <Smartphone className="w-12 h-12 text-[#FF914D] animate-pulse mx-auto" />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Scan to Pay</Typography>
                    <Typography variant="body1" sx={{ color: '#aaaaaa', mb: 4 }}>
                        Use your personal phone to pay securely.
                    </Typography>
                    
                    {/* QR Code Container */}
                    <Box sx={{ 
                        bgcolor: '#ffffff', 
                        p: 3, 
                        borderRadius: 6, 
                        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)',
                        mb: 4
                    }}>
                        {checkoutUrl ? (
                            <QRCodeCanvas value={checkoutUrl} size={240} />
                        ) : (
                            <Box sx={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress color="inherit" />
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#aaaaaa' }}>
                        <CircularProgress size={20} color="inherit" />
                        <Typography variant="body2">Waiting for payment confirmation...</Typography>
                    </Box>
                    
                    <button 
                        onClick={() => setPendingOrder(null)} 
                        className="mt-8 text-sm text-[#FF3131] hover:underline"
                    >
                        Cancel and return to checkout
                    </button>
                </DialogContent>
            </Dialog>

            <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 h-fit border border-white/10 border-t-4 border-t-[#FF3131] text-white">
                <button 
                    onClick={() => navigate('/review')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold mb-6 transition-all bg-transparent border-none p-0 cursor-pointer"
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Order Review
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Payment Details</h2>
                <p className="text-sm text-gray-400 mb-6">Choose how you would like to pay for your takeaway order.</p>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}
                
                <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Takeaway Order Total</p>
                        <p className="text-sm text-gray-300 mt-0.5">{totalItems} items</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#FF914D]">${totalPrice.toFixed(2)}</p>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-8">
                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[#FF914D] bg-[#FF914D]/10 text-white' : 'border-white/10 hover:border-white/30 text-gray-400 hover:bg-white/5'}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod"
                                    value="CARD" 
                                    checked={paymentMethod === 'CARD'} 
                                    onChange={() => setPaymentMethod('CARD')} 
                                    className="sr-only" 
                                    disabled={isSubmitting}
                                />
                                <CreditCard className="w-6 h-6 mb-2" />
                                <span className="font-bold text-sm">Pay Online</span>
                                <span className="text-[10px] text-gray-500 mt-1">Scan QR Code</span>
                                {paymentMethod === 'CARD' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#FF914D]" />}
                            </label>

                            <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-[#FF914D] bg-[#FF914D]/10 text-white' : 'border-white/10 hover:border-white/30 text-gray-400 hover:bg-white/5'}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod"
                                    value="CASH" 
                                    checked={paymentMethod === 'CASH'} 
                                    onChange={() => setPaymentMethod('CASH')} 
                                    className="sr-only" 
                                    disabled={isSubmitting}
                                />
                                <Banknote className="w-6 h-6 mb-2" />
                                <span className="font-bold text-sm">Pay Cash</span>
                                <span className="text-[10px] text-gray-500 mt-1">At Counter</span>
                                {paymentMethod === 'CASH' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#FF914D]" />}
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_rgba(255,49,49,0.3)] hover:shadow-[0_12px_25px_rgba(255,49,49,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3" 
                        disabled={isSubmitting || cartItems.length === 0}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>{paymentMethod === 'CARD' ? 'Generate QR Code' : 'Place Order & Pay Cash'} &nbsp;•&nbsp; ${totalPrice.toFixed(2)}</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentCheckout;
