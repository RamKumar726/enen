import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, Zap, Shield, Award } from 'lucide-react';

const animeCollectionsData = [
  {
    id: 'one-piece',
    name: 'One Piece Collection',
    value: 'One Piece',
    subtitle: 'Warrior of Liberation',
    count: '4 Designs',
    description: 'Luffy Gear 5, Roronoa Zoro Swordmaster, Sanji Diable Jambe & Chopper Monster Point.',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular Collection',
    color: 'from-[#D9480F] to-[#E85D3D]'
  },
  {
    id: 'demon-slayer',
    name: 'Demon Slayer Collection',
    value: 'Demon Slayer',
    subtitle: 'Hinokami Flame Art',
    count: '4 Designs',
    description: 'Tanjiro Sun Breathing, Nezuko Demon Form, Nine Hashira Squad & Muzan Demon King.',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    badge: 'Trending Drop',
    color: 'from-[#E85D3D] to-[#FF7A00]'
  },
  {
    id: 'naruto',
    name: 'Naruto Collection',
    value: 'Naruto',
    subtitle: 'Kurama Chakra Seal',
    count: '3 Designs',
    description: 'Naruto Sage Mode, Sasuke Rinnegan Susanoo & Kakashi Sharingan Raikiri.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    badge: 'Classic Shonen',
    color: 'from-[#FF7A00] to-[#FFC107]'
  },
  {
    id: 'attack-on-titan',
    name: 'Attack on Titan Collection',
    value: 'Attack on Titan',
    subtitle: 'Freedom Wings Squad',
    count: '4 Designs',
    description: 'Eren Founder Titan, Levi Ackerman Blades, Mikasa Red Scarf & Colossal Titan Steam.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    badge: 'Limited Edition',
    color: 'from-[#D9480F] to-[#2C2C2C]'
  },
  {
    id: 'my-hero-academia',
    name: 'My Hero Academia Collection',
    value: 'My Hero Academia',
    subtitle: 'Plus Ultra Heroes',
    count: '3 Designs',
    description: 'Deku One For All Full Cowl, Bakugo Howitzer Explosion & All Might Symbol of Peace.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80',
    badge: 'Hero Exclusive',
    color: 'from-[#E85D3D] to-[#3B82F6]'
  }
];

const Collections = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#282834] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>OFFICIAL ANIME VAULTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            CHOOSE YOUR <span className="text-flame-gradient">ANIME CLAN</span>
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-semibold mt-2 sm:mt-0">
          Swipe horizontally on mobile to explore collections
        </p>
      </div>

      {/* HORIZONTAL SWIPE CONTAINER ON MOBILE / GRID ON DESKTOP */}
      <div className="flex sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-none">
        {animeCollectionsData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-80 sm:w-auto snap-center group relative h-96 rounded-3xl overflow-hidden border border-[#282834] hover:border-[#E85D3D]/60 shadow-xl hover:shadow-flame-glow transition-all flex flex-col justify-end p-6"
          >
            {/* BACKGROUND IMAGE */}
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-75 contrast-105"
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/60 to-transparent" />

            {/* CONTENT */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 bg-gradient-to-r ${item.color} text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-md`}>
                  {item.badge}
                </span>
                <span className="px-2 py-0.5 bg-[#18181F]/90 text-gray-300 text-[10px] font-bold rounded-full border border-[#282834]">
                  {item.count}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF7A00] tracking-wider block">{item.subtitle}</span>
                <h3 className="text-2xl font-extrabold text-white group-hover:text-flame-gradient transition-colors">
                  {item.name}
                </h3>
              </div>

              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <Link
                to={`/collection/${encodeURIComponent(item.value)}`}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-[#E85D3D] hover:bg-[#FF7A00] px-4 py-2.5 rounded-xl transition-all shadow-md mt-1 group-hover:shadow-flame-glow"
              >
                <span>View {item.name}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
};

export default Collections;
