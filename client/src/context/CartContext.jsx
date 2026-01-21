import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentMood, setCurrentMood] = useState(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item) => {
        setItems(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeItem = (itemId) => {
        setItems(prev => prev.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }
        setItems(prev => prev.map(i =>
            i._id === itemId ? { ...i, quantity } : i
        ));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart');
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            currentMood,
            setCurrentMood,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            subtotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
