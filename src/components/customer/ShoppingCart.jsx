import React from 'react';
import { ShoppingCart as CartIcon, X, MinusCircle, PlusCircle, Trash2, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ShoppingCart = () => {
    const { 
        cartItems, 
        updateQuantity, 
        removeFromCart, 
        getTotalItems, 
        getTotalPrice,
        clearCart
    } = useCart();
    
    const navigate = useNavigate();

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    return (
        <div className="w-full max-w-lg mx-auto bg-white shadow-xl rounded-2xl overflow-hidden my-8 fade-in">
            
            {/* --- Header --- */}
            <div className="p-6 bg-[#2d2d2d] text-white flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <CartIcon className="w-6 h-6 text-[#FF3131]" />
                    Your Cart ({totalItems})
                </h2>
                <button 
                    onClick={clearCart}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    title="Clear All Items"
                >
                    <Trash2 className="w-4 h-4"/> Clear
                </button>
            </div>

            {/* --- Cart Items List --- */}
            <div className="p-6 max-h-96 overflow-y-auto divide-y divide-gray-100">
                {cartItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <CartIcon className="w-10 h-10 mx-auto mb-3 text-gray-300"/>
                        <p className="font-medium">Your cart is empty.</p>
                        <p className="text-sm">Add items from the menu to start an order.</p>
                    </div>
                ) : (
                    cartItems.map(item => (
                        <div key={item.menuItemId} className="flex items-center justify-between py-4 group hover:bg-red-50/20 transition-colors rounded-lg px-2 -mx-2">
                            <div className="flex flex-col flex-1 min-w-0 pr-3">
                                <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                                <span className="text-xs text-gray-500 font-mono">Code: {item.itemCode}</span>
                                <span className="text-sm font-medium text-gray-600">${item.unitPrice.toFixed(2)} ea</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2 text-gray-600">
                                <button 
                                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                    className="p-1 rounded-full text-[#FF3131] hover:bg-red-100 transition-colors"
                                    title="Decrease Quantity"
                                >
                                    <MinusCircle className="w-5 h-5" />
                                </button>
                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                    className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                    title="Increase Quantity"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Subtotal */}
                            <div className="w-20 text-right">
                                <span className="font-bold text-gray-800">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="ml-4 p-1 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                                title="Remove Item"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* --- Footer / Total & Checkout --- */}
            {cartItems.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                        <span className="text-xl font-extrabold text-[#FF3131]">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>

                    <button 
                        // You will navigate to a dedicated checkout component next
                        onClick={() => navigate('/checkout')} 
                        className="w-full bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                        Proceed to Checkout 
                        <ArrowRight className="w-5 h-5 ml-2"/>
                    </button>
                    
                    <p className="text-xs text-gray-500 mt-2 text-center">Taxes and service fees calculated at checkout.</p>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;