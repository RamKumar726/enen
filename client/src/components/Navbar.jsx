import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  LogOut, 
  PackageCheck, 
  UserCheck, 
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  Layers,
  Shirt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalQuantity, toggleCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Sleeveless T-Shirts', value: 'Sleeveless' },
    { name: 'Regular T-Shirts', value: 'Regular T-Shirt' },
    { name: 'Sweatshirts', value: 'Sweatshirt' },
    { name: 'Oversized T-Shirts', value: 'Oversized' }
  ];

  const collections = [
    { name: 'One Piece Collection', value: 'One Piece' },
    { name: 'Demon Slayer Collection', value: 'Demon Slayer' },
    { name: 'Naruto Collection', value: 'Naruto' },
    { name: 'Attack on Titan Collection', value: 'Attack on Titan' },
    { name: 'My Hero Academia Collection', value: 'My Hero Academia' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* BRAND LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center bg-[#1E1E26] rounded-xl border border-[#E85D3D]/40 group-hover:border-[#FF7A00] transition-colors shadow-flame-glow">
              <Flame className="w-6 h-6 text-[#E85D3D] group-hover:text-[#FF7A00] transition-colors group-hover:scale-110 duration-300" />
              <div className="absolute inset-0 bg-[#E85D3D]/10 rounded-xl blur-sm group-hover:bg-[#FF7A00]/20 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-wider text-flame-gradient leading-none">
                ENEN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF7A00]/80">
                UNLEASH THE BLAZE
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS & DROPDOWNS */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/' ? 'text-[#E85D3D]' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/shop' ? 'text-[#E85D3D]' : 'text-gray-300 hover:text-white'
              }`}
            >
              Shop All
            </Link>

            {/* DROPDOWN 1: SHOP BY CATEGORY */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCategoryMenuOpen(true)}
              onMouseLeave={() => setIsCategoryMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white py-2">
                <Shirt className="w-4 h-4 text-[#E85D3D]" />
                <span>Shop by Category</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full w-56 bg-[#18181F] border border-[#282834] rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.value}
                        to={`/shop?category=${encodeURIComponent(cat.value)}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#22222D] rounded-xl transition-colors"
                      >
                        <span>{cat.name}</span>
                        <Flame className="w-3 h-3 text-[#FF7A00]" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DROPDOWN 2: SHOP BY COLLECTION */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCollectionMenuOpen(true)}
              onMouseLeave={() => setIsCollectionMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white py-2">
                <Layers className="w-4 h-4 text-[#FF7A00]" />
                <span>Anime Collections</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <AnimatePresence>
                {isCollectionMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-full w-64 bg-[#18181F] border border-[#282834] rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    {collections.map((col) => (
                      <Link
                        key={col.value}
                        to={`/collection/${encodeURIComponent(col.value)}`}
                        onClick={() => setIsCollectionMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#22222D] rounded-xl transition-colors"
                      >
                        <span>{col.name}</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ADMIN LINK IN NAVBAR */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-xs font-black uppercase text-[#E85D3D] bg-[#E85D3D]/10 px-3 py-1.5 rounded-xl border border-[#E85D3D]/30 hover:bg-[#E85D3D] hover:text-white transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* ACTIONS: Search, Cart, User Dropdown */}
          <div className="flex items-center gap-4">
            
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-[#1E1E26] rounded-xl transition-all border border-transparent hover:border-[#282834]"
              title="Search Anime Tees"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-gray-300 hover:text-white hover:bg-[#1E1E26] rounded-xl transition-all border border-transparent hover:border-[#E85D3D]/30 group"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-[#E85D3D] transition-colors" />
              {totalQuantity > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E85D3D] to-[#FF7A00] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#E85D3D]/40"
                >
                  {totalQuantity}
                </motion.span>
              )}
            </button>

            {/* User Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-[#18181F] border border-[#282834] hover:border-[#E85D3D]/40 transition-all text-sm font-medium"
                >
                  <img
                    src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-lg object-cover border border-[#E85D3D]"
                  />
                  <span className="hidden sm:inline text-gray-200">{user?.firstName || 'Account'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-[#18181F] border border-[#282834] rounded-2xl shadow-2xl p-2 z-50 divide-y divide-[#282834]"
                    >
                      <div className="p-3">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#E85D3D]/20 text-[#E85D3D] rounded">
                          {user?.role === 'admin' ? '🔥 Admin User' : 'Flame Member'}
                        </span>
                      </div>

                      <div className="py-2 space-y-1">
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-[#E85D3D] hover:bg-[#E85D3D]/10 rounded-xl transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#22222D] rounded-xl transition-colors"
                        >
                          <UserCheck className="w-4 h-4 text-[#E85D3D]" />
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#22222D] rounded-xl transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-[#FF7A00]" />
                          My Orders
                        </Link>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] hover:from-[#E85D3D] hover:to-[#FF7A00] text-white text-sm font-bold rounded-xl shadow-flame-glow transition-all active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-gray-300 hover:text-white hover:bg-[#1E1E26] rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[#121216] border-b border-[#282834] px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-gray-200 hover:text-[#E85D3D] py-1 border-b border-[#1E1E26]"
                >
                  Home
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-gray-200 hover:text-[#E85D3D] py-1 border-b border-[#1E1E26]"
                >
                  Shop All Products
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-bold text-[#E85D3D] py-1 border-b border-[#1E1E26] flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}

                {/* MOBILE CATEGORIES */}
                <div className="pt-2">
                  <span className="text-xs uppercase font-extrabold text-[#E85D3D] tracking-wider block mb-2">
                    Apparel Categories
                  </span>
                  <div className="pl-3 space-y-2">
                    {categories.map((c) => (
                      <Link
                        key={c.value}
                        to={`/shop?category=${encodeURIComponent(c.value)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm text-gray-300 hover:text-white"
                      >
                        • {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* MOBILE COLLECTIONS */}
                <div className="pt-2">
                  <span className="text-xs uppercase font-extrabold text-[#FF7A00] tracking-wider block mb-2">
                    Anime Collections
                  </span>
                  <div className="pl-3 space-y-2">
                    {collections.map((col) => (
                      <Link
                        key={col.value}
                        to={`/collection/${encodeURIComponent(col.value)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-sm text-gray-300 hover:text-white"
                      >
                        ⚡ {col.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SEARCH MODAL OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-[#18181F] border border-[#E85D3D]/40 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-[#22222D] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 text-[#E85D3D]">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-xs uppercase font-extrabold tracking-wider">Search Anime Tees</span>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search by Anime, character, or apparel (e.g., Luffy, Tanjiro, Oversized)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#0F0F12] border border-[#282834] rounded-2xl py-4 pl-12 pr-28 text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D] focus:ring-1 focus:ring-[#E85D3D] text-base"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4.5" />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 px-5 py-2 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-sm font-bold rounded-xl hover:shadow-flame-glow transition-all"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 font-semibold mr-2">Trending Searches:</span>
                {['Luffy Gear 5', 'Tanjiro', 'Levi Ackerman', 'Deku', 'Sweatshirt'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/shop?search=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                    className="text-xs px-3 py-1.5 bg-[#22222D] hover:bg-[#E85D3D]/20 hover:text-[#E85D3D] text-gray-300 rounded-lg transition-colors border border-[#282834]"
                  >
                    🔥 {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
