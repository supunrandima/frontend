import React, { createContext, useState, useContext } from 'react';


export const CartContext = createContext();


export const useCart = () => {
    return useContext(CartContext);
};


export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orderSuccess, setOrderSuccess] = useState(null); // To store success message/ID

   

    const addToCart = (menuItem, quantity = 1, selectedCustomizations = [], specialNote = "") => {
        setCartItems(prevItems => {
            const cartItemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const customizationsPrice = selectedCustomizations.reduce((sum, opt) => sum + (opt.additionalPrice || 0), 0);
            const finalUnitPrice = menuItem.price + customizationsPrice;

            return [
                ...prevItems,
                {
                    cartItemId,
                    menuItemId: menuItem.itemId,
                    name: menuItem.name,
                    itemCode: menuItem.itemCode,
                    unitPrice: finalUnitPrice, 
                    quantity: quantity,
                    selectedCustomizations,
                    specialNote
                },
            ];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.cartItemId !== cartItemId);
            }
            return prevItems.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        });
    };
    
    const clearCart = () => {
        setCartItems([]);
    };

    
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    };


    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        orderSuccess,
        setOrderSuccess,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};