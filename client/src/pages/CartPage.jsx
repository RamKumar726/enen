import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, Flame, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const {
    cartItems,
    subtotal,
    discountAmount,
    discountCode,
    taxAmount,
    shippingAmount,
    grandTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
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

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-[#18181F] border border-[#E85D3D]/30 text-[#E85D3D] rounded-3xl flex items-center justify-center mx-auto shadow-flame-glow">
          <ShoppingBag className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">YOUR CART IS EMPTY</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          No anime tees in your cart yet. Explore our vault and unleash the blaze with 240 GSM heavy cotton drops.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white font-extrabold text-sm rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all"
        >
          <span>EXPLORE THE DROP</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#282834] pb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>CHECKOUT READY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            YOUR SHOPPING <span className="text-flame-gradient">BAG</span>
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-red-400 underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ITEMS TABLE */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => {
            const prod = item.product || {};
            const itemId = item.id || item._id;
            const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';
            const price = prod.price || item.price || 0;

            return (
              <div
                key={itemId}
                className="bg-[#18181F] border border-[#282834] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={image}
                    alt={prod.name || 'Anime Tee'}
                    className="w-24 h-28 object-cover rounded-2xl bg-[#121218] border border-[#282834]"
                  />

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider block">
                      {prod.animeSeries || 'Anime Drop'}
                    </span>
                    <h3 className="text-base font-extrabold text-white line-clamp-1">
                      {prod.name || 'ENEN Heavyweight Graphic Tee'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                      <span className="px-2.5 py-0.5 bg-[#22222D] rounded border border-[#282834]">
                        Size: {item.size || 'L'}
                      </span>
                      <span>Color: {item.color || 'Black'}</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#E85D3D] block sm:hidden">
                      ₹{price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#282834]">
                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 bg-[#121218] border border-[#282834] rounded-xl p-1.5">
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity - 1)}
                      className="p-1 hover:bg-[#22222D] text-gray-300 rounded-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-white px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      className="p-1 hover:bg-[#22222D] text-gray-300 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-lg font-extrabold text-white hidden sm:block">
                    ₹{(price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-4 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
          <h3 className="text-xl font-extrabold text-white border-b border-[#282834] pb-4">
            ORDER SUMMARY
          </h3>

          {/* PROMO FORM */}
          <form onSubmit={handleApplyPromo} className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Promo Code</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Try BLAZE10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
                <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3" />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#E85D3D] hover:bg-[#FF7A00] text-white text-xs font-extrabold rounded-xl transition-colors shadow-md"
              >
                Apply
              </button>
            </div>
          </form>

          {/* BREAKDOWN */}
          <div className="space-y-3 text-xs text-gray-300 pt-2 border-t border-[#282834]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#FF7A00] font-bold">
                <span>Discount ({discountCode})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>GST included in item prices (5% / 12%)</span>
              <span className="font-bold text-white">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-white">{shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-white pt-3 border-t border-[#282834]">
              <span>Grand Total</span>
              <span className="text-flame-gradient text-xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-2xl shadow-flame-glow flex items-center justify-center gap-2 hover:shadow-flame-intense transition-all"
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default CartPage;
