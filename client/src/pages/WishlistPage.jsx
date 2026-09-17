import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Sparkles, Star, Flame } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleAddToCart = (product) => {
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0]?.name || 'Black';
    addToCart(product, size, color, 1);
    const pid = product._id || product.id;
    setAddedIds((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => setAddedIds((prev) => ({ ...prev, [pid]: false })), 2000);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-24 h-24 rounded-full bg-[#E85D3D]/10 border border-[#E85D3D]/30 flex items-center justify-center"
        >
          <Heart className="w-10 h-10 text-[#E85D3D]" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#1C1C1C] dark:text-white">Your Wishlist is Empty</h2>
          <p className="text-sm text-gray-400 max-w-xs">
            Save your favourite anime drops here and come back later to grab them!
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white font-bold text-sm rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all"
        >
          <Flame className="w-4 h-4" /> Explore Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#E85D3D] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF7A00]" />
            <span className="text-[10px] font-extrabold text-[#E85D3D] uppercase tracking-widest">Saved Items</span>
          </div>
          <h1 className="text-3xl font-black text-[#1C1C1C] dark:text-white">
            MY <span className="text-flame-gradient">WISHLIST</span>
            <span className="ml-2 text-base font-bold text-gray-400">({wishlistItems.length})</span>
          </h1>
        </div>
        <button
          onClick={clearWishlist}
          className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 px-3 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        layout
      >
        <AnimatePresence>
          {wishlistItems.map((product) => {
            const pid = product._id || product.id;
            const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80';
            const discount = product.originalPrice > product.price
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;
            const isAdded = addedIds[pid];

            return (
              <motion.div
                key={pid}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.3 }}
                className="group bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-2xl overflow-hidden hover:border-[#E85D3D]/40 transition-all shadow-card hover:shadow-elevated flex flex-col"
              >
                {/* Image */}
                <Link
                  to={`/product/${pid}`}
                  className="block relative overflow-hidden bg-[#F4F1EA] dark:bg-[#0D0D11]"
                  style={{ aspectRatio: '1 / 1.15' }}
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {discount && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 rounded-md">
                      -{discount}%
                    </span>
                  )}
                  {/* Remove from wishlist */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(pid); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow-sm"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#E85D3D] fill-current" />
                  </motion.button>
                </Link>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#FF7A00]">
                    {product.animeSeries || 'ENEN Drop'}
                  </span>
                  <Link to={`/product/${pid}`}>
                    <h3 className="font-bold text-sm text-[#1C1C1C] dark:text-white hover:text-[#E85D3D] transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-[10px] font-black text-[#1C1C1C] dark:text-white">
                      {product.averageRating?.toFixed(1) || '4.8'}
                    </span>
                  </div>

                  {/* Price + actions */}
                  <div className="mt-auto pt-2 border-t border-[#EAE6DD] dark:border-[#1E1E28] flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-[#1C1C1C] dark:text-white">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddToCart(product)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-[#C94A20] to-[#E85D3D] text-white shadow-sm hover:shadow-flame-glow'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {isAdded ? 'Added' : 'Add'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WishlistPage;
