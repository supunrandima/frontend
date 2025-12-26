import React, { useState, useEffect } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../../services/kitchenService';
import { Clock, CheckCircle, ChefHat, Bell, UtensilsCrossed, Loader2 } from 'lucide-react';

const KitchenDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders every 5 seconds (Live Polling)
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getKitchenOrders();
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    // Handle Status Change (e.g. PENDING -> PREPARING)
    const handleStatusUpdate = async (orderId, newStatus) => {
        // Optimistic UI Update (Update screen instantly before API responds)
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status",error);
        }
    };

    // Helper to get color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
            case 'PREPARING': return 'bg-blue-500/20 border-blue-500 text-blue-500';
            case 'READY': return 'bg-green-500/20 border-green-500 text-green-500';
            default: return 'bg-gray-500/20 border-gray-500 text-gray-500';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex justify-center items-center text-[#FF3131]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-6 font-poppins text-white">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <ChefHat className="w-10 h-10 text-[#FF914D]" /> Kitchen Display System
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <UtensilsCrossed className="w-20 h-20 mx-auto mb-4" />
                    <p className="text-2xl">No active orders</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => (
                        <div key={order.orderId} className={`rounded-2xl p-5 border-2 flex flex-col h-full bg-[#2d2d2d] shadow-2xl ${getStatusColor(order.status).split(' ')[1]}`}>
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                                <div>
                                    <h2 className="text-2xl font-bold">#{order.orderId}</h2>
                                    <div className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-[#FF914D]">
                                        {order.orderType === 'TABLE' ? `Table ${order.tableNumber}` : 'Takeout'}
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 justify-end">
                                        <Clock className="w-3 h-3" />
                                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>

                            {/* Items List - THIS IS THE CRITICAL FIX */}
                            <div className="flex-1 space-y-3 mb-6">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-lg">
                                        <span className="font-bold text-[#FF3131] w-8">{item.quantity}x</span>
                                        <span className="flex-1 text-gray-200">{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto pt-4 border-t border-white/10 grid grid-cols-1 gap-3">
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.orderId, 'PREPARING')}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
                                    >
                                        Start Cooking
                                    </button>
                                )}
                                {order.status === 'PREPARING' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.orderId, 'READY')}
                                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-all"
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'READY' && (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.orderId, 'SERVED')}
                                        className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-xl font-bold transition-all text-gray-300"
                                    >
                                        Complete Order
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KitchenDashboard;