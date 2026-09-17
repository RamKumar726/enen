import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame, ArrowUpRight } from 'lucide-react';
import { clanService } from '../services/api';

/* ─── Individual Clan Card ─── */
const CollectionCard = ({ item, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const defaultBg = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* The ENTIRE card (box) navigates to the collection page */}
      <Link
        to={`/collection/${encodeURIComponent(item.value || item.name)}`}
        className="group relative flex flex-col h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EAE6DD] dark:border-[#1E1E28] hover:border-[#E85D3D]/50 bg-white dark:bg-[#111116] shadow-card hover:shadow-elevated transition-all duration-300"
      >
        {/* Image area */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
          <img
            src={item.bannerImage || item.image || defaultBg}
            alt={item.name}
            className="w-full h-full object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Accent glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${item.accent || '#E85D3D'}60 0%, transparent 70%)` }}
          />

          {/* Icon badge */}
          {item.icon && (
            <div className="absolute top-2 left-2 text-xl">{item.icon}</div>
          )}

          {/* Dot indicator */}
          <div
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-md"
            style={{ background: item.accent || '#E85D3D' }}
          />
        </div>

        {/* Card footer */}
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-sm sm:text-base text-[#1C1C1C] dark:text-white group-hover:text-[#E85D3D] transition-colors truncate">
              {item.name}
            </h3>
            {item.productCount != null && (
              <p className="text-[10px] text-[#7A7A7A] dark:text-[#888890] font-semibold">
                {item.productCount} designs
              </p>
            )}
          </div>
          {/* Explore button — same destination as the card */}
          <span
            className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-xl transition-all duration-300 group-hover:gap-1.5"
            style={{ background: `${item.accent || '#E85D3D'}20`, color: item.accent || '#E85D3D' }}
          >
            Explore <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

const Collections = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clanService.getClans()
      .then(res => {
        if (res.success && res.clans) {
          setClans(res.clans);
        } else {
          setClans([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching clans from backend:", err);
        setClans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div ref={headerRef} className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-6 h-px bg-gradient-to-r from-[#E85D3D] to-transparent" />
            <Flame className="w-3.5 h-3.5 text-[#E85D3D]" />
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#E85D3D] uppercase tracking-[0.2em]">
              Official Anime Vaults
            </span>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '110%' }} animate={headerInView ? { y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1C1C1C] dark:text-white"
            >
              CHOOSE YOUR{' '}
              <span className="text-flame-gradient">CLAN</span>
            </motion.h2>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {/* Fixed: "View All" now goes to /clans (all clans page) */}
          <Link to="/clans"
            className="flex items-center gap-1.5 text-xs font-bold text-[#E85D3D] hover:text-[#FF7A00] transition-colors group">
            View All Clans
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-[#F4F1EA] dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] animate-pulse" style={{ aspectRatio: '4/5' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {clans.map((item, i) => (
            <CollectionCard key={item._id || item.value} item={item} index={i} />
          ))}
        </div>
      )}

      {/* Dot indicators on mobile */}
      <div className="flex justify-center mt-4 gap-1.5 sm:hidden">
        {clans.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#DDD9D0] dark:bg-[#252530]" />
        ))}
      </div>
    </section>
  );
};

export default Collections;
