import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Flame, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('L');
  const [isAdded, setIsAdded] = useState(false);

  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';
  const hoverImage = product.images?.[1]?.url || mainImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedSize, product.colors?.[0]?.name || 'Black', 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[#18181F] border border-[#282834] hover:border-[#E85D3D]/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-flame-glow transition-all flex flex-col justify-between"
    >
      {/* BADGES */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
        {product.isBestSeller && (
          <span className="px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white rounded-lg shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current" /> Bestseller
          </span>
        )}
        {product.isNewArrival && !product.isBestSeller && (
          <span className="px-2.5 py-1 text-[10px] uppercase font-extrabold tracking-wider bg-[#FF7A00]/20 border border-[#FF7A00]/40 text-[#FF7A00] rounded-lg">
            New Drop
          </span>
        )}
      </div>

      {/* PRODUCT IMAGE CAROUSEL / ZOOM */}
      <Link to={`/product/${product._id || product.slug}`} className="block relative w-full h-80 overflow-hidden bg-[#121218]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95"
        />
        {hoverImage !== mainImage && (
          <img
            src={hoverImage}
            alt={`${product.name} alternate view`}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        
        {/* QUICK VIEW OVERLAY ICON */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2.5 bg-[#18181F]/90 backdrop-blur-md border border-[#E85D3D]/50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-2xl">
            <Eye className="w-4 h-4 text-[#E85D3D]" /> Quick View
          </span>
        </div>
      </Link>

      {/* PRODUCT CONTENT */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* CATEGORY & ANIME TAG */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
            <span className="text-[#FF7A00] font-bold uppercase tracking-wider text-[10px]">
              {product.animeSeries || 'Anime Drop'}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-white text-xs">{product.averageRating || 4.8}</span>
              <span className="text-gray-500 text-[10px]">({product.numReviews || 12})</span>
            </div>
          </div>

          {/* NAME */}
          <Link to={`/product/${product._id || product.slug}`}>
            <h3 className="font-bold text-base text-gray-100 group-hover:text-[#E85D3D] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* QUICK SIZE PILLS */}
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Select Size:</span>
          <div className="flex items-center gap-1.5">
            {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(size);
                }}
                className={`w-7 h-7 text-xs font-bold rounded-lg border transition-all ${
                  selectedSize === size
                    ? 'bg-[#E85D3D] text-white border-[#E85D3D] shadow-sm'
                    : 'bg-[#22222D] text-gray-300 border-[#282834] hover:border-gray-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* PRICE & ADD TO CART FOOTER */}
        <div className="pt-3 border-t border-[#282834] flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-extrabold text-white">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5 font-medium">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#D9480F] to-[#E85D3D] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white hover:shadow-flame-glow'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
