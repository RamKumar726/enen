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

  const discountAmount = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const netUnit = Math.round(price * (1 - (cartState.discountPercent || 0) / 100));
    return sum + (price - netUnit) * item.quantity;
  }, 0);
  // Catalog prices are consumer prices with GST included; show the included tax for transparency.
  const taxAmount = cartItems.reduce((sum, item) => {
    const price = Math.round((item.product?.price || item.price || 0) * (1 - (cartState.discountPercent || 0) / 100));
    const rate = price <= 1000 ? 0.05 : 0.12;
    return sum + (price - price / (1 + rate)) * item.quantity;
  }, 0);
  const netSubtotal = subtotal - discountAmount;
  const shippingAmount = netSubtotal >= 999 || cartItems.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, netSubtotal + shippingAmount);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product, size = product?.sizes?.[0] || 'M', color = product?.colors?.[0]?.name || 'Black', quantity = 1) => {
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
