import React, { useState, useEffect, useRef } from 'react';
import { getWaiterOrders, updateOrderStatus, settleCash } from '../../services/orderService';
import { Clock, CheckCircle, Bell, Loader2, RefreshCw, DollarSign, Utensils, Coffee } from 'lucide-react';
import WaiterOpenTabs from './WaiterOpenTabs';
import ThermalReceipt from './ThermalReceipt';

const WaiterDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningOrderId, setActioningOrderId] = useState(null);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [activeTab, setActiveTab] = useState('ACTIVE_QUEUE'); // 'ACTIVE_QUEUE' or 'OPEN_TABS'
    const [receiptOrder, setReceiptOrder] = useState(null);
    
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
            const response = await getWaiterOrders();
            const activeOrders = response.data.filter(
                (order) => order.paymentStatus === 'AWAITING_CASH_COLLECTION' || order.paymentStatus === 'AWAITING_CASH' || order.status === 'READY'
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

    const handleConfirmPayment = async (order) => {
        setActioningOrderId(order.orderId);
        try {
            const response = await settleCash(order.orderId);
            const receiptAction = response.data?.receiptAction;

            if (receiptAction === 'EMAILED') {
                const wantsPrint = window.confirm("Payment confirmed and digital receipt emailed.\n\nDoes the customer also want a physical printout?");
                if (wantsPrint) {
                    setReceiptOrder(order);
                    setTimeout(() => window.print(), 100);
                }
            } else if (receiptAction === 'PRINT_REQUIRED') {
                alert("Payment confirmed. Printing final receipt...");
                setReceiptOrder(order);
                setTimeout(() => window.print(), 100);
            }

            // Instantly remove from local state
            setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId || o.status === 'READY'));
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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black flex justify-center items-center text-[#FF914D]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    // Filter into two queues
    const paymentOrders = orders.filter((o) => o.paymentStatus === 'AWAITING_CASH_COLLECTION' || o.paymentStatus === 'AWAITING_CASH');
    const servingOrders = orders.filter((o) => o.status === 'READY' && o.paymentStatus !== 'AWAITING_CASH_COLLECTION' && o.paymentStatus !== 'AWAITING_CASH');

    const renderPaymentCard = (order) => (
        <div key={order.orderId} className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(234,179,8,0.2)] hover:border-yellow-500/50 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">#{order.orderId}</h3>
                    <span className="text-[10px] text-yellow-500 font-extrabold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        Awaiting Payment
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black text-white group-hover:scale-105 transition-transform">
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
                        <span className="text-[#FF914D] font-bold w-6">{item.quantity}x</span>
                        <span className="flex-1 text-gray-300 truncate group-hover:text-gray-200 transition-colors">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
                <div className="flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Collect</span>
                    <span className="text-xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">${order.totalAmount.toFixed(2)}</span>
                </div>
                <button 
                    onClick={() => handleConfirmPayment(order)}
                    disabled={actioningOrderId === order.orderId}
                    className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {actioningOrderId === order.orderId ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Payment Received</>}
                </button>
            </div>
        </div>
    );

    const renderServingCard = (order) => (
        <div key={order.orderId} className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(34,197,94,0.2)] hover:border-green-500/50 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">#{order.orderId}</h3>
                    <span className="text-[10px] text-green-400 font-extrabold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        Ready to Serve
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] group-hover:scale-105 transition-transform">
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
                        <span className="text-[#FF914D] font-bold w-6">{item.quantity}x</span>
                        <span className="flex-1 text-gray-300 truncate group-hover:text-gray-200 transition-colors">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto flex flex-col gap-3">
                <button 
                    onClick={() => handleDeliverOrder(order.orderId)}
                    disabled={actioningOrderId === order.orderId}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {actioningOrderId === order.orderId ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Order Delivered</>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black font-poppins text-white selection:bg-[#FF914D]/30">
            {/* Sticky Frosted Header */}
            <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <div className="p-2 bg-[#FF914D]/10 rounded-xl border border-[#FF914D]/20 shadow-[0_0_15px_rgba(255,145,77,0.2)]">
                            <Bell className="w-8 h-8 text-[#FF914D]" />
                        </div>
                        Waiter Service Panel
                    </h1>
                    
                    {/* Visual Bell Alert */}
                    <div className="flex items-center gap-4">
                        {hasNewNotification && (
                            <button 
                                onClick={clearNotification}
                                className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-xs rounded-full animate-bounce flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500/30 transition-colors"
                            >
                                <Bell className="w-4 h-4 animate-ring text-red-400" />
                                <span>New Tasks! Click to Silence</span>
                            </button>
                        )}
                        <span className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-gray-200 text-sm font-bold rounded-full shadow-inner">
                            {paymentOrders.length} Payments • {servingOrders.length} Serves
                        </span>
                        <button onClick={fetchOrders} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white shadow-md border border-white/5 hover:border-white/20">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 pt-8 print:hidden">
            {/* Segmented Tab Navigation */}
            <div className="max-w-7xl mx-auto flex bg-black/40 backdrop-blur-md p-1.5 rounded-3xl border border-white/10 mb-8 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('ACTIVE_QUEUE')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'ACTIVE_QUEUE' ? 'bg-gradient-to-r from-[#FF914D] to-orange-500 text-black shadow-[0_0_20px_rgba(255,145,77,0.4)] scale-[1.02]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <Bell className="w-5 h-5" /> Active Queue
                </button>
                <button 
                    onClick={() => setActiveTab('OPEN_TABS')}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'OPEN_TABS' ? 'bg-gradient-to-r from-[#FF914D] to-orange-500 text-black shadow-[0_0_20px_rgba(255,145,77,0.4)] scale-[1.02]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                    <Coffee className="w-5 h-5" /> Open Tabs
                </button>
            </div>

            {activeTab === 'OPEN_TABS' ? (
                <div className="max-w-7xl mx-auto">
                    <WaiterOpenTabs />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Split Columns Grid */}
                    
                    {/* Column A: Payment Needed */}
                <div className="bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2 pb-4 border-b border-white/10 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
                        <DollarSign className="w-7 h-7 text-yellow-400" /> Payment Collection Queue ({paymentOrders.length})
                    </h2>
                    {paymentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                            <CheckCircle className="w-16 h-16 mb-4 text-yellow-500/30" />
                            <p className="font-bold text-lg">No payments pending</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {paymentOrders.map(renderPaymentCard)}
                        </div>
                    )}
                </div>

                {/* Column B: Ready to Serve */}
                <div className="bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2 pb-4 border-b border-white/10 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
                        <Utensils className="w-7 h-7 text-green-400" /> Deliver & Serve Queue ({servingOrders.length})
                    </h2>
                    {servingOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                            <CheckCircle className="w-16 h-16 mb-4 text-green-500/30" />
                            <p className="font-bold text-lg">No items ready to deliver</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {servingOrders.map(renderServingCard)}
                        </div>
                    )}
                </div>

            </div>
            )}
            </div>

            {/* Thermal Receipt Component (Hidden unless printing) */}
            <div id="thermal-receipt-container">
                <ThermalReceipt order={receiptOrder} isPreliminary={false} />
            </div>
        </div>
    );
};

export default WaiterDashboard;
