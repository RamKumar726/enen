import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import { ShoppingBag, ArrowLeft, Save } from 'lucide-react';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

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
            <label className="text-xs font-bold uppercase text-gray-400">Anime Collection</label>
            <select
              value={form.collectionName}
              onChange={(e) => setForm({ ...form, collectionName: e.target.value, animeSeries: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] text-xs font-bold text-white rounded-xl p-3.5 focus:outline-none focus:border-[#E85D3D]"
            >
              <option value="One Piece">One Piece Collection</option>
              <option value="Demon Slayer">Demon Slayer Collection</option>
              <option value="Naruto">Naruto Collection</option>
              <option value="Attack on Titan">Attack on Titan Collection</option>
              <option value="My Hero Academia">My Hero Academia Collection</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Price ($)</label>
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
            <label className="text-xs font-bold uppercase text-gray-400">Original Price ($)</label>
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

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400">Product Image URL</label>
          <input
            type="url"
            required
            placeholder="https://images.unsplash.com/..."
            value={form.images?.[0]?.url || ''}
            onChange={(e) => setForm({ ...form, images: [{ url: e.target.value, alt: form.name }] })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
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
