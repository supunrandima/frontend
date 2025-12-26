import React, { createContext, useState, useContext } from 'react';


export const CartContext = createContext();


export const useCart = () => {
    return useContext(CartContext);
};


export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orderSuccess, setOrderSuccess] = useState(null); // To store success message/ID

   

    const addToCart = (menuItem, quantity = 1) => {
        setCartItems(prevItems => {
            const exists = prevItems.find(item => item.menuItemId === menuItem.itemId);

            if (exists) {
                
                return prevItems.map(item =>
                    item.menuItemId === menuItem.itemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                
                return [
                    ...prevItems,
                    {
                        menuItemId: menuItem.itemId,
                        name: menuItem.name,
                        itemCode: menuItem.itemCode,
                        unitPrice: menuItem.price, 
                        quantity: quantity,
                    },
                ];
            }
        });
    };

    const removeFromCart = (menuItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId, newQuantity) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                return prevItems.filter(item => item.menuItemId !== menuItemId);
            }
            return prevItems.map(item =>
                item.menuItemId === menuItemId
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