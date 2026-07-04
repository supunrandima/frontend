import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeNewOrder, getOrderById } from '../../services/orderService'; 
import { createCheckoutSession } from '../../services/paymentService';
import { QRCodeCanvas } from "qrcode.react"; 
import { 
  ShoppingCart as CartIcon, 
  MinusCircle, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  CreditCard, 
  Banknote, 
  Smartphone 
} from 'lucide-react';
import { Dialog, DialogContent, CircularProgress, Box, Typography } from '@mui/material';

const Checkout = () => {
    const { cartItems, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    
    // UI State
    const [orderType, setOrderType] = useState('TABLE');
    const [paymentMethod, setPaymentMethod] = useState('CARD'); 
    const [tableNumber, setTableNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // QR / Payment State
    const [pendingOrder, setPendingOrder] = useState(null); 
    const [checkoutUrl, setCheckoutUrl] = useState('');
    
    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    // Redirect to menu if cart is empty and no payment is pending
    useEffect(() => {
        if (cartItems.length === 0 && !pendingOrder) {
            navigate('/menu'); 
        }
    }, [cartItems, navigate, pendingOrder]);

    // --- POLL FOR PAYMENT SUCCESS ---
    // This effect runs when a QR code is displayed to check the database for status changes
    useEffect(() => {
        let interval;
        if (pendingOrder) {
            interval = setInterval(async () => {
                try {
                    const response = await getOrderById(pendingOrder);
                    // Check if paymentStatus has been updated to PAID by Stripe/Backend
                    if (response.data.paymentStatus === 'PAID') {
                        clearInterval(interval);
                        localStorage.setItem('currentOrderId', pendingOrder);
                        clearCart();
                        navigate(`/order-status/${pendingOrder}`);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 4000); // Poll every 4 seconds to balance responsiveness and server load
        }
        return () => clearInterval(interval);
    }, [pendingOrder, navigate, clearCart]);


    const handlePlaceOrder = async (e) => {
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
            })),
            orderType,
            tableNumber: orderType === 'TABLE' ? deviceTableNumber : null,
            customerId, 
            customerPhone,
            totalAmount: totalPrice,
            // Status depends on payment method selection
            paymentStatus: paymentMethod === 'CASH' ? 'AWAITING_CASH_COLLECTION' : 'PENDING_PAYMENT',
            orderStatus: 'PLACED'
        };

        try {
            // 1. Save the order in MongoDB first
            const response = await placeNewOrder(payload);
            const { orderId } = response.data; 

            if (paymentMethod === 'CASH') {
                localStorage.setItem('currentOrderId', orderId);
                clearCart();
                navigate(`/order-status/${orderId}`); 
            } else {
                // 2. If Card is selected, initialize the Stripe Checkout Session
                try {
                    const sessionRes = await createCheckoutSession(orderId);
                    const url = sessionRes.data.checkoutUrl;
                    
                    if (url) {
                        setCheckoutUrl(url);
                        setPendingOrder(orderId); // Trigger the QR Modal
                    } else {
                        throw new Error("No checkout URL returned from the server.");
                    }
                } catch (sessionError) {
                    console.error("Payment session error:", sessionError);
                    setMessage({ type: 'error', text: "Failed to initialize payment. Please try again." });
                }
                setIsSubmitting(false); 
            }

        } catch (error) {
            console.error("Order failed:", error);
            setMessage({ type: 'error', text: "Order placement failed." });
            setIsSubmitting(false);
        }
    };

    const renderCartItem = (item) => (
        <div key={item.menuItemId} className="flex items-center py-4 border-b border-gray-100 last:border-0">
            <div className="flex flex-col flex-1 min-w-0 pr-3">
                <span className="font-semibold text-gray-800 truncate text-base">{item.name}</span>
                <span className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} ea</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-1 rounded-md text-gray-500 hover:text-[#FF3131] hover:bg-white shadow-sm"><MinusCircle className="w-5 h-5" /></button>
                <span className="font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-1 rounded-md text-gray-500 hover:text-green-600 hover:bg-white shadow-sm"><PlusCircle className="w-5 h-5" /></button>
            </div>
            <div className="w-20 text-right font-bold text-gray-800">${(item.unitPrice * item.quantity).toFixed(2)}</div>
        </div>
    );

    if (cartItems.length === 0 && !isSubmitting && !pendingOrder) return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]"><Loader2 className="w-8 h-8 animate-spin text-[#FF3131]" /></div>;

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#1a1a1a] flex justify-center items-start font-poppins relative">
            
            {/* --- MODERN QR CODE MODAL --- */}
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

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Summary Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg"><CartIcon className="w-6 h-6 text-[#FF914D]"/></div>
                        Review Order <span className="text-gray-400 text-base font-normal">({totalItems} items)</span>
                    </h2>
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map(renderCartItem)}
                    </div>
                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100 bg-gray-50/50 -mx-6 px-6 pb-2">
                        <div className="flex justify-between items-center text-gray-600 mb-2">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-bold mb-1">
                            <span>Total</span>
                            <span className="text-[#FF3131]">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Right: Checkout Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border-t-4 border-[#FF3131]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Details</h2>
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        {/* Dining Option */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dining Option</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex flex-col items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === 'TABLE' ? 'border-[#FF3131] bg-red-50 text-[#FF3131]' : 'border-gray-200'}`}>
                                    <input type="radio" value="TABLE" checked={orderType === 'TABLE'} onChange={() => setOrderType('TABLE')} className="sr-only" disabled={isSubmitting}/>
                                    <span className="font-bold">Dine-In</span>
                                </label>
                                <label className={`flex flex-col items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === 'TAKEOUT' ? 'border-[#FF3131] bg-red-50 text-[#FF3131]' : 'border-gray-200'}`}>
                                    <input type="radio" value="TAKEOUT" checked={orderType === 'TAKEOUT'} onChange={() => setOrderType('TAKEOUT')} className="sr-only" disabled={isSubmitting}/>
                                    <span className="font-bold">Takeout</span>
                                </label>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                    <input type="radio" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} className="sr-only" disabled={isSubmitting}/>
                                    <CreditCard className="w-6 h-6 mb-2" />
                                    <span className="font-bold text-sm">Pay Online</span>
                                    <span className="text-[10px] text-gray-400 mt-1">Scan QR</span>
                                    {paymentMethod === 'CARD' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />}
                                </label>

                                <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                                    <input type="radio" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="sr-only" disabled={isSubmitting}/>
                                    <Banknote className="w-6 h-6 mb-2" />
                                    <span className="font-bold text-sm">Pay Cash</span>
                                    <span className="text-[10px] text-gray-400 mt-1">At Counter</span>
                                    {paymentMethod === 'CASH' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-green-500" />}
                                </label>
                            </div>
                        </div>

                        
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3" 
                            disabled={isSubmitting || cartItems.length === 0}
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                <>{paymentMethod === 'CARD' ? 'Generate QR Code' : 'Place Order'} &nbsp;•&nbsp; ${totalPrice.toFixed(2)}</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;