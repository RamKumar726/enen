import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Instagram, Twitter, Youtube, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import ENENLogo from './ENENLogo';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 5000); }
  };

  const navLinks = [
    { to: '/shop', label: 'Shop All Drops' },
    { to: '/collection/One Piece', label: 'One Piece Collection' },
    { to: '/collection/Demon Slayer', label: 'Demon Slayer' },
    { to: '/collection/Naruto', label: 'Naruto Collection' },
    { to: '/cart', label: 'View Cart' },
  ];
  const supportLinks = [
    { to: '/orders', label: 'Order Tracking' },
    { to: '/profile', label: 'My Account' },
    { to: '/shipping-policy', label: 'Shipping Policy' },
    { to: '/return-policy', label: 'Returns & Refunds' },
  ];
  const legalLinks = [
    { to: '/privacy-policy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms & Conditions' },
    { to: '/return-policy', label: 'Return Policy' },
    { to: '/shipping-policy', label: 'Shipping Policy' },
  ];
  const socials = [
    { icon: Instagram, label: 'Instagram', color: '#E1306C', url: import.meta.env.VITE_INSTAGRAM_URL },
    { icon: Twitter, label: 'Twitter', color: '#1DA1F2', url: import.meta.env.VITE_TWITTER_URL },
    { icon: Youtube, label: 'YouTube', color: '#FF0000', url: import.meta.env.VITE_YOUTUBE_URL },
  ];

  const linkCls = 'text-xs text-[#7A7A7A] dark:text-gray-500 hover:text-[#E85D3D] dark:hover:text-[#E85D3D] transition-colors duration-200 font-medium flex items-center gap-1.5 group';

  return (
    <footer className="relative bg-[#F2EFE8] dark:bg-[#070709] border-t border-[#EAE6DD] dark:border-[#1A1A22] text-[#7A7A7A] dark:text-gray-400 pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Bg glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E85D3D]/4 dark:bg-[#E85D3D]/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FF7A00]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

        {/* BRAND COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          <Link to="/" className="block w-fit hover:opacity-90 transition-opacity">
            <ENENLogo size="md" orientation="horizontal" showTagline={true} variant={isDark ? 'dark' : 'light'} />
          </Link>
          <p className="text-xs text-[#7A7A7A] dark:text-gray-500 max-w-xs leading-relaxed">
            ENEN is an elite anime streetwear brand crafting 240 GSM heavyweight oversized printed tees.
            Ignited for passionate otaku, gamers, and anime fans worldwide.
          </p>

          <div className="flex items-center gap-2.5">
            {socials.filter(({ url }) => typeof url === 'string' && url.startsWith('https://')).map(({ icon: Icon, label, color, url }) => (
              <motion.a key={label} href={url} target="_blank" rel="noopener noreferrer" whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }} title={label}
                className="p-2.5 bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] text-[#7A7A7A] dark:text-gray-400 rounded-xl transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.color = color; e.currentTarget.style.boxShadow = `0 0 12px ${color}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.boxShadow = ''; }}>
                <Icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 text-[10px] text-[#A8A8A8] dark:text-gray-600 font-semibold border border-[#EAE6DD] dark:border-[#1E1E28] px-3 py-2 rounded-xl bg-white/60 dark:bg-transparent">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure payment processing</span>
          </div>
        </div>

        {/* NAV LINKS */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-[#1C1C1C] dark:text-white uppercase tracking-[0.15em]">Navigation</h4>
          <ul className="space-y-2.5">
            {navLinks.map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className={linkCls}>
                  <span className="w-1 h-1 rounded-full bg-[#DDD9D0] dark:bg-[#282834] group-hover:bg-[#E85D3D] transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-[#1C1C1C] dark:text-white uppercase tracking-[0.15em]">Customer Care</h4>
          <ul className="space-y-2.5">
            {supportLinks.map(({ to, href, label }) => (
              <li key={label}>
                {to ? (
                  <Link to={to} className={linkCls}>
                    <span className="w-1 h-1 rounded-full bg-[#DDD9D0] dark:bg-[#282834] group-hover:bg-[#E85D3D] transition-colors" />{label}
                  </Link>
                ) : (
                  <a href={href} className={linkCls}>
                    <span className="w-1 h-1 rounded-full bg-[#DDD9D0] dark:bg-[#282834] group-hover:bg-[#E85D3D] transition-colors" />{label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-[#E85D3D] uppercase font-extrabold tracking-widest mb-1">
              <Sparkles className="w-3 h-3" /><span>Exclusive Access</span>
            </div>
            <h4 className="text-xs font-extrabold text-[#1C1C1C] dark:text-white uppercase tracking-[0.12em]">Join The Flame Order</h4>
          </div>
          <p className="text-xs text-[#7A7A7A] dark:text-gray-500 leading-relaxed">
            Get updates on new products and offers. Email sign-up is not enabled yet; your address will not be saved.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className={`relative rounded-xl border transition-all duration-300 ${emailFocused ? 'border-[#E85D3D]/60 shadow-[0_0_12px_rgba(232,93,61,0.15)]' : 'border-[#EAE6DD] dark:border-[#1E1E28]'}`}>
              <input type="email" required placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                className="w-full bg-white dark:bg-[#111116] rounded-xl py-2.5 pl-9 pr-10 text-xs text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-600 focus:outline-none" />
              <Mail className="w-3.5 h-3.5 text-[#A8A8A8] dark:text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <motion.button type="submit" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white rounded-lg transition-all">
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
            <AnimatePresence>
              {subscribed && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Heart className="w-3 h-3 fill-current" /> Newsletter sign-up is not enabled yet. Your address was not saved.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="relative max-w-7xl mx-auto mt-16 pt-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E85D3D]/30 to-transparent" />
        {/* Legal Links Row */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[11px] text-[#A8A8A8] dark:text-gray-600 mb-4">
          {legalLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-[#E85D3D] transition-colors">{label}</Link>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A8A8A8] dark:text-gray-600 gap-3">
          <p>© {new Date().getFullYear()} ENEN Apparel Co. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payment options shown at checkout</span>
            <span className="text-[#E85D3D]/40">•</span>
            <span>Secure checkout</span>
            <span className="text-[#E85D3D]/40">•</span>
            <span>Delivery details at checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
