import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updatePaymentStatus, generatePaymentQR, cancelOrder, undoRecentAdditions } from '../../services/orderService';
import { submitFeedback } from '../../services/feedbackService';
import { 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Bell, 
  ArrowLeft, 
  Loader2, 
  Utensils, 
  Star, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { QRCodeCanvas } from "qrcode.react"; 
import { Dialog, DialogContent, CircularProgress, Box, Typography } from '@mui/material';

const OrderStatus = () => {
    const { orderId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const isKiosk = localStorage.getItem('DEVICE_TABLE_NUMBER') === '0000';
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    // Payment States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' or 'CASH'
    const [modalStep, setModalStep] = useState('SELECT'); // 'SELECT', 'QR', 'SUCCESS'
    const [checkoutUrl, setCheckoutUrl] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const [timeLeft, setTimeLeft] = useState(0);
    const [isCancelling, setIsCancelling] = useState(false);

    // Define the progression of steps
    const steps = [
        { status: 'PENDING', label: 'Order Received', icon: Clock },
        { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
        { status: 'READY', label: 'Ready to Serve', icon: Bell },
        { status: 'SERVED', label: 'Enjoy!', icon: Utensils },
    ];

    // Helper to check if a step is completed
    const isStepActive = (stepStatus, currentStatus) => {
        const statusOrder = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
        return statusOrder.indexOf(currentStatus) >= statusOrder.indexOf(stepStatus);
    };

    const endSession = () => {
        const deviceTable = localStorage.getItem('DEVICE_TABLE_NUMBER');
        const custId = localStorage.getItem('customerId');
        localStorage.clear();
        clearCart();
        if (deviceTable) localStorage.setItem('DEVICE_TABLE_NUMBER', deviceTable);
        if (custId) localStorage.setItem('customerId', custId);
        navigate('/');
    };

    const handleUndo = async () => {
        try {
            setIsCancelling(true);
            const response = await undoRecentAdditions(orderId);
            
            if (response.data.order && response.data.order.status === 'CANCELLED') {
                clearCart();
                const deviceTable = localStorage.getItem('DEVICE_TABLE_NUMBER');
                const custId = localStorage.getItem('customerId');
                localStorage.clear();
                if (deviceTable) localStorage.setItem('DEVICE_TABLE_NUMBER', deviceTable);
                if (custId) localStorage.setItem('customerId', custId);
                navigate('/menu');
            } else {
                setOrder(response.data.order);
                setTimeLeft(0); // the items were undone, timer should stop
            }
        } catch (error) {
            console.error("Failed to undo order:", error);
            alert(error.response?.data?.error || "Failed to undo order");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleSubmitFeedback = async () => {
        try {
            const payload = {
                customerId: order.customerId,
                orderId: order.orderId,
                rating: rating,
                comments: comment
            };
            await submitFeedback(payload);
            endSession();
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    // Main fetch & polling effect (kitchen progress & general updates)
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(orderId);
                setOrder(response.data);

                if (response.data && response.data.paymentStatus === 'PAID' && isKiosk) {
                    setModalStep('SUCCESS');
                    setShowPaymentModal(true);
                    setTimeout(() => {
                        endSession();
                    }, 3000);
                }

                if (response.data && response.data.status === 'SERVED') {
                    // Only show feedback modal for Dine-In if payment is PAID
                    if (response.data.orderType === 'TABLE') {
                        if (response.data.paymentStatus === 'PAID') {
                            if (!isKiosk) { setShowFeedbackModal(true); }
                        }
                    } else {
                        if (!isKiosk) { setShowFeedbackModal(true); }
                    }
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // POLL: Check status every 5 seconds for live updates
        const interval = setInterval(fetchOrder, 5000); 
        return () => clearInterval(interval);

    }, [orderId, isKiosk]);

    // Timer setup for 30s cancellation window
    useEffect(() => {
        if (!order || !order.items) {
            setTimeLeft(0);
            return;
        }

        let latestTime = 0;
        order.items.forEach(item => {
            if (item.addedAt) {
                const itemTime = new Date(item.addedAt).getTime();
                if (itemTime > latestTime) {
                    latestTime = itemTime;
                }
            }
        });

        if (latestTime === 0 && order.createdAt) {
            latestTime = new Date(order.createdAt).getTime();
        }

        if (latestTime === 0) {
            setTimeLeft(0);
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diffSec = Math.floor((now - latestTime) / 1000);
            const remaining = 30 - diffSec;

            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                setTimeLeft(0);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [order]);

    // Dedicated Polling Effect for QR payment completion (checks status every 4 seconds)
    useEffect(() => {
        let qrPollInterval;
        if (showPaymentModal && modalStep === 'QR') {
            qrPollInterval = setInterval(async () => {
                try {
                    const response = await getOrderById(orderId);
                    if (response.data.paymentStatus === 'PAID') {
                        clearInterval(qrPollInterval);
                        setModalStep('SUCCESS');
                        setOrder(response.data);
                    }
                } catch (error) {
                    console.error("Polling payment status in modal error:", error);
                }
            }, 4000);
        }
        return () => clearInterval(qrPollInterval);
    }, [showPaymentModal, modalStep, orderId]);

    const handleInitPostPayment = async (e) => {
        e.preventDefault();
        setPaymentError('');
        setIsSubmittingPayment(true);

        if (paymentMethod === 'CASH') {
            try {
                await updatePaymentStatus(orderId, 'CASH');
                // Instantly update local state to AWAITING_CASH
                setOrder(prev => prev ? { ...prev, paymentStatus: 'AWAITING_CASH' } : null);
                setShowPaymentModal(false);
                setIsSubmittingPayment(false);
            } catch (error) {
                console.error("Failed to transition to CASH status:", error);
                setPaymentError("Failed to initiate cash request. Please try again.");
                setIsSubmittingPayment(false);
            }
        } else {
            // CARD
            try {
                const response = await generatePaymentQR(orderId);
                const url = response.data.checkoutUrl;
                if (url) {
                    setCheckoutUrl(url);
                    setModalStep('QR');
                } else {
                    throw new Error("No checkout URL returned from payment server.");
                }
            } catch (error) {
                console.error("Failed to generate payment session:", error);
                setPaymentError("Failed to generate payment code. Please try again.");
            } finally {
                setIsSubmittingPayment(false);
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex justify-center items-center text-[#FF3131]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    if (!order) return <div className="min-h-screen bg-[#1a1a1a] text-white flex justify-center items-center">Order not found.</div>;

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-6 flex flex-col items-center font-poppins">
            
            {/* Success Animation Area */}
            <div className="text-center mt-8 mb-12">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
                <p className="text-gray-400 font-mono text-lg tracking-widest">#{order.orderId}</p>
                <p className="text-gray-500 text-sm mt-1">Sit back, we're working on it.</p>
            </div>

            {/* Status Tracker Card or Waiter Summon Message */}
            {order.paymentStatus === 'AWAITING_CASH' || order.paymentStatus === 'AWAITING_CASH_COLLECTION' ? (
                <div className="w-full max-w-md bg-[#2d2d2d] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-yellow-500/20">
                        <Bell className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Awaiting Cash Collection</h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        A waiter is on the way to your table to collect your cash payment.
                        {order.orderType === 'TAKEOUT' && " The kitchen will begin preparing your meal once payment is confirmed."}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span>
                        <span>Waiting for cash confirmation...</span>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-[#2d2d2d] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D]"></div>
                    
                    {order.orderType !== 'TAKEOUT' && (
                        <div className="relative">
                            {/* Vertical Connecting Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-white/10 rounded-full"></div>

                            {/* Steps List */}
                            <div className="space-y-8 relative">
                                {steps.map((step, index) => {
                                    const active = isStepActive(step.status, order.status);
                                    const current = order.status === step.status;
                                    const Icon = step.icon;
                                    
                                    return (
                                        <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-40'}`}>
                                            {/* Icon Bubble */}
                                            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#2d2d2d] transition-transform duration-500
                                                ${active ? 'bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white shadow-lg scale-110' : 'bg-gray-700 text-gray-400'}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            
                                            {/* Text Label */}
                                            <div>
                                                <h3 className={`font-bold text-lg ${active ? 'text-white' : 'text-gray-500'}`}>
                                                    {step.label}
                                                </h3>
                                                {current && (
                                                    <span className="text-xs text-[#FF914D] font-medium animate-pulse">
                                                        Current Status
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Itemized Receipt UI */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h4 className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider">Ordered Items</h4>
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <div className="flex-1">
                                        <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1 pl-4 border-l border-gray-600">
                                                {item.selectedCustomizations.map((c, i) => (
                                                    <div key={i}>{c.optionName} {c.additionalPrice > 0 ? `(+$${c.additionalPrice.toFixed(2)})` : ''}</div>
                                                ))}
                                            </div>
                                        )}
                                        {item.specialNote && (
                                            <div className="text-xs text-yellow-500/80 mt-1 pl-4 italic">
                                                Note: {item.specialNote}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-gray-300 font-medium whitespace-nowrap ml-4">
                                        ${(item.unitPrice * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="text-xl font-bold text-white">${order.totalAmount?.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3">
                        {/* Cancel Button */}
                        {timeLeft > 0 && (
                            <button
                                onClick={handleUndo}
                                disabled={isCancelling}
                                className="w-full bg-transparent border border-red-500/50 text-red-500 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                {isCancelling ? <CircularProgress size={16} color="inherit" /> : <X className="w-4 h-4" />}
                                Undo Last Addition ({timeLeft}s)
                            </button>
                        )}
                        
                        {/* Add More Items Button */}
                        {(order.status === 'PENDING' || order.status === 'PREPARING' || order.status === 'READY') && order.paymentStatus === 'PENDING_PAYMENT' && (
                            <button
                                onClick={() => navigate('/menu')}
                                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Utensils className="w-4 h-4" />
                                Add More Items
                            </button>
                        )}

                        {/* Pay Bill Option for Dine-In and Takeout */}
                        {(order.orderType === 'TABLE' || order.orderType === 'TAKEOUT') && order.paymentStatus === 'PENDING_PAYMENT' && (
                            <button
                                onClick={() => {
                                    setModalStep('SELECT');
                                    setPaymentMethod('CARD');
                                    setPaymentError('');
                                    setCheckoutUrl('');
                                    setShowPaymentModal(true);
                                }}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                {order.orderType === 'TAKEOUT' ? 'Pay Now' : (order.status === 'SERVED' ? 'Pay Bill' : 'Request Bill / Pay Now')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Back Button */}
            <button 
                onClick={() => navigate('/menu')}
                className="mt-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Menu
            </button>

            {/* Post-Dining Payment Modal */}
            <Dialog 
                open={showPaymentModal} 
                onClose={() => !isSubmittingPayment && setShowPaymentModal(false)}
                slotProps={{
                    backdrop: {
                        sx: {
                            backdropFilter: 'blur(15px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                }}
                PaperProps={{
                    className: "!bg-[#2d2d2d] !text-white !rounded-3xl",
                    sx: { 
                        minWidth: 450,
                        textAlign: 'center',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                    }
                }}
            >
                <DialogContent sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="!bg-[#2d2d2d] w-full h-full">
                    {modalStep === 'SELECT' && (
                        <div className="w-full">
                            <h3 className="text-2xl font-bold mb-2 text-white">Request Bill / Pay</h3>
                            <p className="text-sm text-gray-400 mb-4">Review your items and choose a payment method.</p>
                            
                            {/* Itemized Bill Container */}
                            <div className="w-full bg-[#1a1a1a] rounded-xl p-4 mb-4 text-left border border-white/5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-3">
                                    {order?.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <span className="text-blue-400 font-bold">{item.quantity}x</span>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-200 font-medium">{item.name}</span>
                                                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                                        <span className="text-[10px] text-gray-500">
                                                            {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-gray-400 font-mono">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Bill Amount (Footer of Receipt) */}
                            <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-white/5 border-t-white/10 flex justify-between items-center text-left">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Amount</p>
                                    <p className="text-xs text-gray-600 mt-0.5">Order ID: #{order?.orderId}</p>
                                </div>
                                <p className="text-2xl font-extrabold text-[#FF3131]">${order?.totalAmount?.toFixed(2)}</p>
                            </div>

                            {paymentError && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm flex items-start gap-2 text-left">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{paymentError}</span>
                                </div>
                            )}

                            <form onSubmit={handleInitPostPayment} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'}`}>
                                        <input 
                                            type="radio" 
                                            name="postPaymentMethod"
                                            value="CARD" 
                                            checked={paymentMethod === 'CARD'} 
                                            onChange={() => setPaymentMethod('CARD')} 
                                            className="sr-only" 
                                            disabled={isSubmittingPayment}
                                        />
                                        <CreditCard className="w-6 h-6 mb-2" />
                                        <span className="font-bold text-sm text-white">Pay Online</span>
                                        <span className="text-[10px] text-gray-500 mt-1">Scan QR Code</span>
                                        {paymentMethod === 'CARD' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-500" />}
                                    </label>

                                    <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-400'}`}>
                                        <input 
                                            type="radio" 
                                            name="postPaymentMethod"
                                            value="CASH" 
                                            checked={paymentMethod === 'CASH'} 
                                            onChange={() => setPaymentMethod('CASH')} 
                                            className="sr-only" 
                                            disabled={isSubmittingPayment}
                                        />
                                        <Banknote className="w-6 h-6 mb-2" />
                                        <span className="font-bold text-sm text-white">Pay Cash</span>
                                        <span className="text-[10px] text-gray-500 mt-1">Summon Waiter</span>
                                        {paymentMethod === 'CASH' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-green-500" />}
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 border border-white/10 hover:bg-white/5 py-4 text-white rounded-xl font-bold transition-all"
                                        disabled={isSubmittingPayment}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        disabled={isSubmittingPayment}
                                    >
                                        {isSubmittingPayment ? (
                                            <CircularProgress size={20} color="inherit" />
                                        ) : (
                                            <>{paymentMethod === 'CARD' ? 'Generate QR' : 'Request Cash'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {modalStep === 'QR' && (
                        <div className="flex flex-col items-center">
                            <Box sx={{ mb: 3 }}>
                                <Smartphone className="w-12 h-12 text-[#FF914D] animate-pulse mx-auto" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Scan to Pay</Typography>
                            <Typography variant="body1" sx={{ color: '#aaaaaa', mb: 4 }}>
                                Scan this code with your phone to complete payment.
                            </Typography>
                            
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

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#aaaaaa', mb: 2 }}>
                                <CircularProgress size={20} color="inherit" />
                                <Typography variant="body2">Waiting for payment confirmation...</Typography>
                            </Box>

                            <button 
                                onClick={() => setModalStep('SELECT')} 
                                className="mt-4 text-sm text-[#FF3131] hover:underline"
                            >
                                Back to options
                            </button>
                        </div>
                    )}

                    {modalStep === 'SUCCESS' && (
                        <div className="flex flex-col items-center py-4">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 animate-bounce">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-2">Payment Successful!</h3>
                            <p className="text-gray-400 text-sm mb-8 max-w-sm">
                                Thank you for dining with Taste Trek. We hope to see you again soon!
                            </p>
                            
                            {!isKiosk ? (
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setShowFeedbackModal(true);
                                    }}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-all"
                                >
                                    Finish & Give Feedback
                                </button>
                            ) : (
                                <p className="text-[#FF914D] font-medium animate-pulse mt-4">
                                    Resetting for next customer...
                                </p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Feedback Modal Overlay */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#2d2d2d] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF3131] to-[#FF914D]"></div>
                        
                        <h2 className="text-3xl font-extrabold text-white mb-2">Enjoy your meal!</h2>
                        <p className="text-gray-400 text-sm mb-6">We'd love to hear your feedback to serve you better.</p>
                        
                        {/* Star Rating Selection */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isFilled = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transition-transform active:scale-95"
                                    >
                                        <Star
                                            className={`w-10 h-10 ${
                                                isFilled
                                                    ? 'fill-[#FF914D] text-[#FF914D] scale-110 drop-shadow-[0_0_8px_rgba(255,145,77,0.5)]'
                                                    : 'text-gray-500 hover:text-gray-400'
                                            } transition-all duration-150`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Feedback Comments */}
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Leave a comment (optional)..."
                            className="w-full bg-[#1a1a1a] text-white p-4 rounded-2xl border border-white/10 focus:border-[#FF3131] outline-none text-sm placeholder-gray-600 transition-colors resize-none h-24 mb-6"
                        />
                        
                        {/* Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSubmitFeedback}
                                className="w-full bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Submit Feedback & Finish
                            </button>
                            <button
                                onClick={endSession}
                                className="w-full text-gray-500 hover:text-white font-medium py-2 text-sm transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderStatus;