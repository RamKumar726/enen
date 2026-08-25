import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCartLocal,
  updateQuantityLocal,
  removeFromCartLocal,
  clearCartLocal,
  toggleCartDrawer,
  openCartDrawer,
  closeCartDrawer,
  applyPromoCode,
  clearToastMessage
} from '../redux/slices/cartSlice';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cart);

  const cartItems = cartState.items || [];

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || item.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  const discountAmount = (subtotal * (cartState.discountPercent || 0)) / 100;
  const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST/Tax
  const shippingAmount = subtotal > 50 || cartItems.length === 0 ? 0 : 4.99; // Free shipping over $50
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount + shippingAmount);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product, size = 'L', color = 'Black', quantity = 1) => {
    dispatch(addToCartLocal({ product, size, color, quantity }));
    dispatch(openCartDrawer());
  };

  const updateQuantity = (id, quantity) => {
    dispatch(updateQuantityLocal({ id, quantity }));
  };

  const removeFromCart = (id) => {
    dispatch(removeFromCartLocal(id));
  };

  const clearCart = () => {
    dispatch(clearCartLocal());
  };

  const applyPromo = (code) => {
    dispatch(applyPromoCode(code));
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      totalQuantity,
      subtotal,
      discountAmount,
      discountPercent: cartState.discountPercent,
      discountCode: cartState.discountCode,
      taxAmount,
      shippingAmount,
      grandTotal,
      isOpen: cartState.isOpen,
      toastMessage: cartState.toastMessage,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleCart: () => dispatch(toggleCartDrawer()),
      openCart: () => dispatch(openCartDrawer()),
      closeCart: () => dispatch(closeCartDrawer()),
      applyPromo,
      clearToast: () => dispatch(clearToastMessage())
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
