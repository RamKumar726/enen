import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { DollarSign, ShoppingBag, PackageCheck, Sliders, ArrowUpRight, Flame, Plus, Clock } from 'lucide-react';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalRevenue: 14850.00,
    totalOrders: 42,
    totalProducts: 18,
    activeBanners: 5
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(res => {
        if (res.success) {
          setStats(res.stats || stats);
          setRecentOrders(res.recentOrders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    { name: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-[#D9480F] to-[#E85D3D]', badge: '+18.4% this month' },
    { name: 'Total Orders', value: stats.totalOrders, icon: PackageCheck, color: 'from-[#E85D3D] to-[#FF7A00]', badge: '+12 new today' },
    { name: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'from-[#FF7A00] to-[#FFC107]', badge: '18 Anime Drops' },
    { name: 'Active Hero Banners', value: stats.activeBanners, icon: Sliders, color: 'from-[#3B82F6] to-[#8B5CF6]', badge: 'Homepage Carousel' }
  ];

  return (
    <div className="space-y-8">
      
      {/* ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18181F] border border-[#282834] p-6 rounded-3xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Welcome to <span className="text-flame-gradient">ENEN Command Center</span>
          </h2>
          <p className="text-xs text-gray-400">Manage promotional carousel banners, products, orders, and sales metrics.</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* RECENT ORDERS TABLE */}
      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#282834] pb-4">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E85D3D]" /> Recent Order Activity
          </h3>
          <Link to="/admin/orders" className="text-xs font-bold text-[#E85D3D] hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Products</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282834]">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-[#22222D]">
                  <td className="p-3 font-mono font-bold text-white">{ord._id}</td>
                  <td className="p-3">
                    <p className="font-bold text-gray-200">{ord.userId?.firstName || 'Customer'} {ord.userId?.lastName || ''}</p>
                    <p className="text-[10px] text-gray-500">{ord.userId?.email || 'customer@enen.com'}</p>
                  </td>
                  <td className="p-3 text-gray-300">
                    {ord.products?.map(p => p.name).join(', ') || 'ENEN Anime Tee'}
                  </td>
                  <td className="p-3 font-extrabold text-[#E85D3D]">
                    ${(ord.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {ord.orderStatus || 'Processing'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">
                    {new Date(ord.createdAt || Date.now()).toLocaleDateString()}
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

export default AdminHome;
