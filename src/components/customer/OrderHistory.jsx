import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { getOrderStatus } from '../../services/orderService'; // Reuse this service
import { Clock, ShoppingBag, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const { getOrderHistoryIds } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            const ids = getOrderHistoryIds();
            if (ids.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch all orders in parallel
                const promises = ids.map(id => getOrderStatus(id).catch(e => null));
                const results = await Promise.all(promises);
                // Filter out any nulls (failed fetches)
                setOrders(results.filter(res => res && res.data).map(res => res.data));
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const toggleExpand = (id) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#FF3131]" /></div>;

    return (
        <div className="max-w-3xl mx-auto p-6 min-h-screen bg-[#1a1a1a] text-white">
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <ShoppingBag className="w-8 h-8 text-[#FF3131]" />
                <h1 className="text-3xl font-bold">My Past Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-[#2d2d2d] rounded-2xl border border-white/5">
                    <p className="text-gray-400">No past orders found on this device.</p>
                    <button onClick={() => navigate('/menu')} className="mt-4 text-[#FF3131] hover:underline">Browse Menu</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.orderId} className="bg-[#2d2d2d] rounded-xl overflow-hidden border border-white/5">
                            
                            {/* Order Header */}
                            <div 
                                onClick={() => toggleExpand(order.orderId)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                            order.status === 'READY' ? 'bg-green-500/20 text-green-400' : 
                                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-bold text-lg">
                                        Total: ${order.totalAmount.toFixed(2)} 
                                        <span className="text-sm font-normal text-gray-400 ml-2">({order.items.length} items)</span>
                                    </p>
                                </div>
                                {expandedOrder === order.orderId ? <ChevronUp /> : <ChevronDown />}
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.orderId && (
                                <div className="bg-[#222] p-4 border-t border-white/5 animate-fade-in">
                                    <ul className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex flex-col sm:flex-row justify-between text-sm border-b border-white/5 pb-3 last:border-0">
                                                <div className='flex-1'>
                                                    <span className="font-bold text-white">{item.quantity}x {item.name}</span>
                                                    
                                                    {/* Display Customizations */}
                                                    {item.customizations && item.customizations.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.customizations.map(c => (
                                                                <span key={c} className="text-[10px] bg-[#FF3131]/20 text-[#FF3131] px-1.5 py-0.5 rounded">
                                                                    {c}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Display Note */}
                                                    {item.specialRequest && (
                                                        <p className="text-xs text-gray-400 italic mt-1">
                                                            "Note: {item.specialRequest}"
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-gray-400 font-mono mt-2 sm:mt-0">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;