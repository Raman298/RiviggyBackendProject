
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || { restaurantId: null, restaurantName: '', items: [] }; }
    catch { return { restaurantId: null, restaurantName: '', items: [] }; }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try { return JSON.parse(localStorage.getItem('appliedCoupon')) || null; }
    catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  const addToCart = (item, restaurant) => {
    setCart(prev => {
      // If adding from different restaurant, confirm
      if (prev.restaurantId && prev.restaurantId !== restaurant._id && prev.items.length > 0) {
        if (!window.confirm(`Your cart has items from ${prev.restaurantName}. Clear and add from ${restaurant.name}?`)) {
          return prev;
        }
        // Clear and add new
        toast.success(`${item.name} added to cart! 🛒`);
        return { restaurantId: restaurant._id, restaurantName: restaurant.name, items: [{ ...item, quantity: 1 }] };
      }

      const exists = prev.items.findIndex(i => i._id === item._id);
      let newItems;
      if (exists >= 0) {
        newItems = prev.items.map((i, idx) => idx === exists ? { ...i, quantity: i.quantity + 1 } : i);
        toast.success(`${item.name} quantity updated!`);
      } else {
        newItems = [...prev.items, { ...item, quantity: 1 }];
        toast.success(`${item.name} added to cart! 🛒`);
      }
      return { restaurantId: restaurant._id, restaurantName: restaurant.name, items: newItems };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i._id !== itemId);
      if (newItems.length === 0) {
        // Clear coupon when cart is empty
        setAppliedCoupon(null);
        return { restaurantId: null, restaurantName: '', items: [] };
      }
      return { ...prev, items: newItems };
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) { removeFromCart(itemId); return; }
    setCart(prev => ({ ...prev, items: prev.items.map(i => i._id === itemId ? { ...i, quantity } : i) }));
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: '', items: [] });
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon, discount) => {
    setAppliedCoupon({ code: coupon.code, label: coupon.label, discount });
    toast.success(`Coupon ${coupon.code} applied! Saved ₹${discount}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      subtotal, 
      totalItems, 
      appliedCoupon, 
      applyCoupon, 
      removeCoupon 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
