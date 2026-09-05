import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Flame } from 'lucide-react';
import { carouselService } from '../services/api';
import { useTheme } from '../context/ThemeContext';



const defaultBanners = [
  {
    _id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1600&q=90',
    title: 'SUMMER DROP',
    subtitle: '30% OFF ALL ANIME TEES',
    description: 'Unleash the blaze. 240 GSM heavyweight oversized streetwear.',
    discountPercentage: 30,
    ctaText: 'EXPLORE DROP',
    ctaLink: '/shop?category=Oversized',
    accent: '#E85D3D'
  },
  {
    _id: 'b2',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=90',
    title: 'DEMON SLAYER',
    subtitle: 'HASHIRA COLLECTION',
    description: 'Tanjiro, Rengoku & Muzan high-density puff prints. Never fades.',
    discountPercentage: 20,
    ctaText: 'SHOP DEMON SLAYER',
    ctaLink: '/collection/Demon Slayer',
    accent: '#FF7A00'
  },
  {
    _id: 'b3',
    imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1600&q=90',
    title: 'ONE PIECE',
    subtitle: 'SUN GOD NIKA × GEAR 5',
    description: 'The Warrior of Liberation. Ultra heavyweight boxy tees.',
    discountPercentage: 25,
    ctaText: 'VIEW ONE PIECE',
    ctaLink: '/collection/One Piece',
    accent: '#E85D3D'
  }
];

