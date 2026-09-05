import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Star, ShoppingBag, Flame, Check, Sparkles, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const cardRef = useRef(null);

  /* Subtle tilt — desktop only, disabled on touch */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-80, 80], [4, -4]), { stiffness: 180, damping: 30 });
  const rotY = useSpring(useTransform(mouseX, [-80, 80], [-4, 4]), { stiffness: 180, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); setIsHovered(false);
  }, [mouseX, mouseY]);

  const mainImage  = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1]?.url || null;
  const discount   = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product, selectedSize, product.colors?.[0]?.name || 'Black', 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      className="product-card-shine group relative bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-2xl sm:rounded-3xl overflow-hidden shadow-card hover:shadow-elevated hover:border-[#E85D3D]/40 transition-all duration-300 flex flex-col"
    >
      {/* ── IMAGE ── */}
      <Link to={`/product/${product._id || product.slug}`}
        className="block relative overflow-hidden bg-[#F4F1EA] dark:bg-[#0D0D11] flex-shrink-0"
        style={{ aspectRatio: '1 / 1.1' }}
      >
        <motion.img src={mainImage} alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1, opacity: (isHovered && hoverImage) ? 0 : 1 }}
          transition={{ duration: 0.5 }} />
        {hoverImage && (
          <motion.img src={hoverImage} alt={`${product.name} alt`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.45 }} />
        )}

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); setWishlisted(v => !v); }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? 'text-[#E85D3D] fill-current' : 'text-[#A8A8A8]'}`} />
        </motion.button>

        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-gradient-to-r from-[#C94A20] to-[#E85D3D] text-white rounded-md flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-current" /> Best
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-[#FF7A00]/15 border border-[#FF7A00]/40 text-[#FF7A00] rounded-md">
              New
            </span>
          )}
          {discount && (
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-500/15 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400 rounded-md">
              -{discount}%
            </span>
          )}
        </div>

        {/* Sparkle for bestseller */}
        {product.isBestSeller && (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-2 right-2 z-10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </motion.div>
        )}
      </Link>

      {/* ── CARD BODY ── */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col gap-2">

        {/* Collection + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide text-[#FF7A00] truncate max-w-[60%]">
            {product.animeSeries || 'ENEN Drop'}
          </span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
            <span className="text-[10px] font-black text-[#1C1C1C] dark:text-white">
              {product.averageRating?.toFixed(1) || '4.8'}
            </span>
          </div>
        </div>

        {/* Name */}
        <Link to={`/product/${product._id || product.slug}`}>
          <h3 className="font-bold text-[13px] sm:text-sm text-[#1C1C1C] dark:text-[#F0EDE8] group-hover:text-[#E85D3D] transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Size selector — compact */}
        <div className="flex items-center gap-1 flex-wrap">
          {(product.sizes || ['S', 'M', 'L', 'XL']).map(size => (
            <motion.button key={size} whileTap={{ scale: 0.82 }}
              onClick={e => { e.preventDefault(); setSelectedSize(size); }}
              className={`w-6 h-6 sm:w-7 sm:h-7 text-[9px] sm:text-[10px] font-bold rounded-lg border transition-all ${
                selectedSize === size
                  ? 'bg-gradient-to-br from-[#C94A20] to-[#FF7A00] text-white border-transparent shadow-sm'
                  : 'bg-[#F4F1EA] dark:bg-[#1A1A22] text-[#7A7A7A] dark:text-[#888890] border-[#DDD9D0] dark:border-[#252530] hover:border-[#E85D3D]/50'
              }`}>
              {size}
            </motion.button>
          ))}
        </div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between gap-1.5 mt-auto pt-2 border-t border-[#EAE6DD] dark:border-[#1E1E28]">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-base sm:text-lg font-black text-[#1C1C1C] dark:text-white truncate">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-[#A8A8A8] dark:text-[#48484E] line-through hidden sm:inline">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.button
              key={isAdded ? 'added' : 'add'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.88 }}
              onClick={handleQuickAdd}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs transition-all ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#C94A20] to-[#E85D3D] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white shadow-sm hover:shadow-flame-glow'
              }`}>
              {isAdded
                ? <><Check className="w-3 h-3" /><span className="hidden sm:inline">Added</span></>
                : <><ShoppingBag className="w-3 h-3" /><span>Add</span></>
              }
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
