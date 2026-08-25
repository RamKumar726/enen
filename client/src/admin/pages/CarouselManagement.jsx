import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carouselService } from '../../services/api';
import Carousel from '../../components/Carousel';
import { Sliders, Plus, Trash2, Edit, Eye, Check, X, Flame, AlertCircle } from 'lucide-react';

const CarouselManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [msg, setMsg] = useState(null);

  const loadBanners = () => {
    setLoading(true);
    carouselService.getAllBanners()
      .then(res => {
        if (res.success) {
          setBanners(res.banners || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await carouselService.toggleBannerStatus(id);
      if (res.success) {
        setMsg(res.message);
        loadBanners();
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotional banner?')) {
      try {
        const res = await carouselService.deleteBanner(id);
        if (res.success) {
          setMsg('Banner deleted!');
          loadBanners();
          setTimeout(() => setMsg(null), 3000);
        }
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-8">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Sliders className="w-4 h-4 text-[#FF7A00]" />
            <span>HOMEPAGE HERO PROMOTIONAL CAROUSEL</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            CAROUSEL <span className="text-flame-gradient">BANNER MANAGEMENT</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="px-4 py-2.5 bg-[#18181F] border border-[#282834] text-gray-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-[#E85D3D]" /> {showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>

          <Link
            to="/admin/carousel/new"
            className="px-5 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-extrabold rounded-xl shadow-flame-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Banner
          </Link>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* LIVE REAL-TIME PREVIEW CAROUSEL */}
      {showLivePreview && (
        <div className="space-y-3 bg-[#18181F] border border-[#E85D3D]/40 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#FF7A00] tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 animate-bounce" /> Live Real-Time Banner Preview (As Seen on Homepage)
            </span>
            <span className="text-[11px] text-gray-400">{banners.filter(b => b.isActive).length} Active Banners</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#282834]">
            <Carousel overrideBanners={banners.filter(b => b.isActive)} />
          </div>
        </div>
      )}

      {/* CAROUSEL BANNERS LIST TABLE */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-white">Promotional Carousel Banners ({banners.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Banner Preview</th>
                <th className="p-4">Title & Description</th>
                <th className="p-4">Discount</th>
                <th className="p-4">CTA Link</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282834]">
              {banners.map((banner) => (
                <tr key={banner._id} className="hover:bg-[#22222D]">
                  <td className="p-4 font-mono font-bold text-white text-sm">#{banner.displayOrder || 1}</td>
                  <td className="p-4">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-28 h-16 object-cover rounded-xl border border-[#282834] bg-[#121218]"
                    />
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-extrabold text-white text-sm line-clamp-1">{banner.title}</p>
                    <p className="text-gray-400 text-[11px] line-clamp-1">{banner.description}</p>
                  </td>
                  <td className="p-4">
                    {banner.discountPercentage > 0 ? (
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase bg-[#E85D3D]/20 text-[#E85D3D] rounded-md border border-[#E85D3D]/30">
                        {banner.discountPercentage}% OFF
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-[11px] truncate max-w-[120px]">
                    {banner.ctaLink}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(banner._id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-colors ${
                        banner.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <Link
                      to={`/admin/carousel/edit/${banner._id}`}
                      className="p-2 bg-[#22222D] hover:bg-[#E85D3D] text-white rounded-xl transition-colors border border-[#282834]"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 bg-[#22222D] hover:bg-red-500 text-white rounded-xl transition-colors border border-[#282834]"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CarouselManagement;
