import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Carousel from '../components/Carousel';
import ProductGrid from '../components/ProductGrid';
import Collections from '../components/Collections';
import { fetchProducts } from '../redux/slices/productSlice';
import { Flame, ArrowRight, Sparkles, Shield, Truck, RefreshCw, Star } from 'lucide-react';

/* ─── Scroll reveal wrapper ─── */
const Reveal = ({ children, delay = 0, y = 30, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

/* ─── Animated counter ─── */
const Counter = ({ to, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = React.useState(0);
  useEffect(() => { if (inView) count.set(to); }, [inView, to, count]);
  useEffect(() => spring.on('change', v => setDisplay(Math.round(v))), [spring]);
  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
};

const trustItems = [
  { icon: Truck,     title: 'Free Shipping', desc: 'Orders over ₹999',       color: '#E85D3D' },
  { icon: Shield,    title: 'Secure Pay',    desc: 'Razorpay encrypted',      color: '#FF7A00' },
  { icon: RefreshCw, title: '7-Day Swap',    desc: 'Easy size exchanges',     color: '#F59E0B' },
  { icon: Flame,     title: 'Certified',     desc: 'Original ENEN prints',    color: '#F43F5E' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.products);
  useEffect(() => { dispatch(fetchProducts({ limit: 8 })); }, [dispatch]);
  const featuredProducts = items.slice(0, 8);

  return (
    <div className="pb-20">

      {/* ═══ HERO ═══ */}
      <Carousel />

      {/* ═══ TICKER ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#C94A20] via-[#E85D3D] to-[#FF7A00] py-2.5">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#C94A20] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FF7A00] to-transparent z-10 pointer-events-none" />
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center gap-8 pr-8">
                {['UNLEASH THE BLAZE ✦', '240 GSM HEAVYWEIGHT ✦', 'ANIME STREETWEAR ✦', 'FREE SHIPPING ✦', 'BLAZE10 ✦', 'NEW DROPS ✦', 'ENEN ORIGINAL ✦'].map(t => (
                  <span key={t} className="text-white font-black text-[10px] sm:text-xs tracking-[0.15em] uppercase">{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ QUICK STATS ─ mobile-compact ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8 mb-2">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { value: 5000, suffix: '+', label: 'Fans',    color: '#E85D3D' },
            { value: 18,   suffix: '',  label: 'Designs', color: '#FF7A00' },
            { value: 240,  suffix: '',  label: 'GSM',     color: '#F59E0B' },
            { value: 5,    suffix: '',  label: 'Animes',  color: '#60A5FA' },
          ].map(({ value, suffix, label, color }, i) => (
            <Reveal key={label} delay={i * 0.08}
              className="text-center py-3 px-2 bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-2xl shadow-card">
              <div className="text-xl sm:text-2xl font-black" style={{ color }}>
                <Counter to={value} suffix={suffix} />
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#7A7A7A] dark:text-[#888890] font-bold uppercase tracking-wider mt-0.5">{label}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ═══ COLLECTIONS ═══ */}
      <Collections />

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 sm:py-10">

        {/* Section header */}
        <Reveal className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span className="text-[10px] font-extrabold text-[#E85D3D] uppercase tracking-[0.15em]">Hot Drops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1C] dark:text-white leading-tight">
              HOTTEST <span className="text-flame-gradient">RELEASES</span>
            </h2>
          </div>
          <Link to="/shop" className="flex items-center gap-1 text-xs font-black text-[#E85D3D] hover:text-[#FF7A00] transition-colors group">
            All ({items.length})
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Reveal>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* ═══ BRAND BANNER — full width graphic ═══ */}
      <Reveal y={40} className="mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto my-6">
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C94A20 0%, #E85D3D 40%, #FF7A00 80%, #FFB347 100%)' }}>

          {/* Rotating conic overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-full"
              style={{ background: 'conic-gradient(transparent 0%, rgba(255,255,255,0.06) 25%, transparent 50%, rgba(255,255,255,0.06) 75%, transparent 100%)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/15 to-transparent" />
          </div>

          <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Flame className="w-8 h-8 text-white/70" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                240 GSM<br />
                <span className="text-white/80">HEAVYWEIGHT DROPS</span>
              </h2>
              <p className="text-white/70 text-xs max-w-xs">
                Use <strong className="text-white font-black">BLAZE10</strong> for 10% off your first order.
              </p>
            </div>
            <Link to="/shop"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#E85D3D] font-black text-sm rounded-2xl hover:bg-[#FFF5F0] shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
              <Sparkles className="w-4 h-4" /> Shop Now
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ═══ TRUST BAR — 2×2 on mobile ═══ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {trustItems.map(({ icon: Icon, title, desc, color }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <motion.div whileHover={{ y: -4 }}
                className="relative group p-4 sm:p-5 bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] hover:border-[#E85D3D]/35 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 shadow-card transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}08 0%, transparent 70%)` }} />
                <div className="relative p-2 sm:p-2.5 rounded-xl flex-shrink-0" style={{ background: color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="relative">
                  <h4 className="font-black text-xs sm:text-sm text-[#1C1C1C] dark:text-white">{title}</h4>
                  <p className="text-[10px] text-[#7A7A7A] dark:text-[#888890] mt-0.5 leading-tight">{desc}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
