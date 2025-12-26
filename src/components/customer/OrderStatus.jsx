import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';
import { CheckCircle, Clock, ChefHat, Bell, ArrowLeft, Loader2, Utensils } from 'lucide-react';

const OrderStatus = () => {
    const { orderId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrderById(orderId);
                setOrder(response.data);
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

            {/* Status Tracker Card */}
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

            {/* Back Button */}
            <button 
                onClick={() => navigate('/menu')}
                className="mt-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Menu
            </button>
        </div>
    );
};

export default OrderStatus;