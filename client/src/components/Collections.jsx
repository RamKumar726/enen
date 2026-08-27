import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame, ArrowUpRight } from 'lucide-react';

const collections = [
  { id: 'one-piece',        name: 'One Piece',         value: 'One Piece',        subtitle: 'Warrior of Liberation', count: 4, image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=700&q=80', badge: 'Popular',       accent: '#E85D3D', icon: '⚓' },
  { id: 'demon-slayer',     name: 'Demon Slayer',      value: 'Demon Slayer',     subtitle: 'Hinokami Flame Art',   count: 4, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80', badge: 'Trending',      accent: '#FF7A00', icon: '🗡️' },
  { id: 'naruto',           name: 'Naruto',            value: 'Naruto',           subtitle: 'Kurama Chakra',        count: 3, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80', badge: 'Classic',       accent: '#F59E0B', icon: '🍃' },
  { id: 'attack-on-titan',  name: 'Attack on Titan',  value: 'Attack on Titan',  subtitle: 'Freedom Wings',        count: 4, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80', badge: 'Limited',       accent: '#94A3B8', icon: '🛡️' },
  { id: 'my-hero-academia', name: 'My Hero Academia', value: 'My Hero Academia', subtitle: 'Plus Ultra Heroes',    count: 3, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80', badge: 'Hero Exclusive', accent: '#60A5FA', icon: '✊' },
];

const CollectionCard = ({ item, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer"
      style={{ height: 'clamp(220px, 38vw, 400px)' }}
    >
      {/* Image */}
      <motion.img
        src={item.image} alt={item.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.45) saturate(1.1)' }}
        whileHover={{ scale: 1.07 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-85" />

      {/* Accent hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${item.accent}28 0%, transparent 65%)` }} />

      {/* Badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white rounded-lg"
          style={{ background: item.accent + 'DD' }}>
          {item.badge}
        </span>
      </div>

      {/* Count */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className="px-2 py-0.5 text-[9px] font-bold text-white/65 bg-black/45 backdrop-blur rounded-lg">
          {item.count}
        </span>
      </div>

      {/* Floating emoji */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-9 right-2.5 text-2xl sm:text-3xl opacity-50 group-hover:opacity-80 transition-opacity z-10"
      >
        {item.icon}
      </motion.div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.12em] block mb-0.5" style={{ color: item.accent }}>
          {item.subtitle}
        </span>
        <h3 className="text-base sm:text-xl font-black text-white leading-tight mb-2 sm:mb-3">
          {item.name}
        </h3>
        <Link
          to={`/collection/${encodeURIComponent(item.value)}`}
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
          style={{ background: `${item.accent}CC` }}
          onClick={e => e.stopPropagation()}
        >
          Explore <ArrowUpRight className="w-3 h-3" />
        </Link>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${item.accent}, transparent)` }} />
      </div>
    </motion.div>
  );
};

const Collections = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

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

      {/* ── 2-col grid on mobile, 3-col on md, 5-col on xl ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* First card spans 2 rows on desktop for visual hierarchy */}
        {collections.map((item, i) => (
          <div key={item.id} className={i === 0 ? 'row-span-1 sm:row-span-1' : ''}>
            <CollectionCard item={item} index={i} />
          </div>
        ))}
      </div>

      {/* Dot indicators on mobile */}
      <div className="flex justify-center mt-4 gap-1.5 sm:hidden">
        {collections.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#DDD9D0] dark:bg-[#252530]" />
        ))}
      </div>
    </section>
  );
};

export default Collections;
