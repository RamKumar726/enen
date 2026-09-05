import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService, clanService } from '../../services/api';
import { ShoppingBag, ArrowLeft, Save, Plus, Trash2, Image, GripVertical } from 'lucide-react';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [clans, setClans] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 14.99,
    originalPrice: 24.99,
    stock: 50,
    category: 'Regular T-Shirt',
    collectionName: 'One Piece',
    animeSeries: 'One Piece',
    fabric: '240 GSM Heavyweight 100% Cotton',
    printType: 'High-Density Puff & Screen Print',
    images: [{ url: '', alt: 'ENEN Tee' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    clanService.getClans().then(res => {
      if (res.success && res.clans?.length > 0) setClans(res.clans);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      productService.getProductById(id).then(res => {
        if (res.success && res.product) {
          setForm(res.product);
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await productService.updateProduct(id, form);
      } else {
        await productService.createProduct(form);
      }
      navigate('/admin/products');
    } catch (err) {
      setMsg(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleSizeToggle = (size) => {
    const current = form.sizes || [];
    if (current.includes(size)) {
      setForm({ ...form, sizes: current.filter(s => s !== size) });
    } else {
      setForm({ ...form, sizes: [...current, size] });
    }
  };

  // Multi-image management helpers
  const handleImageUrlChange = (index, value) => {
    const updated = [...(form.images || [])];
    updated[index] = { url: value, alt: form.name || 'ENEN Tee' };
    setForm({ ...form, images: updated });
  };

  const handleAddImage = () => {
    const current = form.images || [];
    if (current.length >= 6) return;
    setForm({ ...form, images: [...current, { url: '', alt: form.name || 'ENEN Tee' }] });
  };

  const handleRemoveImage = (index) => {
    const updated = (form.images || []).filter((_, i) => i !== index);
    setForm({ ...form, images: updated.length > 0 ? updated : [{ url: '', alt: 'ENEN Tee' }] });
  };

  const handleMoveImage = (fromIdx, toIdx) => {
    const updated = [...(form.images || [])];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setForm({ ...form, images: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between border-b border-[#282834] pb-6">
        <div>
          <Link to="/admin/products" className="text-xs text-gray-400 hover:text-[#E85D3D] font-bold flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Product Vault
          </Link>
          <h1 className="text-3xl font-black text-white">
            {isEdit ? 'EDIT' : 'ADD NEW'} <span className="text-flame-gradient">ANIME TEE</span>
          </h1>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 space-y-6 shadow-2xl">
        
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g., Luffy Gear 5 Sun God Nika Graphic Tee"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Apparel Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl p-3.5 focus:outline-none focus:border-[#E85D3D]"
            >
              <option value="Sleeveless">Sleeveless T-Shirts</option>
              <option value="Regular T-Shirt">Regular T-Shirts</option>
              <option value="Sweatshirt">Sweatshirts</option>
              <option value="Oversized">Oversized T-Shirts</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Anime Collection / Clan</label>
            <select
              value={form.collectionName}
              onChange={(e) => setForm({ ...form, collectionName: e.target.value, animeSeries: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl p-3.5 focus:outline-none focus:border-[#E85D3D]"
            >
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Original Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Inventory Stock</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>
        </div>

        {/* MULTI-IMAGE MANAGER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase text-gray-400">
              Product Images
              <span className="ml-2 text-gray-600 font-normal normal-case">
                ({(form.images || []).length}/6) — First image is the main photo, second shows on hover
              </span>
            </label>
            {(form.images || []).length < 6 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E85D3D]/20 hover:bg-[#E85D3D]/30 border border-[#E85D3D]/50 text-[#E85D3D] text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Image
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(form.images || [{ url: '', alt: '' }]).map((img, idx) => (
              <div key={idx} className="flex gap-3 items-start">

                {/* PREVIEW THUMBNAIL */}
                <div className="w-16 h-16 flex-shrink-0 rounded-xl border border-[#282834] bg-[#121218] overflow-hidden">
                  {img.url ? (
                    <img
                      src={img.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      idx === 0
                        ? 'bg-[#E85D3D]/20 text-[#E85D3D] border border-[#E85D3D]/40'
                        : idx === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-[#282834] text-gray-500 border border-[#282834]'
                    }`}>
                      {idx === 0 ? 'Main Photo' : idx === 1 ? 'Hover Preview' : `Alt ${idx + 1}`}
                    </span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        className="text-[10px] text-gray-500 hover:text-[#E85D3D] font-bold transition-colors"
                      >
                        ↑ Move Up
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder={`https://images.unsplash.com/... (Image ${idx + 1})`}
                    value={img.url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#E85D3D]"
                  />
                </div>

                {/* REMOVE BUTTON — only show if more than 1 image */}
                {(form.images || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-2 text-gray-600 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400">Description</label>
          <textarea
            rows="3"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
        </div>

        {/* FABRIC & PRINT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Fabric Composition</label>
            <input
              type="text"
              placeholder="e.g., 240 GSM Heavyweight 100% Cotton"
              value={form.fabric || ''}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Print Technique</label>
            <input
              type="text"
              placeholder="e.g., High-Density Puff & Screen Print"
              value={form.printType || ''}
              onChange={(e) => setForm({ ...form, printType: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
            />
          </div>
        </div>

        {/* AVAILABLE SIZES */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 block">Available Sizes</label>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
              const isSel = (form.sizes || []).includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl border transition-all ${
                    isSel
                      ? 'bg-[#E85D3D] text-white border-[#E85D3D]'
                      : 'bg-[#121218] text-gray-400 border-[#282834]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-black text-sm rounded-2xl shadow-flame-glow flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {loading ? 'SAVING PRODUCT...' : 'SAVE ANIME PRODUCT'}
        </button>

      </form>

    </div>
  );
};

export default AddEditProduct;
