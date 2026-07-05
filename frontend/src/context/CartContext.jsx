import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('nextlearn_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('nextlearn_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (course) => {
        setCartItems(prev => {
            const exists = prev.find(item => item.id === course.id);
            if (exists) return prev;
            return [...prev, course];
        });
    };

    const removeFromCart = (courseId) => {
        setCartItems(prev => prev.filter(item => item.id !== courseId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            itemCount: cartItems.length
        }}>
            {children}
        </CartContext.Provider>
    );
};
