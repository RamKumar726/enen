import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts, setFilter, resetFilters } from '../redux/slices/productSlice';
import { Filter, SlidersHorizontal, RotateCcw, Search, Flame, X } from 'lucide-react';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, filters, page, pages, totalProducts } = useSelector((state) => state.products);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync URL search params to Redux filter state on load
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');
    
    if (searchFromUrl !== null || categoryFromUrl !== null) {
      dispatch(setFilter({
        search: searchFromUrl || '',
        category: categoryFromUrl || 'All'
      }));
    }
  }, [searchParams, dispatch]);

  // Fetch products when filters or page changes
  useEffect(() => {
    dispatch(fetchProducts({
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      size: filters.size,
      color: filters.color,
      search: filters.search,
      sort: filters.sort,
      page
    }));
  }, [dispatch, filters, page]);

  const handleCategoryChange = (cat) => {
    dispatch(setFilter({ category: cat }));
    setSearchParams((prev) => {
      if (cat === 'All') prev.delete('category');
      else prev.set('category', cat);
      return prev;
    });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setFilter({ search: val }));
    setSearchParams((prev) => {
      if (!val) prev.delete('search');
      else prev.set('search', val);
      return prev;
    });
  };

  const handleClearAll = () => {
    dispatch(resetFilters());
    setSearchParams({});
  };

  const categories = ['All', 'Anime Classics', 'Trending', 'Custom'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* SHOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>ENEN CATALOG DROP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            EXPLORE THE <span className="text-flame-gradient">FULL VAULT</span>
          </h1>
        </div>

        {/* MOBILE FILTER TOGGLE & SORT DROPDOWN */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#18181F] border border-[#282834] text-white text-xs font-bold rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#E85D3D]" /> Filters
          </button>

          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={filters.sort}
              onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
              className="bg-[#18181F] border border-[#282834] text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E85D3D]"
            >
              <option value="newest">🔥 Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTERS PILLS */}
      {(filters.category !== 'All' || filters.search || filters.size || filters.minPrice > 0 || filters.maxPrice < 50) && (
        <div className="flex flex-wrap items-center gap-2 bg-[#18181F] border border-[#282834] p-3 rounded-2xl">
          <span className="text-xs text-gray-400 font-bold mr-1">Active Filters:</span>

          {filters.category !== 'All' && (
            <span className="px-3 py-1 bg-[#E85D3D]/20 text-[#E85D3D] text-xs font-bold rounded-lg flex items-center gap-1 border border-[#E85D3D]/40">
              Category: {filters.category}
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleCategoryChange('All')} />
            </span>
          )}

          {filters.search && (
            <span className="px-3 py-1 bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-bold rounded-lg flex items-center gap-1 border border-[#FF7A00]/40">
              Search: "{filters.search}"
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => {
                dispatch(setFilter({ search: '' }));
                setSearchParams((prev) => { prev.delete('search'); return prev; });
              }} />
            </span>
          )}

          {filters.size && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1 border border-amber-500/40">
              Size: {filters.size}
              <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => dispatch(setFilter({ size: '' }))} />
            </span>
          )}

          <button
            onClick={handleClearAll}
            className="text-xs text-gray-400 hover:text-white underline ml-auto font-bold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* MAIN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* LEFT SIDEBAR FILTERS (DESKTOP) */}
        <aside className={`md:block space-y-6 bg-[#18181F] border border-[#282834] p-6 rounded-3xl sticky top-24 ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
          
          <div className="flex items-center justify-between border-b border-[#282834] pb-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E85D3D]" /> Filter Drop
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-[#E85D3D] font-bold"
            >
              Reset
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rengoku, Berserk..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Categories</label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between ${
                    filters.category === cat
                      ? 'bg-[#E85D3D] text-white shadow-md'
                      : 'text-gray-300 hover:bg-[#22222D]'
                  }`}
                >
                  <span>{cat}</span>
                  {filters.category === cat && <Flame className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* SIZE FILTER */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Size</label>
            <div className="grid grid-cols-5 gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => dispatch(setFilter({ size: filters.size === s ? '' : s }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    filters.size === s
                      ? 'bg-[#FF7A00] text-white border-[#FF7A00]'
                      : 'bg-[#121218] text-gray-300 border-[#282834] hover:border-gray-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE RANGE SLIDER */}
          <div className="space-y-3 pt-2 border-t border-[#282834]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="uppercase text-gray-400">Max Price</span>
              <span className="text-[#E85D3D] text-sm">${filters.maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={filters.maxPrice}
              onChange={(e) => dispatch(setFilter({ maxPrice: Number(e.target.value) }))}
              className="w-full accent-[#E85D3D] bg-[#22222D] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
              <span>$10</span>
              <span>$50</span>
            </div>
          </div>

        </aside>

        {/* RIGHT COLUMN: PRODUCT GRID */}
        <main className="md:col-span-3 space-y-6">
          <ProductGrid products={items} loading={loading} />
        </main>
      </div>

    </div>
  );
};

export default Shop;
