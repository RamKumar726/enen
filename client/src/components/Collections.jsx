import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame, ArrowUpRight } from 'lucide-react';
import { clanService } from '../services/api';

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
          <Link to="/shop"
            className="flex items-center gap-1.5 text-xs font-bold text-[#E85D3D] hover:text-[#FF7A00] transition-colors group">
            View All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {clans.map((item, i) => (
          <div key={item._id || item.value} className={i === 0 ? 'row-span-1 sm:row-span-1' : ''}>
            <CollectionCard item={item} index={i} />
          </div>
        ))}
      </div>

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
