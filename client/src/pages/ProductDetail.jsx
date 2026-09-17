import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductById } from '../redux/slices/productSlice';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Star, 
  ShoppingBag, 
  Flame, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Check, 
  Plus, 
  Minus, 
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Share2,
  ChevronLeft,
  ChevronRight,
  Heart
} from 'lucide-react';

/* ─── Image Carousel for Product ─── */
const ProductImageCarousel = ({ images, productName }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance every 3s
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % images.length);
    }, 3000);
    return () => clearInterval(t);
  }, [images.length, isPaused]);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: (d) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0, transition: { duration: 0.3 } }),
  };

  return (
    <div className="space-y-4">
      {/* Main slide */}
      <div
        className="relative w-full h-[380px] sm:h-[480px] bg-[#18181F] border border-[#282834] rounded-3xl overflow-hidden shadow-2xl group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchMove={(e) => { touchEndX.current = e.touches[0].clientX; }}
        onTouchEnd={() => {
          const diff = touchStartX.current - touchEndX.current;
          if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
        }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.img
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            src={images[current]?.url}
            alt={`${productName} ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3" />
          </span>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 hover:bg-[#E85D3D]/80 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 hover:bg-[#E85D3D]/80 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-1.5 bg-[#E85D3D]' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setDirection(idx > current ? 1 : -1); setCurrent(idx); }}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#18181F] ${
                current === idx
                  ? 'border-[#E85D3D] shadow-flame-glow scale-105'
                  : 'border-[#282834] opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Pincode Delivery Timeline ─── */
const getDeliveryDate = () => {
  const date = new Date();
  let daysAdded = 0;
  while (daysAdded < 7) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

const ShipmentTimeline = ({ pincode }) => {
  const steps = [
    { label: 'Order Placed', desc: 'Today', icon: '📦', done: true },
    { label: 'Packed', desc: 'Day 1', icon: '🏷️', done: true },
    { label: 'Dispatched', desc: 'Day 2–3', icon: '🚚', done: false },
    { label: 'Out for Delivery', desc: 'Day 6–7', icon: '🛵', done: false },
    { label: 'Delivered', desc: getDeliveryDate(), icon: '✅', done: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-3 p-4 bg-emerald-500/8 border border-emerald-500/25 rounded-2xl space-y-3"
    >
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-emerald-400" />
        <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
          Estimated Delivery to {pincode}
        </p>
      </div>
      <p className="text-sm font-black text-white">
        🗓 {getDeliveryDate()}
        <span className="ml-2 text-[10px] text-gray-400 font-normal">(5–7 business days)</span>
      </p>

      {/* Stepper */}
      <div className="relative flex items-start gap-0 pt-2">
        {/* Progress line */}
        <div className="absolute left-4 top-5 bottom-0 w-px bg-[#282834]" />
        <div className="absolute left-4 top-5 w-px bg-gradient-to-b from-emerald-500 to-[#E85D3D]" style={{ height: '40%' }} />

        <div className="flex flex-col gap-4 w-full">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 border-2 transition-all ${
                step.done ? 'bg-emerald-500/20 border-emerald-500' : 'bg-[#18181F] border-[#282834]'
              }`}>
                {step.icon}
              </div>
              <div>
                <p className={`text-xs font-bold ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                <p className="text-[10px] text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main Component ─── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, detailLoading, items } = useSelector((state) => state.products);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('Obsidian Black');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdded, setIsAdded] = useState(false);

  // Pincode delivery state
  const [pincode, setPincode] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo(0, 0);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentProduct?.sizes?.length) {
      setSelectedSize(currentProduct.sizes[0]);
    }
    if (currentProduct?.colors?.length) {
      setSelectedColor(currentProduct.colors[0].name);
    }
  }, [currentProduct]);

  // Show delivery timeline when pincode is 6 digits
  useEffect(() => {
    setShowTimeline(pincode.length === 6 && /^\d{6}$/.test(pincode));
  }, [pincode]);

  if (detailLoading || !currentProduct) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="large" text="FETCHING ANIME DROP..." />
      </div>
    );
  }

  const images = currentProduct.images?.length > 0
    ? currentProduct.images
    : [{ url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', alt: 'ENEN Tee' }];

  const handleAddToCart = () => {
    addToCart(currentProduct, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(currentProduct, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const response = await productService.addReview(currentProduct._id || currentProduct.id, {
        rating: reviewRating,
        comment: reviewComment
      });
      if (response.success) {
        setReviewMsg('Review posted successfully! 🔥');
        setReviewComment('');
        dispatch(fetchProductById(id));
      }
    } catch (err) {
      setReviewMsg(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
      setTimeout(() => setReviewMsg(null), 4000);
    }
  };

  const relatedProducts = items
    .filter(p => (p._id || p.id) !== (currentProduct._id || currentProduct.id))
    .slice(0, 4);

  const wishlisted = isWishlisted(currentProduct._id || currentProduct.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* BACK BUTTON — uses browser history */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#E85D3D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* PRODUCT TOP HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: SWIPE CAROUSEL */}
        <div className="lg:col-span-6">
          <ProductImageCarousel images={images} productName={currentProduct.name} />
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE CONTROLS */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider">
                {currentProduct.animeSeries || 'ENEN Exclusive'}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 text-amber-400 bg-[#18181F] border border-[#282834] px-3 py-1 rounded-xl text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-white">{currentProduct.averageRating || 4.9}</span>
                  <span className="text-gray-400 text-[11px]">({currentProduct.numReviews || 12} Reviews)</span>
                </div>
                {/* Wishlist toggle */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleWishlist(currentProduct)}
                  className={`p-2 rounded-xl border transition-all ${
                    wishlisted
                      ? 'bg-[#E85D3D]/15 border-[#E85D3D]/50 text-[#E85D3D]'
                      : 'bg-[#18181F] border-[#282834] text-gray-400 hover:border-[#E85D3D]/40 hover:text-[#E85D3D]'
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 transition-all ${wishlisted ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {currentProduct.name}
            </h1>
          </div>

          {/* PRICING */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-flame-gradient">
              ₹{currentProduct.price}
            </span>
            {currentProduct.originalPrice > currentProduct.price && (
              <>
                <span className="text-base text-gray-500 line-through font-semibold">
                  ₹{currentProduct.originalPrice}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-extrabold rounded-md border border-emerald-500/40">
                  Save ₹{(currentProduct.originalPrice - currentProduct.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p className="text-sm text-gray-300 leading-relaxed border-t border-[#282834] pt-4">
            {currentProduct.description}
          </p>

          {/* COLOR SELECTOR */}
          {currentProduct.colors?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 block">
                Color: <span className="text-white">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {currentProduct.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedColor === color.name
                        ? 'bg-[#18181F] text-white border-[#E85D3D] shadow-flame-glow'
                        : 'bg-[#121218] text-gray-400 border-[#282834] hover:border-gray-500'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-600" style={{ backgroundColor: color.code }} />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
              <span>Select Size: <strong className="text-[#E85D3D]">{selectedSize}</strong></span>
              <span className="text-gray-500 text-[11px] underline cursor-pointer">Size Guide</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(currentProduct.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-sm font-extrabold rounded-2xl border transition-all ${
                    selectedSize === size
                      ? 'bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white border-[#E85D3D] shadow-flame-glow'
                      : 'bg-[#18181F] text-gray-300 border-[#282834] hover:border-gray-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* PINCODE DELIVERY */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#FF7A00]" /> Check Delivery Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 bg-[#18181F] border border-[#282834] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D] transition-colors"
              />
              {pincode.length === 6 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-400 text-xs font-bold px-3 py-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
                >
                  ✓ Valid
                </motion.span>
              )}
            </div>

            <AnimatePresence>
              {showTimeline && <ShipmentTimeline pincode={pincode} />}
            </AnimatePresence>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-[#18181F] border border-[#282834] rounded-2xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-[#22222D] text-gray-300 rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-[#22222D] text-gray-300 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white shadow-flame-glow hover:shadow-flame-intense'
                }`}
              >
                {isAdded ? (
                  <><Check className="w-5 h-5" /> Added to Cart!</>
                ) : (
                  <><ShoppingBag className="w-5 h-5" /> ADD TO CART</>
                )}
              </motion.button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-[#18181F] hover:bg-[#22222D] text-white font-bold text-sm rounded-2xl border border-[#282834] hover:border-[#E85D3D]/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FF7A00]" /> BUY NOW (INSTANT CHECKOUT)
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#282834] text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E85D3D]" /> 240 GSM Heavy
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF7A00]" /> Express Delivery
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" /> Easy Exchanges
            </div>
          </div>

        </div>

      </div>

      {/* PRODUCT TABS: Description, Fabric Specs, Customer Reviews */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-[#282834] pb-4 overflow-x-auto">
          {[
            { id: 'description', label: 'Anime Lore & Design' },
            { id: 'specs', label: 'Fabric & Print Specs' },
            { id: 'reviews', label: `Customer Reviews (${currentProduct.numReviews || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-bold pb-2 transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-[#E85D3D]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E85D3D]" />
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'description' && (
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed max-w-3xl">
            <p>{currentProduct.description}</p>
            <p>
              Each drop is screen-printed with heat-fixed high-density inks on pre-shrunk Terry washed cotton to prevent shrinking after wash. Inspired by raw Japanese manga ink panels and dark cyberpunk aesthetics.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
              <strong className="text-white block font-bold">Fabric Composition:</strong>
              <span>{currentProduct.fabric || '240 GSM Heavyweight 100% Ring-Spun Terry Cotton'}</span>
            </div>
            <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
              <strong className="text-[#FF7A00] block font-bold">Print Technique:</strong>
              <span>{currentProduct.printType || 'High-Density 3D Puff & Soft-Touch Screen Print'}</span>
            </div>
            <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
              <strong className="text-white block font-bold">Silhouette & Fit:</strong>
              <span>{currentProduct.category === 'Oversized' ? 'Oversized Streetwear Drop-Shoulder Boxy Fit' : currentProduct.category === 'Sweatshirt' ? 'Relaxed Fit Pullover Sweatshirt' : 'Regular / Relaxed Unisex Fit'}</span>
            </div>
            <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
              <strong className="text-white block font-bold">Care Instructions:</strong>
              <span>Machine wash cold inside out. Do not iron directly on puff print.</span>
            </div>
            {currentProduct.animeSeries && (
              <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
                <strong className="text-[#E85D3D] block font-bold">Anime Series:</strong>
                <span>{currentProduct.animeSeries}</span>
              </div>
            )}
            {currentProduct.collectionName && (
              <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
                <strong className="text-white block font-bold">Collection:</strong>
                <span>{currentProduct.collectionName}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* REVIEWS LIST */}
            <div className="space-y-4">
              {(!currentProduct.ratings || currentProduct.ratings.length === 0) ? (
                <p className="text-xs text-gray-400">No reviews yet. Be the first anime fan to ignite a review!</p>
              ) : (
                currentProduct.ratings.map((rev, i) => (
                  <div key={i} className="p-4 bg-[#121218] border border-[#282834] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{rev.userName}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, st) => (
                          <Star key={st} className={`w-3.5 h-3.5 ${st < rev.rating ? 'fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300">{rev.comment}</p>
                    <span className="text-[10px] text-gray-500 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>

            {/* WRITE A REVIEW FORM */}
            <div className="pt-6 border-t border-[#282834] space-y-4">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#E85D3D]" /> Leave a Flame Review
              </h4>

              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
                  {reviewMsg && (
                    <p className={`text-xs font-bold p-3 rounded-xl border ${
                      reviewMsg.includes('success') || reviewMsg.includes('🔥')
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                    }`}>
                      {reviewMsg}
                    </p>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-gray-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      required
                      rows="3"
                      placeholder="Share your thoughts on fit, print quality, and comfort..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-[#121218] border border-[#282834] rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-extrabold rounded-xl shadow-flame-glow hover:shadow-flame-intense transition-all"
                  >
                    {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-gray-400">
                  Please <Link to="/login" className="text-[#E85D3D] underline font-bold">sign in</Link> to write a review.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h3 className="text-2xl font-extrabold text-white">YOU MIGHT ALSO <span className="text-flame-gradient">LIKE</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id || prod.slug} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
