import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderHistory } from "../../services/customerFeatureService";
import { ArrowLeft, Package, Clock, Calendar, LogOut, User } from "lucide-react";
import { useCart } from '../../context/CartContext';

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const { clearCart } = useCart();

    useEffect(() => {
        const id = localStorage.getItem("customerId");
        const role = localStorage.getItem("userRole");
        const name = localStorage.getItem("customerName");

        // Security Check: Redirect guests to login
        if (!id || role === "GUEST") {
            navigate("/customerLogin");
            return;
        }

        const isNameValid = name && typeof name === "string" && name !== "undefined" && name !== "null";
        setCustomerName(isNameValid ? name : "Guest");

        const fetchHistory = async () => {
            try {
                const response = await getOrderHistory(id);
                // Sort by newest first (assuming backend list isn't sorted)
                setOrders(response.data.reverse());
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        fetchHistory();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        clearCart();
        navigate("/customerLogin");
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-4 md:p-8 font-poppins text-white">
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
                <button onClick={() => navigate('/menu')} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5"/> Back to Menu
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                    <LogOut className="w-4 h-4"/> Logout
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#FF3131] to-[#FF914D] rounded-full flex items-center justify-center text-3xl font-bold">
                        {customerName ? customerName.charAt(0) : "U"}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{customerName}</h1>
                        <p className="text-gray-400">Registered Customer</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="text-[#FF914D]"/> Order History
                </h2>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-[#2d2d2d] p-8 rounded-2xl text-center text-gray-400">
                            No past orders found. Time to eat!
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.orderId} className="bg-[#2d2d2d] p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.orderId}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3"/> {new Date(order.createdAt).toLocaleDateString()}
                                            <Clock className="w-3 h-3 ml-2"/> {new Date(order.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                        ${order.status === 'SERVED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total</span>
                                    <span className="font-bold text-[#FF3131]">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;