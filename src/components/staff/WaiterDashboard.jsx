import React, { useState, useEffect, useRef } from 'react';
import { getKitchenOrders, markOrderAsPaid, updateOrderStatus } from '../../services/orderService';
import { Clock, CheckCircle, Bell, Loader2, RefreshCw, DollarSign, Utensils } from 'lucide-react';

const WaiterDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningOrderId, setActioningOrderId] = useState(null);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    
    const prevOrderIdsRef = useRef(new Set());

    const playNotificationSound = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Beep 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            gain1.gain.setValueAtTime(0.08, ctx.currentTime);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.12);

            // Beep 2
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                gain2.gain.setValueAtTime(0.08, ctx.currentTime);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.2);
            }, 120);
        } catch (e) {
            console.error("AudioContext playback blocked/unsupported:", e);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await getKitchenOrders();
            // Filter to show active waiter items (Awaiting payment OR Ready to serve)
            const activeOrders = response.data.filter(
                (order) => order.paymentStatus === 'AWAITING_CASH_COLLECTION' || order.status === 'READY'
            );

            // Detect new orders in polling
            let hasNew = false;
            const currentIds = new Set();
            activeOrders.forEach((o) => {
                currentIds.add(o.orderId);
                if (prevOrderIdsRef.current.size > 0 && !prevOrderIdsRef.current.has(o.orderId)) {
                    hasNew = true;
                }
            });

            prevOrderIdsRef.current = currentIds;

            if (hasNew) {
                playNotificationSound();
                setHasNewNotification(true);
            }

            setOrders(activeOrders);
        } catch (error) {
            console.error("Error fetching waiter orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Live Polling every 5 seconds
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmPayment = async (orderId) => {
        setActioningOrderId(orderId);
        try {
            await markOrderAsPaid(orderId);
            // Instantly remove from local state
            setOrders((prev) => prev.filter((o) => o.orderId !== orderId || o.status === 'READY'));
        } catch (error) {
            console.error("Failed to confirm payment:", error);
            alert("Error confirming payment. Please try again.");
        } finally {
            setActioningOrderId(null);
        }
    };

    const handleDeliverOrder = async (orderId) => {
        setActioningOrderId(orderId);
        try {
            await updateOrderStatus(orderId, 'SERVED');
            // Instantly remove from local state
            setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        } catch (error) {
            console.error("Failed to deliver order:", error);
            alert("Error delivering order. Please try again.");
        } finally {
            setActioningOrderId(null);
        }
    };

    const clearNotification = () => {
        setHasNewNotification(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex justify-center items-center text-[#FF3131]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    // Filter into two queues
    const paymentOrders = orders.filter((o) => o.paymentStatus === 'AWAITING_CASH_COLLECTION');
    const servingOrders = orders.filter((o) => o.status === 'READY' && o.paymentStatus !== 'AWAITING_CASH_COLLECTION');

    const renderPaymentCard = (order) => (
        <div key={order.orderId} className="bg-[#2d2d2d] rounded-2xl p-5 border border-white/5 shadow-xl transition-all flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">#{order.orderId}</h3>
                    <span className="text-[10px] text-yellow-500 font-extrabold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                        Awaiting Payment
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-white">
                        Table {order.tableNumber || 'UNASSIGNED'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
            <div className="space-y-1 mb-6">
                {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[#FF3131] font-bold w-6">{item.quantity}x</span>
                        <span className="flex-1 text-gray-300 truncate">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
                <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                    <span className="text-gray-400 text-xs font-bold uppercase">Collect</span>
                    <span className="text-xl font-bold text-green-400">${order.totalAmount.toFixed(2)}</span>
                </div>
                <button 
                    onClick={() => handleConfirmPayment(order.orderId)}
                    disabled={actioningOrderId === order.orderId}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-yellow-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {actioningOrderId === order.orderId ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Payment Received</>}
                </button>
            </div>
        </div>
    );

    const renderServingCard = (order) => (
        <div key={order.orderId} className="bg-[#2d2d2d] rounded-2xl p-5 border border-white/5 shadow-xl transition-all flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">#{order.orderId}</h3>
                    <span className="text-[10px] text-green-400 font-extrabold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider">
                        Ready to Serve
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-green-400 group-hover:scale-105 transition-transform">
                        Table {order.tableNumber || 'UNASSIGNED'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>
            <div className="space-y-1 mb-6">
                {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[#FF3131] font-bold w-6">{item.quantity}x</span>
                        <span className="flex-1 text-gray-300 truncate">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
                <button 
                    onClick={() => handleDeliverOrder(order.orderId)}
                    disabled={actioningOrderId === order.orderId}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-green-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {actioningOrderId === order.orderId ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Order Delivered</>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-6 font-poppins text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Bell className="w-10 h-10 text-[#FF914D]" /> Waiter Service Panel
                </h1>
                
                {/* Visual Bell Alert */}
                <div className="flex items-center gap-4">
                    {hasNewNotification && (
                        <button 
                            onClick={clearNotification}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-xs rounded-full animate-bounce flex items-center gap-2 shadow-lg"
                        >
                            <Bell className="w-4 h-4 animate-ring text-red-400" />
                            <span>New Tasks! Click to Silence</span>
                        </button>
                    )}
                    <span className="px-4 py-2 bg-[#2d2d2d] border border-white/10 text-gray-300 text-sm font-bold rounded-full">
                        {paymentOrders.length} Payments • {servingOrders.length} Serves
                    </span>
                    <button onClick={fetchOrders} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white shadow-md">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Split Columns Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column A: Payment Needed */}
                <div className="bg-[#212121]/30 p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <h2 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2 pb-3 border-b border-white/5 uppercase tracking-wide">
                        <DollarSign className="w-6 h-6 text-yellow-400" /> Payment Collection Queue ({paymentOrders.length})
                    </h2>
                    {paymentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/5 rounded-2xl bg-[#2d2d2d]/10">
                            <CheckCircle className="w-12 h-12 mb-3 text-yellow-500/20" />
                            <p className="font-bold">No payments pending</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {paymentOrders.map(renderPaymentCard)}
                        </div>
                    )}
                </div>

                {/* Column B: Ready to Serve */}
                <div className="bg-[#212121]/30 p-6 rounded-3xl border border-white/5 shadow-2xl">
                    <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2 pb-3 border-b border-white/5 uppercase tracking-wide">
                        <Utensils className="w-6 h-6 text-green-400" /> Deliver & Serve Queue ({servingOrders.length})
                    </h2>
                    {servingOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/5 rounded-2xl bg-[#2d2d2d]/10">
                            <CheckCircle className="w-12 h-12 mb-3 text-green-500/20" />
                            <p className="font-bold">No items ready to deliver</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {servingOrders.map(renderServingCard)}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WaiterDashboard;
