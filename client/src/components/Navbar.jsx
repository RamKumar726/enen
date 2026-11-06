import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, Menu, X, LogOut,
  PackageCheck, UserCheck, ChevronDown, LayoutDashboard,
  Sparkles, Layers, Shirt, Sun, Moon, Flame, Heart, Package, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { clanService } from '../services/api';
import ENENLogo from './ENENLogo';

// Custom Apparel Category Vector Icons
const SleevelessIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 3h10l1.5 5.5L16 10v11H8V10L5.5 8.5L7 3z" />
    <path d="M9 3a3 3 0 0 0 6 0" />
  </svg>
);

const RegularTShirtIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12l3 5-3 2v11H6V10L3 8l3-5z" />
    <path d="M9 3a3 3 0 0 0 6 0" />
  </svg>
);

const SweatshirtIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 3h10l4 7.5-3.5 1.5L16 11v10H8V11L6.5 12 3 10.5 7 3z" />
    <path d="M9 3a3 3 0 0 0 6 0" />
    <path d="M8 21h8" strokeWidth="2.5" />
  </svg>
);

const OversizedTShirtIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16l3.5 7-4.5 1.5V21H5V12.5L.5 11 4 4z" />
    <path d="M8.5 4a3.5 3.5 0 0 0 7 0" />
  </svg>
);

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 6, scale: 0.97, filter: 'blur(4px)', transition: { duration: 0.15 } }
};
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.2 } })
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsTrackOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    window.open('https://www.amazon.in/gp/your-account/order-history', '_blank', 'noopener,noreferrer');
    setIsTrackOpen(false);
  };


  const categories = [
    { name: 'Sleeveless T-Shirts', value: 'Sleeveless', icon: <SleevelessIcon className="w-4 h-4 text-[#E85D3D]" /> },
    { name: 'Regular T-Shirts', value: 'Regular T-Shirt', icon: <RegularTShirtIcon className="w-4 h-4 text-[#FF7A00]" /> },
    { name: 'Sweatshirts', value: 'Sweatshirt', icon: <SweatshirtIcon className="w-4 h-4 text-[#F59E0B]" /> },
    { name: 'Oversized T-Shirts', value: 'Oversized', icon: <OversizedTShirtIcon className="w-4 h-4 text-[#60A5FA]" /> }
  ];
  const [collections, setCollections] = useState([
    { name: 'One Piece', value: 'One Piece', icon: '⚓', color: '#E85D3D' },
    { name: 'Demon Slayer', value: 'Demon Slayer', icon: '🗡️', color: '#FF7A00' },
    { name: 'Naruto', value: 'Naruto', icon: '🍃', color: '#FFB347' },
    { name: 'Attack on Titan', value: 'Attack on Titan', icon: '🛡️', color: '#9CA3AF' },
    { name: 'My Hero Academia', value: 'My Hero Academia', icon: '✊', color: '#60A5FA' }
  ]);

  useEffect(() => {
    clanService.getClans().then(res => {
      if (res.success && res.clans?.length > 0) {
        setCollections(res.clans.map(c => ({
          name: c.name,
          value: c.value,
          icon: c.icon || '⚔️',
          color: c.accent || '#E85D3D'
        })));
      }
    }).catch(() => {});
  }, []);

  const isActive = (path) => location.pathname === path;

  /* Shared dropdown classes */
  const dropdownCls = 'absolute top-full mt-2 glass-intense border border-[#DDD9D0] dark:border-[#282834] rounded-2xl shadow-2xl p-2 z-50 space-y-0.5';

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-500 ${isScrolled ? 'glass-nav shadow-[0_1px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_40px_rgba(0,0,0,0.4)]' : 'bg-transparent border-b border-transparent'}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 hover:opacity-85 transition-opacity duration-200">
            <ENENLogo size="sm" showTagline={true} orientation="horizontal" variant={isDark ? 'dark' : 'light'} />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-7">
            {[{ to: '/', label: 'Home' }, { to: '/shop', label: 'Shop All' }].map(({ to, label }) => (
              <Link key={to} to={to}
                className={`nav-link-animated text-sm font-semibold tracking-wide transition-colors duration-200 py-1 ${isActive(to) ? 'text-[#E85D3D] active' : 'text-[#1C1C1C] dark:text-gray-300 hover:text-[#E85D3D] dark:hover:text-white'}`}
              >
                {label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" onMouseEnter={() => setIsCategoryMenuOpen(true)} onMouseLeave={() => setIsCategoryMenuOpen(false)}>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#1C1C1C] dark:text-gray-300 hover:text-[#E85D3D] dark:hover:text-white py-1 transition-colors">
                <Shirt className="w-4 h-4 text-[#E85D3D]" />
                <span>Categories</span>
                <motion.div animate={{ rotate: isCategoryMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7A7A7A] dark:text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className={`left-0 w-60 ${dropdownCls}`}>
                    {categories.map((cat, i) => (
                      <motion.div key={cat.value} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <Link to={`/shop?category=${encodeURIComponent(cat.value)}`} onClick={() => setIsCategoryMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-[#1C1C1C] dark:text-gray-300 hover:text-[#E85D3D] dark:hover:text-white hover:bg-[#E85D3D]/10 rounded-xl transition-all">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collections Dropdown */}
            <div className="relative" onMouseEnter={() => setIsCollectionMenuOpen(true)} onMouseLeave={() => setIsCollectionMenuOpen(false)}>
              <button className="flex items-center gap-1.5 text-sm font-semibold text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white py-1 transition-colors">
                <Layers className="w-4 h-4 text-[#FF7A00]" />
                <span>Collections</span>
                <motion.div animate={{ rotate: isCollectionMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A8A8A8] dark:text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isCollectionMenuOpen && (
                  <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className={`left-0 w-64 ${dropdownCls}`}>
                    {collections.map((col, i) => (
                      <motion.div key={col.value} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                        <Link to={`/collection/${encodeURIComponent(col.value)}`} onClick={() => setIsCollectionMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-base">{col.icon}</span>
                            <span>{col.name}</span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                        </Link>
                      </motion.div>
                    ))}
                    {/* View all clans link */}
                    <div className="border-t border-[#EAE6DD] dark:border-[#282834] mt-1 pt-1">
                      <Link to="/clans" onClick={() => setIsCollectionMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-[10px] font-black text-[#E85D3D] hover:bg-[#E85D3D]/10 rounded-xl transition-all uppercase tracking-wider">
                        View All Clans <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-xs font-black uppercase text-[#E85D3D] bg-[#E85D3D]/10 px-3 py-1.5 rounded-xl border border-[#E85D3D]/30 hover:bg-[#E85D3D] hover:text-white transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1.5">

            {/* 🌙☀️ Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl border transition-all duration-200 bg-[#F2EFE8] dark:bg-white/5 border-[#DDD9D0] dark:border-white/10 hover:border-[#E85D3D]/50 group"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-4 h-4 text-[#4A4A4A] group-hover:text-[#E85D3D]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* 📦 Track Order */}
            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setIsTrackOpen(!isTrackOpen)}
                title="Track Order"
                className="p-2.5 text-[#7A7A7A] dark:text-gray-400 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[#DDD9D0] dark:hover:border-white/10"
              >
                <Package className="w-5 h-5" />
              </motion.button>
              <AnimatePresence>
                {isTrackOpen && (
                  <motion.div
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                    className={`right-0 w-72 ${dropdownCls}`}
                  >
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-2 text-[#E85D3D]">
                        <Package className="w-4 h-4" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">Track Your Order</span>
                      </div>
                      <form onSubmit={handleTrackOrder} className="flex gap-2">
                        <input
                          type="text"
                          value="Amazon order history"
                          readOnly
                          className="flex-1 bg-black/5 dark:bg-white/5 border border-[#DDD9D0] dark:border-white/10 focus:border-[#E85D3D]/60 rounded-xl py-2 px-3 text-xs text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-500 focus:outline-none transition-all"
                        />
                        <button type="submit" className="px-3 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-bold rounded-xl hover:shadow-flame-glow transition-all flex-shrink-0">
                          Open
                        </button>
                      </form>
                      {isAuthenticated && (
                        <a href="https://www.amazon.in/gp/your-account/order-history" target="_blank" rel="noreferrer" onClick={() => setIsTrackOpen(false)} className="block text-center text-[10px] text-[#E85D3D] hover:underline font-semibold">
                          Open Amazon order history →
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ♥ Wishlist */}
            <Link to="/wishlist"
              className="relative p-2.5 text-[#7A7A7A] dark:text-gray-400 hover:text-[#E85D3D] dark:hover:text-[#E85D3D] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[#E85D3D]/30 group"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span
                    key="wishbadge" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-br from-[#E85D3D] to-[#FF7A00] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Search */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[#7A7A7A] dark:text-gray-400 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[#DDD9D0] dark:hover:border-white/10">
              <Search className="w-5 h-5" />
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#DDD9D0] dark:border-white/10 hover:border-[#E85D3D]/40 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E85D3D] to-[#FF7A00] flex items-center justify-center text-white text-xs font-black">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs text-[#4A4A4A] dark:text-gray-200 font-semibold">{user?.firstName || 'Account'}</span>
                  <motion.div animate={{ rotate: isUserMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-[#A8A8A8] dark:text-gray-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                      className={`right-0 w-56 overflow-hidden ${dropdownCls}`}>
                      <div className="p-4 border-b border-[#EAE6DD] dark:border-[#282834] bg-gradient-to-br from-[#E85D3D]/8 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E85D3D] to-[#FF7A00] flex items-center justify-center text-white font-black text-sm">
                            {user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#1C1C1C] dark:text-white">{user?.firstName} {user?.lastName}</p>
                            <p className="text-[10px] text-[#7A7A7A] dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#E85D3D]/15 text-[#E85D3D] rounded border border-[#E85D3D]/30">
                          {user?.role === 'admin' ? '🔥 Admin User' : '✦ Flame Member'}
                        </span>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[#E85D3D] hover:bg-[#E85D3D]/10 rounded-xl transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <UserCheck className="w-4 h-4 text-[#E85D3D]" /> My Profile
                        </Link>
                        <a href="https://www.amazon.in/gp/your-account/order-history" target="_blank" rel="noreferrer" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <PackageCheck className="w-4 h-4 text-[#FF7A00]" /> My Orders
                        </a>
                        <Link to="/wishlist" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                          <Heart className="w-4 h-4 text-[#E85D3D]" /> My Wishlist
                          {wishlistCount > 0 && (
                            <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 bg-[#E85D3D]/15 text-[#E85D3D] rounded-md">{wishlistCount}</span>
                          )}
                        </Link>
                        <div className="border-t border-[#EAE6DD] dark:border-[#282834] mt-1 pt-1">
                          <button onClick={() => { logout(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white text-sm font-bold rounded-xl shadow-flame-glow transition-all hover:-translate-y-0.5 active:scale-95">
                <User className="w-4 h-4" /> Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-[#7A7A7A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl border border-transparent hover:border-[#DDD9D0] dark:hover:border-white/10 transition-all">
              <AnimatePresence mode="wait">
                {isMobileMenuOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.div>
                  : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden glass-intense border-t border-[#EAE6DD] dark:border-[#282834] overflow-hidden">
              <div className="px-5 py-6 space-y-5">
                <div className="space-y-1">
                  {[{ to: '/', label: 'Home' }, { to: '/shop', label: 'Shop All' }].map(({ to, label }, i) => (
                    <motion.div key={to} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                      <Link to={to} onClick={() => setIsMobileMenuOpen(false)}
                        className={`block text-base font-bold py-2.5 px-3 rounded-xl transition-colors ${isActive(to) ? 'text-[#E85D3D] bg-[#E85D3D]/10' : 'text-[#4A4A4A] dark:text-gray-200 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-base font-bold text-[#E85D3D] py-2.5 px-3 rounded-xl hover:bg-[#E85D3D]/10 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                </div>

                {/* Track order — mobile */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-[#E85D3D] tracking-widest block px-3">Track Order</span>
                  <form onSubmit={handleTrackOrder} className="flex gap-2 px-1">
                    <input
                      type="text"
                      value="Amazon order history"
                      readOnly
                      className="flex-1 bg-black/5 dark:bg-white/5 border border-[#DDD9D0] dark:border-white/10 focus:border-[#E85D3D]/60 rounded-xl py-2.5 px-3 text-xs text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-500 focus:outline-none transition-all"
                    />
                    <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-bold rounded-xl flex-shrink-0">
                      Open
                    </button>
                  </form>
                </div>

                {/* Wishlist + Orders quick links */}
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#4A4A4A] dark:text-gray-300 bg-black/5 dark:bg-white/5 px-3 py-2.5 rounded-xl transition-colors hover:bg-[#E85D3D]/10 hover:text-[#E85D3D]">
                    <Heart className="w-4 h-4 text-[#E85D3D]" /> Wishlist
                    {wishlistCount > 0 && <span className="ml-auto text-[10px] font-black px-1.5 bg-[#E85D3D]/15 text-[#E85D3D] rounded">{wishlistCount}</span>}
                  </Link>
                  <a href="https://www.amazon.in/gp/your-account/order-history" target="_blank" rel="noreferrer" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-semibold text-[#4A4A4A] dark:text-gray-300 bg-black/5 dark:bg-white/5 px-3 py-2.5 rounded-xl transition-colors hover:bg-[#E85D3D]/10 hover:text-[#E85D3D]">
                    <PackageCheck className="w-4 h-4 text-[#FF7A00]" /> My Orders
                  </a>
                </div>

                {/* Theme toggle in mobile */}
                <button onClick={toggleTheme}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-semibold text-[#4A4A4A] dark:text-gray-300 bg-black/5 dark:bg-white/5 rounded-xl border border-[#EAE6DD] dark:border-[#282834]">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4A4A4A]" />}
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>

                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#E85D3D] tracking-widest block mb-2 px-3">Apparel</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.map((c) => (
                      <Link key={c.value} to={`/shop?category=${encodeURIComponent(c.value)}`} onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-xs font-semibold text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/8 px-3 py-2 rounded-xl transition-colors">
                        <span>{c.icon}</span> {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] uppercase font-extrabold text-[#FF7A00] tracking-widest">Collections</span>
                    <Link to="/clans" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] text-[#E85D3D] font-bold hover:underline">View All →</Link>
                  </div>
                  <div className="space-y-0.5">
                    {collections.map((col) => (
                      <Link key={col.value} to={`/collection/${encodeURIComponent(col.value)}`} onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-xs font-semibold text-[#4A4A4A] dark:text-gray-300 hover:text-[#1C1C1C] dark:hover:text-white px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <span>{col.icon}</span> {col.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center py-3 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white font-bold text-sm rounded-xl shadow-flame-glow">
                    Login to ENEN
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
            <div className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-2xl glass-intense border border-[#DDD9D0] dark:border-[#E85D3D]/30 rounded-3xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 p-2 text-[#7A7A7A] dark:text-gray-400 hover:text-[#1C1C1C] dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-5 text-[#E85D3D]">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-[11px] uppercase font-extrabold tracking-widest">Search Anime Tees</span>
              </div>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-5 h-5 text-[#A8A8A8] dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="text" placeholder="Search by Anime, character, or apparel..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                  className="w-full bg-black/5 dark:bg-white/5 border border-[#DDD9D0] dark:border-white/10 focus:border-[#E85D3D]/60 rounded-2xl py-4 pl-12 pr-28 text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-500 focus:outline-none text-sm transition-all" />
                <button type="submit"
                  className="absolute right-2 top-2 px-5 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-bold rounded-xl hover:shadow-flame-glow transition-all">
                  Search
                </button>
              </form>
              <div className="mt-5 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-[#A8A8A8] dark:text-gray-500 font-semibold uppercase tracking-wider mr-1">Trending:</span>
                {['Luffy Gear 5', 'Tanjiro', 'Levi Ackerman', 'Deku', 'Sweatshirt'].map((term) => (
                  <button key={term} onClick={() => { setSearchQuery(term); navigate(`/shop?search=${encodeURIComponent(term)}`); setIsSearchOpen(false); }}
                    className="text-xs px-3 py-1.5 bg-black/5 dark:bg-white/5 hover:bg-[#E85D3D]/15 hover:text-[#E85D3D] text-[#4A4A4A] dark:text-gray-400 rounded-xl transition-all border border-[#EAE6DD] dark:border-white/10 hover:border-[#E85D3D]/30">
                    🔥 {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
