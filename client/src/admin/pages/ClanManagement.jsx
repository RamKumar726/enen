import React, { useEffect, useState } from 'react';
import { clanService } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  MoveUp,
  Image as ImageIcon
} from 'lucide-react';

const presetAccents = ['#E85D3D', '#FF7A00', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#94A3B8'];
const presetBadges = ['Popular', 'Trending', 'Classic', 'Limited', 'Hero Exclusive', 'New Drop', 'Must Have'];
const presetIcons = ['⚓', '🗡️', '🍃', '🛡️', '✊', '⚡', '🔥', '🐉', '👁️', '💀'];

const ClanManagement = () => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('success');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClan, setEditingClan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    subtitle: '',
    image: '',
    badge: 'Popular',
    accent: '#E85D3D',
    icon: '⚓',
    displayOrder: 1,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(null), 5000);
  };

  const loadClans = () => {
    setLoading(true);
    clanService.getAdminClans()
      .then(res => {
        if (res.success) setClans(res.clans || []);
      })
      .catch(err => console.error('Failed to fetch clans:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClans(); }, []);

  const openCreateModal = () => {
    setEditingClan(null);
    setFormData({
      name: '',
      value: '',
      subtitle: '',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80',
      badge: 'Popular',
      accent: '#E85D3D',
      icon: '⚡',
      displayOrder: clans.length + 1,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (clan) => {
    setEditingClan(clan);
    setFormData({
      name: clan.name || '',
      value: clan.value || clan.name || '',
      subtitle: clan.subtitle || '',
      image: clan.image || '',
      badge: clan.badge || 'Popular',
      accent: clan.accent || '#E85D3D',
      icon: clan.icon || '⚓',
      displayOrder: clan.displayOrder || 1,
      isActive: clan.isActive !== undefined ? clan.isActive : true
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (clan) => {
    try {
      const updated = { ...clan, isActive: !clan.isActive };
      const res = await clanService.updateClan(clan._id, updated);
      if (res.success) {
        showMsg(`Clan "${clan.name}" is now ${!clan.isActive ? 'Active' : 'Inactive'}`);
        loadClans();
      }
    } catch (err) {
      showMsg('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete clan "${name}"?`)) return;
    try {
      const res = await clanService.deleteClan(id);
      if (res.success) {
        showMsg(`Clan "${name}" deleted successfully`);
        loadClans();
      }
    } catch (err) {
      showMsg('Failed to delete clan', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingClan) {
        const res = await clanService.updateClan(editingClan._id, formData);
        if (res.success) showMsg(`Clan "${formData.name}" updated successfully!`);
      } else {
        const res = await clanService.createClan(formData);
        if (res.success) showMsg(`New clan "${formData.name}" created successfully!`);
      }
      setModalOpen(false);
      loadClans();
    } catch (err) {
      showMsg(err.response?.data?.message || err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 text-[#FF7A00]" />
            <span>HOMEPAGE CLAN VAULTS</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            CHOOSE YOUR <span className="text-[#E85D3D]">CLAN MANAGEMENT</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage homepage anime clans, subtitles, badges, card cover images, and accent themes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-xs rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Clan
        </button>
      </div>

      {/* BANNER NOTIFICATION */}
      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
          msgType === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msgType === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {msg}
        </div>
      )}

      {/* CLAN CARDS GRID */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading clans...</div>
      ) : clans.length === 0 ? (
        <div className="text-center py-20 bg-[#18181F] border border-[#282834] rounded-3xl space-y-4">
          <p className="text-gray-400 text-sm font-bold">No clans found in database.</p>
          <button onClick={openCreateModal} className="px-4 py-2 bg-[#E85D3D] text-white text-xs font-bold rounded-xl">
            Create First Clan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clans.map((clan) => (
            <div
              key={clan._id}
              className={`group relative bg-[#18181F] border rounded-3xl overflow-hidden transition-all shadow-xl ${
                clan.isActive ? 'border-[#282834] hover:border-[#E85D3D]' : 'border-red-500/30 opacity-60'
              }`}
            >
              {/* IMAGE HEADER */}
              <div className="relative h-44 w-full overflow-hidden bg-[#121218]">
                <img
                  src={clan.image}
                  alt={clan.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181F] via-black/40 to-transparent" />

                {/* BADGE */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 text-[10px] uppercase font-black text-white rounded-lg shadow-md"
                    style={{ background: clan.accent || '#E85D3D' }}
                  >
                    {clan.badge}
                  </span>
                  <span className="text-2xl">{clan.icon}</span>
                </div>

                {/* ACTIVE STATUS TOGGLE BUTTON */}
                <button
                  onClick={() => handleToggleActive(clan)}
                  className={`absolute top-3 right-3 p-2 rounded-xl text-xs font-bold border transition-all ${
                    clan.isActive
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-red-500/20 border-red-500/50 text-red-400'
                  }`}
                  title={clan.isActive ? 'Deactivate Clan' : 'Activate Clan'}
                >
                  {clan.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* CLAN DETAILS */}
              <div className="p-5 space-y-4">
                <div>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-widest block mb-1"
                    style={{ color: clan.accent || '#E85D3D' }}
                  >
                    {clan.subtitle || 'ANIME SERIES'}
                  </span>
                  <h3 className="text-xl font-black text-white">{clan.name}</h3>
                  <span className="text-[11px] text-gray-500 font-mono">Value Slug: {clan.value}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#282834] text-xs">
                  <span className="text-gray-400 font-bold">Order: #{clan.displayOrder}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(clan)}
                      className="p-2 bg-[#22222D] hover:bg-[#E85D3D] text-white rounded-xl transition-colors border border-[#282834]"
                      title="Edit Clan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(clan._id, clan.name)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
                      title="Delete Clan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-[#282834] pb-4">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E85D3D]" />
                {editingClan ? 'Edit Anime Clan' : 'Create New Anime Clan'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Clan Name (e.g., Jujutsu Kaisen)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, value: formData.value || e.target.value })}
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              {/* VALUE / SLUG */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Category Value Slug (used in Product filtering)</label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              {/* SUBTITLE */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Subtitle Tagline (e.g., Domain Expansion)</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Card Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
                />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="w-full h-24 object-cover rounded-xl mt-2 border border-[#282834]" />
                )}
              </div>

              {/* BADGE PRESETS */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Card Badge Tag</label>
                <div className="flex flex-wrap gap-2">
                  {presetBadges.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData({ ...formData, badge: b })}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                        formData.badge === b
                          ? 'bg-[#E85D3D] text-white border-[#E85D3D]'
                          : 'bg-[#121218] text-gray-400 border-[#282834] hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACCENT COLOR PRESETS */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Accent Color Theme</label>
                <div className="flex items-center gap-2">
                  {presetAccents.map((c) => (
                    <div
                      key={c}
                      onClick={() => setFormData({ ...formData, accent: c })}
                      className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${
                        formData.accent === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ background: c }}
                    >
                      {formData.accent === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  ))}
                  <input
                    type="color"
                    value={formData.accent}
                    onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              {/* EMOJI / ICON PRESETS */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Floating Icon / Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {presetIcons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className={`w-9 h-9 text-lg rounded-xl border flex items-center justify-center transition-all ${
                        formData.icon === ic
                          ? 'bg-[#1E1E28] border-[#E85D3D] scale-110'
                          : 'bg-[#121218] border-[#282834] hover:border-gray-500'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* DISPLAY ORDER & ACTIVE TOGGLE */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Display Priority Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-full mt-1 p-3 rounded-xl text-xs font-extrabold border transition-all ${
                      formData.isActive
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                    }`}
                  >
                    {formData.isActive ? '🟢 Active on Storefront' : '🔴 Hidden / Inactive'}
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex gap-3 pt-4 border-t border-[#282834]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-[#22222D] hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-flame-glow hover:shadow-flame-intense transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingClan ? 'Update Clan' : 'Create Clan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClanManagement;
