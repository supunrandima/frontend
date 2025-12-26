import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeNewOrder } from '../../services/orderService';
import { ShoppingCart as CartIcon, MinusCircle, PlusCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Checkout = () => {
    const { 
        cartItems, 
        updateQuantity, 
        getTotalItems, 
        getTotalPrice,
        clearCart
    } = useCart();
    
    const navigate = useNavigate();
    
    const [orderType, setOrderType] = useState('TABLE');
    const [tableNumber, setTableNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // --- FIX: Flag to prevent auto-redirect when order is successful ---
    const [isOrderPlaced, setIsOrderPlaced] = useState(false); 

    const totalPrice = getTotalPrice();
    const totalItems = getTotalItems();

    // Redirect to menu if cart is empty (UNLESS order was just placed)
    useEffect(() => {
        if (cartItems.length === 0 && !isOrderPlaced) {
            navigate('/menu'); 
        }
    }, [cartItems, navigate, isOrderPlaced]);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (orderType === 'TABLE' && tableNumber.trim() === '') {
            setMessage({ type: 'error', text: 'Please enter your table number.' });
            return;
        }

        if (cartItems.length === 0) {
            setMessage({ type: 'error', text: 'Your cart is empty.' });
            return;
        }

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
            orderType: orderType,
            tableNumber: orderType === 'TABLE' ? tableNumber.trim() : null,
            customerId: customerId, 
            customerPhone: customerPhone
        };

        try {
            const response = await placeNewOrder(payload);
            const { orderId } = response.data; 

            // --- CRITICAL FIX ---
            // 1. Set flag to TRUE so the useEffect ignores the empty cart
            setIsOrderPlaced(true);

            // 2. Clear the cart (This will make cartItems.length === 0)
            clearCart();
            
            // 3. Navigate to Status Page
            navigate(`/order-status/${orderId}`); 

        } catch (error) {
            console.error("Order failed:", error);
            const errorMsg = error.response?.data?.error || 'Failed to place order. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
            setIsSubmitting(false); // Only stop loading on error
        } 
    };
    
    // --- Render Items Helper ---
    const renderCartItem = (item) => (
        <div key={item.menuItemId} className="flex items-center py-4 border-b border-gray-100 last:border-0">
            <div className="flex flex-col flex-1 min-w-0 pr-3">
                <span className="font-semibold text-gray-800 truncate text-base">{item.name}</span>
                <span className="text-sm text-gray-500">${item.unitPrice.toFixed(2)} ea</span>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                <button 
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="p-1 rounded-md text-gray-500 hover:text-[#FF3131] hover:bg-white shadow-sm transition-all"
                >
                    <MinusCircle className="w-5 h-5" />
                </button>
                <span className="font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                <button 
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="p-1 rounded-md text-gray-500 hover:text-green-600 hover:bg-white shadow-sm transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            
            <div className="w-20 text-right font-bold text-gray-800">
                ${(item.unitPrice * item.quantity).toFixed(2)}
            </div>
        </div>
    );

    // If cart is empty (and we aren't submitting/redirecting), show loading or null
    if (cartItems.length === 0 && !isSubmitting && !isOrderPlaced) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FF3131] mx-auto mb-4" />
                    <p className="text-gray-400">Cart is empty. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#1a1a1a] flex justify-center items-start font-poppins">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- Left Column: Cart Summary --- */}
                <div className="bg-white rounded-2xl shadow-xl p-6 h-fit">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <CartIcon className="w-6 h-6 text-[#FF914D]"/> 
                        </div>
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
                        <p className="text-xs text-gray-400 text-right mb-4">Includes all taxes & fees</p>
                    </div>

                    <button 
                        onClick={() => navigate('/menu')}
                        className="w-full mt-2 py-3 rounded-xl text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-800 transition-all flex justify-center items-center gap-2"
                    >
                        ← Add More Items
                    </button>
                </div>
                
                {/* --- Right Column: Order Form --- */}
                <div className="bg-white rounded-2xl shadow-xl p-8 h-fit border-t-4 border-[#FF3131]">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Details</h2>
                    <p className="text-gray-500 mb-6 text-sm">Please select how you would like to receive your order.</p>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in border ${
                            message.type === 'error' 
                                ? 'bg-red-50 border-red-100 text-red-700' 
                                : 'bg-green-50 border-green-100 text-green-700'
                        }`}>
                            {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0"/> : <CheckCircle className="w-5 h-5 flex-shrink-0"/>}
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dining Option</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                    orderType === 'TABLE' 
                                        ? 'border-[#FF3131] bg-red-50/50 text-[#FF3131]' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="orderType" 
                                        value="TABLE" 
                                        checked={orderType === 'TABLE'} 
                                        onChange={() => {setOrderType('TABLE'); setTableNumber('');}}
                                        className="sr-only"
                                        disabled={isSubmitting}
                                    />
                                    <span className="font-bold mb-1">Dine-In</span>
                                    <span className="text-xs opacity-75">Table Service</span>
                                    {orderType === 'TABLE' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#FF3131]" />}
                                </label>

                                <label className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                    orderType === 'TAKEOUT' 
                                        ? 'border-[#FF3131] bg-red-50/50 text-[#FF3131]' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="orderType" 
                                        value="TAKEOUT" 
                                        checked={orderType === 'TAKEOUT'} 
                                        onChange={() => setOrderType('TAKEOUT')}
                                        className="sr-only"
                                        disabled={isSubmitting}
                                    />
                                    <span className="font-bold mb-1">Takeout</span>
                                    <span className="text-xs opacity-75">Pick up at counter</span>
                                    {orderType === 'TAKEOUT' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#FF3131]" />}
                                </label>
                            </div>
                        </div>

                        {orderType === 'TABLE' && (
                            <div className="animate-fade-in">
                                <label htmlFor="tableNumber" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                    Table Number
                                </label>
                                <input
                                    type="text"
                                    id="tableNumber"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    placeholder="e.g., T-05"
                                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-[#FF3131] text-gray-800 font-medium outline-none transition-all placeholder-gray-400"
                                    required={orderType === 'TABLE'}
                                    disabled={isSubmitting}
                                />
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            disabled={isSubmitting || cartItems.length === 0}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
                            ) : (
                                <>Confirm Order &nbsp;•&nbsp; ${totalPrice.toFixed(2)}</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;