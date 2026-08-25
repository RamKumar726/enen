import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { carouselService } from '../services/api';

const defaultBanners = [
  {
    _id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1400&q=80',
    title: 'SUMMER DROP — 30% OFF ON ALL ANIME TEES',
    description: 'Unleash the blaze with 240 GSM heavyweight oversized streetwear. Set your style ablaze!',
    discountPercentage: 30,
    ctaText: 'EXPLORE DROP NOW',
    ctaLink: '/shop?category=Oversized'
  },
  {
    _id: 'b2',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80',
    title: 'DEMON SLAYER EXCLUSIVE HASHIRA COLLECTION',
    description: 'Tanjiro, Nezuko, Rengoku, and Muzan high-density puff prints. Never fades.',
    discountPercentage: 20,
    ctaText: 'SHOP DEMON SLAYER',
    ctaLink: '/collection/Demon Slayer'
  },
  {
    _id: 'b3',
    imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1400&q=80',
    title: 'ONE PIECE GEAR 5 SUN GOD NIKA RELEASE',
    description: 'The Warrior of Liberation. Ultra heavyweight boxy tees with metallic foil accents.',
    discountPercentage: 25,
    ctaText: 'VIEW ONE PIECE DROP',
    ctaLink: '/collection/One Piece'
  },
  {
    _id: 'b4',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80',
    title: 'ATTACK ON TITAN FREEDOM WINGS SWEATSHIRTS',
    description: 'If you win, you live. Distressed vintage washed heavy Terry sweatshirts.',
    discountPercentage: 15,
    ctaText: 'EXPLORE SWEATSHIRTS',
    ctaLink: '/shop?category=Sweatshirt'
  },
  {
    _id: 'b5',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80',
    title: 'MY HERO ACADEMIA PLUS ULTRA STREETWEAR',
    description: 'Deku, Bakugo, & All Might limited edition graphic prints.',
    discountPercentage: 35,
    ctaText: 'GET PLUS ULTRA',
    ctaLink: '/collection/My Hero Academia'
  }
];

const Carousel = ({ overrideBanners, videoUrl }) => {
  const [banners, setBanners] = useState(overrideBanners || defaultBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!overrideBanners) {
      carouselService.getActiveBanners()
        .then(res => {
          if (res.success && res.banners?.length > 0) {
            setBanners(res.banners);
          }
        })
        .catch(() => {});
    } else {
      setBanners(overrideBanners);
    }
  }, [overrideBanners]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, banners.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      className="relative w-full h-[520px] sm:h-[600px] overflow-hidden bg-[#0A0A0D] border-b border-[#282834]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* GLOBAL HERO BACKGROUND VIDEO LAYER (Replace videoUrl or source src file) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40 filter brightness-70 contrast-125 scale-105"
          poster={currentBanner.imageUrl}
        >
          <source src={videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-fire-flames-floating-in-the-dark-41525-large.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12] via-[#0F0F12]/85 to-[#0F0F12]/60" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner._id || currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full z-1"
        >
          {/* BANNER BACKGROUND IMAGE WITH OVERLAY */}
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover object-center filter brightness-60 contrast-110 opacity-70"
          />

          {/* GRADIENT OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12] via-[#0F0F12]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent" />

          {/* OVERLAY CONTENT CONTAINER */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center text-left space-y-6 z-10">
            
            {/* DISCOUNT BADGE */}
            {currentBanner.discountPercentage > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E85D3D]/20 border border-[#E85D3D]/50 text-xs font-black uppercase text-[#E85D3D] shadow-flame-glow self-start"
              >
                <Tag className="w-4 h-4 text-[#FF7A00]" />
                <span>FLAME DEAL — {currentBanner.discountPercentage}% OFF</span>
              </motion.div>
            )}

            {/* TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.08]"
            >
              {currentBanner.title}
            </motion.h1>

            {/* DESCRIPTION */}
            {currentBanner.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed"
              >
                {currentBanner.description}
              </motion.p>
            )}

            {/* CTA BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Link
                to={currentBanner.ctaLink || '/shop'}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white font-extrabold text-sm rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all active:scale-95 group"
              >
                <span>{currentBanner.ctaText || 'SHOP NOW'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* MANUAL NAVIGATION ARROWS */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#18181F]/80 text-white hover:bg-[#E85D3D] border border-[#282834] transition-all hidden sm:flex items-center justify-center shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-[#18181F]/80 text-white hover:bg-[#E85D3D] border border-[#282834] transition-all hidden sm:flex items-center justify-center shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* NAVIGATION DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-8 bg-gradient-to-r from-[#E85D3D] to-[#FF7A00] shadow-flame-glow'
                : 'w-2.5 bg-gray-600/70 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
