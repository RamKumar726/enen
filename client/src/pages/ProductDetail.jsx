import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductById } from '../redux/slices/productSlice';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
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

/* ─── Main Component ─── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, detailLoading, items } = useSelector((state) => state.products);
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo(0, 0);
    }
  }, [id, dispatch]);

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

  const handleShopOnAmazon = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    if (currentProduct.amazonUrl) window.open(currentProduct.amazonUrl, '_blank', 'noopener,noreferrer');
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
                  <span className="text-white">{currentProduct.numReviews > 0 ? currentProduct.averageRating.toFixed(1) : 'New'}</span>
                  <span className="text-gray-400 text-[11px]">({currentProduct.numReviews || 0} Reviews)</span>
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

          <p className="text-xs text-gray-500">Select size, color, and delivery options on Amazon.</p>
          {/* AMAZON PURCHASE */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleShopOnAmazon}
              disabled={isAuthenticated && !currentProduct.amazonUrl}
              className="w-full py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-flame-glow transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> {isAuthenticated ? (currentProduct.amazonUrl ? 'SHOP ON AMAZON' : 'AMAZON LINK COMING SOON') : 'LOGIN TO SHOP ON AMAZON'}
            </button>
            <p className="text-center text-[11px] text-gray-500">Amazon handles checkout, payment, delivery and order support. Price and availability may change on Amazon.</p>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#282834] text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E85D3D]" /> 240 GSM Heavy
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF7A00]" /> Amazon Delivery
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" /> Amazon Returns
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

            <p className="border-t border-[#282834] pt-5 text-xs text-gray-400">
              Purchases and verified reviews are handled by Amazon. Visit the Amazon product page to read or leave a review.
            </p>
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
