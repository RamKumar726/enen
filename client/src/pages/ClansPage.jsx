import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Sparkles, ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import { clanService } from '../services/api';

const ClansPage = () => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    clanService.getClans()
      .then((res) => {
        if (res.success && res.clans) setClans(res.clans);
        else setClans([]);
      })
      .catch(() => setClans([]))
      .finally(() => setLoading(false));
  }, []);

  const defaultBg = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#E85D3D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-px bg-gradient-to-r from-[#E85D3D] to-transparent" />
          <Flame className="w-3.5 h-3.5 text-[#E85D3D]" />
          <span className="text-[10px] font-extrabold text-[#E85D3D] uppercase tracking-[0.2em]">
            Official Anime Vaults
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1C1C1C] dark:text-white">
          ALL <span className="text-flame-gradient">CLANS</span>
        </h1>
        <p className="text-sm text-gray-400 max-w-md">
          Choose your anime clan and explore exclusive ENEN streetwear drops for each universe.
        </p>
      </div>

      {/* Clans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-[#111116] border border-[#1E1E28] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {clans.map((clan, i) => (
            <motion.div
              key={clan._id || clan.value}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
            >
              <Link
                to={`/collection/${encodeURIComponent(clan.value || clan.name)}`}
                className="group block relative h-64 rounded-3xl overflow-hidden border border-[#E85D3D]/20 hover:border-[#E85D3D]/60 shadow-xl transition-all duration-300"
              >
                {/* Background image */}
                <img
                  src={clan.bannerImage || clan.image || defaultBg}
                  alt={clan.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-60 group-hover:scale-105 transition-all duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 50% 100%, ${clan.accent || '#E85D3D'}40 0%, transparent 70%)` }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Icon + Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {clan.icon && (
                      <span className="text-2xl">{clan.icon}</span>
                    )}
                    {clan.productCount != null && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-md">
                        {clan.productCount} Designs
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-black text-white leading-tight group-hover:text-[#FF7A00] transition-colors">
                    {clan.name}
                  </h2>
                  {clan.description && (
                    <p className="text-xs text-white/60 mt-1 line-clamp-2">{clan.description}</p>
                  )}

                  <div className="flex items-center gap-1.5 mt-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl transition-all duration-300 group-hover:pl-4"
                      style={{ background: `${clan.accent || '#E85D3D'}80` }}
                    >
                      Explore Collection
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Accent corner dot */}
                <div
                  className="absolute top-4 right-4 w-3 h-3 rounded-full shadow-lg"
                  style={{ background: clan.accent || '#E85D3D' }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {clans.length === 0 && !loading && (
        <div className="text-center py-20 space-y-3">
          <Layers className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-gray-400">No clans found. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default ClansPage;
