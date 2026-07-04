import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';
import { CheckCircle, Clock, ChefHat, Bell, ArrowLeft, Loader2, Utensils, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const OrderStatus = () => {
    const { orderId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

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
        localStorage.clear();
        clearCart();
        if (deviceTable) {
            localStorage.setItem('DEVICE_TABLE_NUMBER', deviceTable);
        }
        navigate('/');
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(orderId);
                setOrder(response.data);
                if (response.data && response.data.status === 'SERVED') {
                    setShowFeedbackModal(true);
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

    }, [orderId]);

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
            {order.paymentStatus === 'AWAITING_CASH_COLLECTION' ? (
                <div className="w-full max-w-md bg-[#2d2d2d] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-yellow-500/20">
                        <Bell className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Awaiting Cash Collection</h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        A waiter is on the way to your table to collect your cash payment. The kitchen will begin preparing your meal once payment is confirmed.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span>
                        <span>Waiting for cash confirmation...</span>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-[#2d2d2d] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D]"></div>
                    
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

                    {/* Total Summary */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="text-xl font-bold text-white">${order.totalAmount.toFixed(2)}</span>
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
                                onClick={endSession}
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