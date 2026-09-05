import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts, setFilter, resetFilters } from '../redux/slices/productSlice';
import { clanService } from '../services/api';
import { Filter, SlidersHorizontal, RotateCcw, Search, Flame, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const FilterSection = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#EAE6DD] dark:border-[#1E1E28] pb-4">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-extrabold uppercase text-[#4A4A4A] dark:text-gray-300 tracking-wider mb-3 hover:text-[#1C1C1C] dark:hover:text-white transition-colors">
        {title}
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-[#A8A8A8] dark:text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, filters, page, pages, totalProducts } = useSelector((state) => state.products);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Real categories & collections matching DB
  const categories = ['All', 'Regular T-Shirt', 'Oversized', 'Sweatshirt', 'Sleeveless'];
  const [collections, setCollections] = useState(['All', 'One Piece', 'Demon Slayer', 'Naruto', 'Attack on Titan', 'My Hero Academia']);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    clanService.getClans().then(res => {
      if (res.success && res.clans?.length > 0) {
        setCollections(['All', ...res.clans.map(c => c.value)]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    const col = searchParams.get('collection');
    const updates = {};
    if (s !== null) updates.search = s;
    if (c !== null) updates.category = c || 'All';
    if (col !== null) updates.collection = col || 'All';
    if (Object.keys(updates).length > 0) dispatch(setFilter(updates));
  }, [searchParams, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({
      category: filters.category !== 'All' ? filters.category : undefined,
      collection: filters.collection && filters.collection !== 'All' ? filters.collection : undefined,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < 50 ? filters.maxPrice : undefined,
      size: filters.size || undefined,
      color: filters.color || undefined,
      search: filters.search || undefined,
      sort: filters.sort,
      page
    }));
  }, [dispatch, filters, page]);

  const handleCategoryChange = (cat) => {
    dispatch(setFilter({ category: cat, page: 1 }));
    setSearchParams((p) => { if (cat === 'All') p.delete('category'); else p.set('category', cat); return p; });
  };

  const handleCollectionChange = (col) => {
    dispatch(setFilter({ collection: col, page: 1 }));
    setSearchParams((p) => { if (col === 'All') p.delete('collection'); else p.set('collection', col); return p; });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setFilter({ search: val, page: 1 }));
    setSearchParams((p) => { if (!val) p.delete('search'); else p.set('search', val); return p; });
  };

  const handleClearAll = () => { dispatch(resetFilters()); setSearchParams({}); };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;
    dispatch(setFilter({ page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.category !== 'All' ||
    (filters.collection && filters.collection !== 'All') ||
    filters.search ||
    filters.size ||
    filters.minPrice > 0 ||
    filters.maxPrice < 50;

  /* Shared input classes */
  const inputCls = 'w-full bg-[#F4F1EA] dark:bg-[#0D0D11] border border-[#DDD9D0] dark:border-[#1E1E28] focus:border-[#E85D3D]/50 rounded-xl py-2 text-xs text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-600 focus:outline-none transition-colors';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE6DD] dark:border-[#1E1E28] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4 animate-flame-pulse" /> ENEN Catalog Drop
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1C1C] dark:text-white">
            EXPLORE THE <span className="text-flame-gradient">FULL VAULT</span>
          </h1>
          {totalProducts > 0 && <p className="text-xs text-[#7A7A7A] dark:text-gray-500 mt-1 font-semibold">{totalProducts} designs available</p>}
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#18181F] border border-[#DDD9D0] dark:border-[#282834] hover:border-[#E85D3D]/40 text-[#1C1C1C] dark:text-white text-xs font-bold rounded-xl transition-colors shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-[#E85D3D]" /> Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#E85D3D]" />}
          </motion.button>
          <div className="flex items-center gap-2 bg-white dark:bg-[#18181F] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-xl px-3 py-1 shadow-sm">
            <span className="text-[10px] text-[#7A7A7A] dark:text-gray-500 font-bold uppercase tracking-wider hidden sm:inline">Sort</span>
            <select value={filters.sort} onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
              className="bg-transparent text-[#1C1C1C] dark:text-white text-xs font-bold focus:outline-none py-1.5 cursor-pointer">
              <option value="newest">🔥 Newest</option>
              <option value="price-low">↑ Price</option>
              <option value="price-high">↓ Price</option>
              <option value="rating">⭐ Top Rated</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ACTIVE FILTER PILLS */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 bg-[#F4F1EA] dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] p-3 rounded-2xl">
            <span className="text-[10px] text-[#7A7A7A] dark:text-gray-500 font-bold uppercase tracking-wider mr-1">Active Filters:</span>
            {filters.category !== 'All' && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="px-3 py-1 bg-[#E85D3D]/10 text-[#E85D3D] text-xs font-bold rounded-lg flex items-center gap-1.5 border border-[#E85D3D]/30">
                {filters.category} <button onClick={() => handleCategoryChange('All')}><X className="w-3 h-3" /></button>
              </motion.span>
            )}
            {filters.collection && filters.collection !== 'All' && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="px-3 py-1 bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold rounded-lg flex items-center gap-1.5 border border-[#FF7A00]/30">
                {filters.collection} <button onClick={() => handleCollectionChange('All')}><X className="w-3 h-3" /></button>
              </motion.span>
            )}
            {filters.search && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="px-3 py-1 bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold rounded-lg flex items-center gap-1.5 border border-[#FF7A00]/30">
                "{filters.search}" <button onClick={() => { dispatch(setFilter({ search: '' })); setSearchParams((p) => { p.delete('search'); return p; }); }}><X className="w-3 h-3" /></button>
              </motion.span>
            )}
            {filters.size && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-amber-500/30">
                Size: {filters.size} <button onClick={() => dispatch(setFilter({ size: '' }))}><X className="w-3 h-3" /></button>
              </motion.span>
            )}
            <button onClick={handleClearAll} className="ml-auto text-xs text-[#7A7A7A] dark:text-gray-500 hover:text-[#1C1C1C] dark:hover:text-white flex items-center gap-1 font-bold transition-colors">
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

        {/* SIDEBAR */}
        <aside className={`md:block space-y-5 bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] p-5 rounded-3xl sticky top-24 shadow-sm ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DD] dark:border-[#1E1E28]">
            <h3 className="font-extrabold text-sm text-[#1C1C1C] dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E85D3D]" /> Filter
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#E85D3D] animate-pulse" />}
            </h3>
            {hasActiveFilters && (
              <button onClick={handleClearAll} className="text-xs text-[#7A7A7A] dark:text-gray-500 hover:text-[#E85D3D] font-bold transition-colors">Reset</button>
            )}
          </div>

          <FilterSection title="Search">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A8A8A8] dark:text-gray-500 absolute left-3 top-2.5" />
              <input type="text" placeholder="Rengoku, Berserk..." value={filters.search} onChange={handleSearchChange}
                className={`${inputCls} pl-9 pr-3`} />
            </div>
          </FilterSection>

          {/* CATEGORIES — matches actual DB category values */}
          <FilterSection title="Category">
            <div className="space-y-1">
              {categories.map((cat) => (
                <motion.button key={cat} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
                    filters.category === cat
                      ? 'bg-gradient-to-r from-[#E85D3D] to-[#FF7A00] text-white shadow-sm'
                      : 'text-[#4A4A4A] dark:text-gray-400 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}>
                  <span>{cat === 'All' ? 'All Categories' : cat}</span>
                  {filters.category === cat && <Flame className="w-3 h-3" />}
                </motion.button>
              ))}
            </div>
          </FilterSection>

          {/* COLLECTIONS — NEW: lets users filter by anime collection */}
          <FilterSection title="Collection">
            <div className="space-y-1">
              {collections.map((col) => (
                <motion.button key={col} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} onClick={() => handleCollectionChange(col)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
                    (filters.collection || 'All') === col
                      ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFB347] text-white shadow-sm'
                      : 'text-[#4A4A4A] dark:text-gray-400 hover:text-[#1C1C1C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}>
                  <span className="flex items-center gap-2">
                    {col !== 'All' && <span className="text-base leading-none">{
                      col === 'One Piece' ? '⚓' :
                      col === 'Demon Slayer' ? '🗡️' :
                      col === 'Naruto' ? '🍃' :
                      col === 'Attack on Titan' ? '🛡️' :
                      col === 'My Hero Academia' ? '✊' : ''
                    }</span>}
                    {col === 'All' ? 'All Collections' : col}
                  </span>
                </motion.button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Size">
            <div className="grid grid-cols-5 gap-1.5">
              {sizes.map((s) => (
                <motion.button key={s} whileTap={{ scale: 0.85 }} onClick={() => dispatch(setFilter({ size: filters.size === s ? '' : s }))}
                  className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                    filters.size === s
                      ? 'bg-gradient-to-br from-[#E85D3D] to-[#FF7A00] text-white border-transparent shadow-sm'
                      : 'bg-[#F4F1EA] dark:bg-[#0D0D11] text-[#4A4A4A] dark:text-gray-400 border-[#DDD9D0] dark:border-[#1E1E28] hover:border-[#E85D3D]/50'
                  }`}>
                  {s}
                </motion.button>
              ))}
            </div>
          </FilterSection>

          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-bold mb-3">
              <span className="uppercase text-[#A8A8A8] dark:text-gray-500 tracking-wider text-[10px]">Max Price</span>
              <span className="text-[#E85D3D] font-black">₹{filters.maxPrice}</span>
            </div>
            <input type="range" min="10" max="50" step="1" value={filters.maxPrice}
              onChange={(e) => dispatch(setFilter({ maxPrice: Number(e.target.value) }))}
              style={{ '--slider-pct': `${((filters.maxPrice - 10) / 40) * 100}%` }} className="w-full" />
            <div className="flex justify-between text-[10px] text-[#A8A8A8] dark:text-gray-600 font-semibold mt-1">
              <span>₹10</span><span>₹50</span>
            </div>
          </div>
        </aside>

        <main className="md:col-span-3 space-y-6">
          <ProductGrid products={items} loading={loading} />

          {/* PAGINATION */}
          {pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white dark:bg-[#18181F] border border-[#EAE6DD] dark:border-[#282834] text-[#1C1C1C] dark:text-white rounded-xl hover:border-[#E85D3D]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 text-xs font-bold rounded-xl border transition-all ${
                      p === page
                        ? 'bg-gradient-to-br from-[#E85D3D] to-[#FF7A00] text-white border-transparent shadow-flame-glow'
                        : 'bg-white dark:bg-[#18181F] border-[#EAE6DD] dark:border-[#282834] text-[#4A4A4A] dark:text-gray-400 hover:border-[#E85D3D]/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pages}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-white dark:bg-[#18181F] border border-[#EAE6DD] dark:border-[#282834] text-[#1C1C1C] dark:text-white rounded-xl hover:border-[#E85D3D]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pages > 1 && !loading && (
            <p className="text-center text-[11px] text-[#A8A8A8] dark:text-gray-600 font-semibold">
              Page {page} of {pages} — {totalProducts} total products
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
