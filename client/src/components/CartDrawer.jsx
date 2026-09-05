import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Flame, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const {
    isOpen,
    closeCart,
    cartItems,
    totalQuantity,
    subtotal,
    discountAmount,
    discountCode,
    grandTotal,
    updateQuantity,
    removeFromCart,
    applyPromo
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromo(promoInput.trim());
      setPromoInput('');
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#18181F] border-l border-[#E85D3D]/30 shadow-2xl flex flex-col justify-between"
            >
              {/* DRAWER HEADER */}
              <div className="p-6 border-b border-[#282834] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E85D3D]/20 text-[#E85D3D] rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Your Flame Cart</h3>
                    <p className="text-xs text-gray-400 font-semibold">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="p-2 text-gray-400 hover:text-white bg-[#22222D] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER ITEMS LIST */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#282834]">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-16 h-16 bg-[#22222D] text-gray-500 rounded-full flex items-center justify-center">
                      <Flame className="w-8 h-8 text-[#E85D3D]/40" />
                    </div>
                    <h4 className="text-base font-bold text-white">Your Cart is Empty</h4>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Unleash the blaze! Explore our latest anime drop and ignite your wardrobe.
                    </p>
                    <button
                      onClick={() => {
                        closeCart();
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-bold rounded-xl shadow-flame-glow"
                    >
                      Browse Anime Tees
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const prod = item.product || {};
                    const itemId = item.id || item._id;
                    const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';
                    const price = prod.price || item.price || 0;

                    return (
                      <div key={itemId} className="pt-4 first:pt-0 flex gap-4">
                        <img
                          src={image}
                          alt={prod.name || 'Anime Tee'}
                          className="w-20 h-24 object-cover rounded-2xl bg-[#121218] border border-[#282834]"
                        />

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="text-sm font-bold text-gray-100 line-clamp-1">
                                {prod.name || 'ENEN Graphic Tee'}
                              </h4>
                              <button
                                onClick={() => removeFromCart(itemId)}
                                className="text-gray-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-[#22222D] text-gray-300 text-[10px] font-bold rounded border border-[#282834]">
                                Size: {item.size || 'L'}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {item.color || 'Black'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-extrabold text-[#E85D3D]">
                              ₹{price}
                            </span>

                            {/* QUANTITY CONTROLS */}
                            <div className="flex items-center gap-2 bg-[#22222D] border border-[#282834] rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                className="p-1 hover:bg-[#282834] text-gray-300 rounded"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1.5 text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                className="p-1 hover:bg-[#282834] text-gray-300 rounded"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* DRAWER FOOTER / CHECKOUT */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-[#282834] bg-[#121218] space-y-4">
                  {/* PROMO CODE FORM */}
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. BLAZE10)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="w-full bg-[#18181F] border border-[#282834] rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                      />
                      <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-2 bg-[#22222D] hover:bg-[#E85D3D] text-white text-xs font-bold rounded-xl transition-colors border border-[#282834]"
                    >
                      Apply
                    </button>
                  </form>

                  {/* SUMMARY BREAKDOWN */}
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#FF7A00] font-bold">
                        <span>Discount ({discountCode})</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-400">
                      <span>Estimated Shipping</span>
                      <span>{subtotal > 999 ? 'FREE' : '₹99'}</span>
                    </div>

                    <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#282834]">
                      <span>Grand Total</span>
                      <span className="text-flame-gradient">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CHECKOUT BUTTON */}
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-xl shadow-flame-glow flex items-center justify-center gap-2 hover:shadow-flame-intense transition-all active:scale-95"
                  >
                    <span>PROCEED TO CHECKOUT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
