import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, clanService } from '../../services/api';
import { ShoppingBag, Plus, Search, Edit, Trash2, Filter, Flame } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [collectionFilter, setCollectionFilter] = useState('All');
  const [msg, setMsg] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = (requestedPage = page) => {
    setLoading(true);
    productService.getAdminProducts({ limit: 50, page: requestedPage, search, category: categoryFilter, collection: collectionFilter })
      .then(res => {
        if (res.success) {
          setProducts(res.products || []);
          setPage(res.page || requestedPage);
          setPages(res.pages || 1);
          setTotalProducts(res.totalProducts || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(1), 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, collectionFilter]);

  useEffect(() => {
    clanService.getClans().then(res => {
      if (res.success && res.clans?.length > 0) setClans(res.clans);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Archive this product? It will leave the storefront but stay on historical orders.')) {
      try {
        const res = await productService.deleteProduct(id);
        if (res.success) {
          setMsg('Product archived successfully');
          loadProducts();
          setTimeout(() => setMsg(null), 3000);
        }
      } catch (err) {}
    }
  };

  const toggleProductActive = async (product) => {
    try {
      await productService.updateProduct(product._id, { isActive: !product.isActive });
      loadProducts();
    } catch (err) { setMsg(err.message || 'Could not update product status'); }
  };

  const filteredProducts = products;

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <ShoppingBag className="w-4 h-4 text-[#FF7A00]" />
            <span>ENEN CATALOG & INVENTORY</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            PRODUCT <span className="text-flame-gradient">MANAGEMENT</span>
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="px-5 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-extrabold rounded-xl shadow-flame-glow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Anime Tee
        </Link>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search product name or anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* CATEGORY FILTER */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#121218] border border-[#282834] text-xs font-bold text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E85D3D]"
          >
            <option value="All">All Apparel Categories</option>
            <option value="Sleeveless">Sleeveless T-Shirts</option>
            <option value="Regular T-Shirt">Regular T-Shirts</option>
            <option value="Sweatshirt">Sweatshirts</option>
            <option value="Oversized">Oversized T-Shirts</option>
          </select>

          {/* COLLECTION FILTER */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="bg-[#121218] border border-[#282834] text-xs font-bold text-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#E85D3D]"
          >
            <option value="All">All Anime Collections</option>
            {clans.length > 0 ? (
              clans.map(c => (
                <option key={c._id || c.value} value={c.value}>{c.name} Collection</option>
              ))
            ) : (
              <>
                <option value="One Piece">One Piece Collection</option>
                <option value="Demon Slayer">Demon Slayer Collection</option>
                <option value="Naruto">Naruto Collection</option>
                <option value="Attack on Titan">Attack on Titan Collection</option>
                <option value="My Hero Academia">My Hero Academia Collection</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-white">Vault Products ({totalProducts})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Anime Collection</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282834]">
              {filteredProducts.map((p) => {
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80';
                return (
                  <tr key={p._id} className="hover:bg-[#22222D]">
                    <td className="p-4 flex items-center gap-3">
                      <img src={img} alt={p.name} className="w-12 h-14 object-cover rounded-xl bg-[#121218] border border-[#282834]" />
                      <div>
                        <p className="font-extrabold text-white text-sm line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.animeSeries}</p>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-200">{p.category}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-[#FF7A00]/20 text-[#FF7A00] rounded-md border border-[#FF7A00]/30">
                        {p.collectionName}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#E85D3D] text-sm">₹{p.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.stock > 10 ? 'text-emerald-400' : 'text-amber-400 bg-amber-500/10'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 font-bold text-amber-400">{p.averageRating > 0 ? `★ ${p.averageRating}` : 'No reviews'}</td>
                    <td className="p-4 flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${p.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>{p.isActive ? 'Active' : 'Archived'}</span>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="p-2 bg-[#22222D] hover:bg-[#E85D3D] text-white rounded-xl transition-colors border border-[#282834]"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => p.isActive ? handleDelete(p._id) : toggleProductActive(p)}
                        className="p-2 bg-[#22222D] hover:bg-red-500 text-white rounded-xl transition-colors border border-[#282834]"
                        title={p.isActive ? 'Archive Product' : 'Reactivate Product'}
                      >
                        {p.isActive ? <Trash2 className="w-4 h-4" /> : <span className="text-xs font-bold">Restore</span>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#282834] pt-4 text-xs text-gray-300">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => loadProducts(page - 1)} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Previous</button>
              <button disabled={page >= pages} onClick={() => loadProducts(page + 1)} className="rounded-lg border border-[#282834] px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductManagement;
