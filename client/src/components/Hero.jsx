import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, ShieldCheck, Zap, Sparkles, Award } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0F0F12] via-[#15151C] to-[#0F0F12]">
      
      {/* BACKGROUND FLAME GLOW ORIENTATION */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#D9480F]/20 via-[#E85D3D]/30 to-[#FF7A00]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* ABSTRACT ANIME GRAPHIC GRID LINES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2a15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: HERO TYPOGRAPHY & CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-7 space-y-8 text-center lg:text-left"
        >
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181F] border border-[#E85D3D]/40 text-xs font-bold uppercase tracking-widest text-[#E85D3D] shadow-flame-glow">
            <Flame className="w-4 h-4 text-[#FF7A00] animate-bounce" />
            <span>ENEN LIMITED ANIME DROP 2026</span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            IGNITE YOUR STYLE. <br />
            <span className="text-flame-gradient">UNLEASH THE BLAZE</span>
          </h1>

          {/* SUBTEXT */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
            Premium heavyweight 240 GSM washed cotton anime tees with high-density puff prints. Designed for die-hard fans who demand raw energy and relentless quality.
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white font-extrabold text-base rounded-2xl shadow-flame-glow flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 group"
            >
              <span>EXPLORE THE DROP</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/shop?category=Trending"
              className="w-full sm:w-auto px-8 py-4 bg-[#18181F] hover:bg-[#22222D] text-gray-200 hover:text-white font-bold text-base rounded-2xl border border-[#282834] hover:border-[#E85D3D]/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span>TRENDING GRAPHICS</span>
            </Link>
          </div>

          {/* FEATURE HIGHLIGHT BADGES */}
          <div className="pt-8 border-t border-[#282834]/80 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#18181F] rounded-xl border border-[#282834] text-[#E85D3D]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">240 GSM Cotton</p>
                <p className="text-[11px] text-gray-400">Heavy Terry Fit</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#18181F] rounded-xl border border-[#282834] text-[#FF7A00]">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Puff & Screen Print</p>
                <p className="text-[11px] text-gray-400">Never Fades</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#18181F] rounded-xl border border-[#282834] text-[#FFC107]">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Express Shipping</p>
                <p className="text-[11px] text-gray-400">Free Over $50</p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* RIGHT COLUMN: HERO ANIME TEE SHOWCASE ARTWORK */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center"
        >
          <div className="relative w-full max-w-md aspect-[4/5] bg-gradient-to-b from-[#1E1E28] to-[#121218] rounded-3xl p-4 border border-[#E85D3D]/30 shadow-2xl overflow-hidden group">
            
            {/* BACKGROUND GLOW RINGS */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E85D3D]/10 via-transparent to-[#FF7A00]/10 rounded-3xl" />
            
            {/* HERO PRODUCT FEATURED IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
              alt="ENEN Flame Pillar Tee Showcase"
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
            />

            {/* FLOATING OVERLAY BADGE */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-[#E85D3D]/40 backdrop-blur-xl flex items-center justify-between shadow-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider block">Featured Flame Drop</span>
                <h4 className="text-base font-extrabold text-white truncate">Rengoku Flame Pillar Tee</h4>
                <p className="text-xs font-bold text-[#E85D3D]">$24.99 <span className="text-gray-400 line-through text-[11px] ml-1">$34.99</span></p>
              </div>
              <Link
                to="/shop"
                className="px-4 py-2 bg-[#E85D3D] hover:bg-[#FF7A00] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
