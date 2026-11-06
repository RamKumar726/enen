import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { ShoppingBag, Sliders, Users, ArrowUpRight, Flame, Plus } from 'lucide-react';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    activeBanners: 0
  });

  useEffect(() => {
    adminService.getDashboard()
      .then(res => {
        if (res.success) setStats(prev => ({ ...prev, ...res.stats }));
      })
      .catch(() => {});
  }, []);

  const kpiCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBag,
      color: 'from-[#FF7A00] to-[#FFC107]',
      badge: `${stats.totalProducts} Anime Drops`
    },
    {
      name: 'Registered Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-[#8B5CF6] to-[#A855F7]',
      badge: `${stats.totalUsers} flame members`
    },
    {
      name: 'Active Hero Banners',
      value: stats.activeBanners,
      icon: Sliders,
      color: 'from-[#3B82F6] to-[#8B5CF6]',
      badge: 'Homepage Carousel'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18181F] border border-[#282834] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Welcome to <span className="text-flame-gradient">ENEN Command Center</span>
          </h2>
          <p className="text-xs text-gray-400">Manage promotional banners, product listings, and user accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/carousel/new"
            className="px-4 py-2.5 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white text-xs font-extrabold rounded-xl shadow-flame-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Carousel Banner
          </Link>
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 bg-[#22222D] hover:bg-[#282834] text-white text-xs font-bold rounded-xl border border-[#282834] flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#FF7A00]" /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">{card.name}</span>
                <div className={`p-2.5 bg-gradient-to-r ${card.color} text-white rounded-2xl shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white">{card.value}</h3>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AdminHome;
