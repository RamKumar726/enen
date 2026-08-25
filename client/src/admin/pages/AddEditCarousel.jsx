import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { carouselService } from '../../services/api';
import { Sliders, ArrowLeft, Save, Image, Flame } from 'lucide-react';

const AddEditCarousel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    discountPercentage: 0,
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    displayOrder: 1,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isEdit) {
      carouselService.getAllBanners().then(res => {
        if (res.success) {
          const found = res.banners.find(b => b._id === id);
          if (found) {
            setForm(found);
          }
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await carouselService.updateBanner(id, form);
      } else {
        await carouselService.createBanner(form);
      }
      navigate('/admin/carousel');
    } catch (err) {
      setMsg(err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between border-b border-[#282834] pb-6">
        <div>
          <Link to="/admin/carousel" className="text-xs text-gray-400 hover:text-[#E85D3D] font-bold flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Carousel Banners
          </Link>
          <h1 className="text-3xl font-black text-white">
            {isEdit ? 'EDIT' : 'ADD NEW'} <span className="text-flame-gradient">CAROUSEL BANNER</span>
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
          <label className="text-xs font-bold uppercase text-gray-400">Banner Title / Heading</label>
          <input
            type="text"
            required
            placeholder="e.g., SUMMER SALE — 30% OFF ON ALL TEES"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400">Description / Tagline</label>
          <textarea
            rows="2"
            placeholder="e.g., Heavyweight 240 GSM oversized streetwear. Set your style ablaze!"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400">Banner Image URL</label>
          <input
            type="url"
            required
            placeholder="https://images.unsplash.com/..."
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
          {form.imageUrl && (
            <div className="pt-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Image Preview:</span>
              <img src={form.imageUrl} alt="Preview" className="w-full h-44 object-cover rounded-2xl border border-[#282834]" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Discount Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">CTA Button Text</label>
            <input
              type="text"
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">CTA Target Link</label>
            <input
              type="text"
              value={form.ctaLink}
              onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
              className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-[#282834]">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-[#E85D3D] rounded cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-white cursor-pointer">
              Active Banner (Visible on Hero Carousel)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-black text-sm rounded-2xl shadow-flame-glow flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {loading ? 'SAVING BANNER...' : 'SAVE CAROUSEL BANNER'}
        </button>

      </form>

    </div>
  );
};

export default AddEditCarousel;