const Carousel = ({ overrideBanners, videoUrl }) => {
  const { isDark } = useTheme();
  const [banners, setBanners] = useState(overrideBanners || defaultBanners);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const heroRef = useRef(null);

  /* Parallax — gentle on mobile for perf */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const parallaxY = useSpring(rawY, { stiffness: 50, damping: 18 });
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!overrideBanners) {
      carouselService.getActiveBanners()
        .then(res => {
          if (res.success && res.banners?.length > 0) {
            setBanners(res.banners);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setBanners(overrideBanners);
      setLoading(false);
    }
  }, [overrideBanners]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const t = setInterval(() => { setDirection(1); setCurrentIndex(p => (p + 1) % banners.length); }, 5500);
    return () => clearInterval(t);
  }, [isPaused, banners.length]);

  const goNext = () => { setDirection(1); setCurrentIndex(p => (p + 1) % banners.length); };
  const goPrev = () => { setDirection(-1); setCurrentIndex(p => (p - 1 + banners.length) % banners.length); };

  const slideVariants = {
    enter: d => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
    exit: d => ({ opacity: 0, x: d > 0 ? -40 : 40, transition: { duration: 0.5 } })
  };

  if (loading) {
    return (
      <div className="w-full h-[55vh] min-h-[400px] max-h-[550px] bg-[#121218] animate-pulse flex items-center justify-center pt-20">
        <Flame className="w-8 h-8 text-[#E85D3D] animate-bounce" />
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;
  const b = banners[currentIndex] || banners[0];

  return (
    <div
      ref={heroRef}
      /* ── Modern responsive height with distinct top Navbar clearance ── */
      className="relative w-full overflow-hidden bg-[#FAF8F4] dark:bg-[#060608] transition-colors duration-400 h-[58vh] min-h-[420px] max-h-[580px] sm:h-[70vh] sm:min-h-[520px] sm:max-h-[750px] lg:h-[85vh] lg:max-h-[850px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchMove={e => { touchEndX.current = e.touches[0].clientX; }}
      onTouchEnd={() => {
        const d = touchStartX.current - touchEndX.current;
        if (Math.abs(d) > 40) { d > 0 ? goNext() : goPrev(); }
      }}
    >
      {/* Background fire video */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-30">
        <video autoPlay loop muted playsInline
          className="w-full h-full object-cover mix-blend-screen"
          poster={b.imageUrl}>
          <source src={videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-fire-flames-floating-in-the-dark-41525-large.mp4'} type="video/mp4" />
        </video>
      </div>

      {/* Parallax slide */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div key={b._id || currentIndex} custom={direction}
          variants={slideVariants} initial="enter" animate="center" exit="exit"
          className="absolute inset-0 z-1">
          <motion.div style={{ y: parallaxY, scale: scaleImg }} className="absolute inset-0">
            <img src={b.imageUrl} alt={b.title}
              className="w-full h-full object-cover object-center transition-all duration-500"
              style={{ filter: isDark ? 'brightness(0.45) contrast(1.1) saturate(1.1)' : 'brightness(0.92) contrast(1.05) saturate(1.05)' }} />
          </motion.div>

          {/* Theme-aware Overlays + Top gradient for Navbar readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#FAF8F4]/80 dark:to-[#060608]/90 pointer-events-none z-1" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F4] via-[#FAF8F4]/75 to-transparent dark:from-[#060608] dark:via-[#060608]/75 dark:to-transparent" />

          {/* Accent bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 80% at 20% 100%, ${b.accent || '#E85D3D'}20 0%, transparent 70%)` }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Content — pt-24 sm:pt-28 ensures complete clearance below fixed 64px Navbar ── */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-center px-5 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-8"
        style={{ opacity: contentOpacity }}
      >
        {/* Progress row */}
        <div className="flex items-center gap-2.5 mb-2.5 sm:mb-4">
          <span className="text-[11px] sm:text-xs font-black text-[#E85D3D] tabular-nums">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1">
            {banners.map((_, i) => (
              <motion.button key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className="relative h-0.5 rounded-full overflow-hidden bg-black/20 dark:bg-white/20"
                animate={{ width: i === currentIndex ? 28 : 8 }}
                transition={{ duration: 0.35 }}
                aria-label={`Slide ${i + 1}`}
              >
                {i === currentIndex && (
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E85D3D] to-[#FF7A00]"
                    initial={{ width: '0%' }} animate={{ width: '100%' }}
                    transition={{ duration: 5.5, ease: 'linear' }} />
                )}
              </motion.button>
            ))}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#7A7A7A] dark:text-white/30 tabular-nums">
            {String(banners.length).padStart(2, '0')}
          </span>

          {b.discountPercentage > 0 && (
            <motion.span key={`badge-${currentIndex}`}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="badge-flame flex items-center gap-1 ml-1 text-[10px] sm:text-xs py-0.5 px-2">
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {b.discountPercentage}% OFF
            </motion.span>
          )}
        </div>

        {/* Title — responsive size prevents wrapping into 6 lines */}
        <div className="overflow-hidden mb-1">
          <AnimatePresence mode="wait">
            <motion.h1 key={`title-${currentIndex}`}
              initial={{ y: '105%' }} animate={{ y: 0 }} exit={{ y: '-105%' }}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              className="font-black leading-[0.95] sm:leading-[0.9] tracking-tight text-[#1C1C1C] dark:text-white uppercase line-clamp-2 sm:line-clamp-none"
              style={{ fontSize: 'clamp(1.5rem, 5.5vw, 5rem)', wordBreak: 'break-word' }}
            >
              {b.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <div className="overflow-hidden mb-2 sm:mb-4">
          <AnimatePresence mode="wait">
            <motion.span key={`sub-${currentIndex}`}
              initial={{ y: '105%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-105%', opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.07, ease: [0.76, 0, 0.24, 1] }}
              className="block font-black tracking-[0.08em] uppercase text-flame-gradient line-clamp-1"
              style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1.4rem)' }}
            >
              {b.subtitle}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Description — hidden on small mobile to keep banner clean & compact */}
        <AnimatePresence mode="wait">
          <motion.p key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="hidden sm:block text-xs sm:text-sm text-[#4A4A4A] dark:text-white/55 leading-relaxed max-w-sm mb-5 font-medium">
            {b.description}
          </motion.p>
        </AnimatePresence>

        {/* CTAs */}
        <AnimatePresence mode="wait">
          <motion.div key={`cta-${currentIndex}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="flex items-center gap-2.5 sm:gap-3 flex-wrap mt-1 sm:mt-0">
            <Link to={b.ctaLink || '/shop'}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-4 bg-gradient-to-r from-[#C94A20] via-[#E85D3D] to-[#FF7A00] text-white font-black text-xs sm:text-sm tracking-wide rounded-xl sm:rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all hover:-translate-y-0.5 active:scale-95 group">
              <span>{b.ctaText || 'SHOP NOW'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/shop"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-[#1C1C1C] dark:text-white/65 hover:text-[#E85D3D] dark:hover:text-white text-xs font-bold border border-[#DDD9D0] dark:border-white/15 hover:border-[#E85D3D]/30 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/50 dark:bg-white/5 transition-all">
              <Flame className="w-3.5 h-3.5 text-[#E85D3D]" /> Browse All
            </Link>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Scroll hint — desktop only */}
      <motion.div className="absolute bottom-8 right-6 z-20 hidden lg:flex flex-col items-center gap-2"
        animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
        <div className="w-px h-12 bg-gradient-to-b from-black/25 dark:from-white/25 to-transparent" />
        <span className="text-[9px] text-[#7A7A7A] dark:text-white/30 font-bold uppercase tracking-[0.2em]" style={{ writingMode: 'vertical-rl' }}>scroll</span>
      </motion.div>

      {/* Nav arrows — desktop */}
      {banners.length > 1 && (<>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-white/8 text-[#1C1C1C] dark:text-white hover:bg-[#E85D3D] hover:text-white dark:hover:bg-[#E85D3D] border border-[#DDD9D0] dark:border-white/12 transition-all hidden sm:flex items-center justify-center backdrop-blur-md shadow-md">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-white/8 text-[#1C1C1C] dark:text-white hover:bg-[#E85D3D] hover:text-white dark:hover:bg-[#E85D3D] border border-[#DDD9D0] dark:border-white/12 transition-all hidden sm:flex items-center justify-center backdrop-blur-md shadow-md">
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </>)}

      {/* Page fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--bg-base)] to-transparent z-20 pointer-events-none" />
    </div>
  );
};

export default Carousel;
