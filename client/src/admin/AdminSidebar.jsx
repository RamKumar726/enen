import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sliders, 
  ShoppingBag, 
  Users, 
  Flame, 
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Carousel Banners', path: '/admin/carousel', icon: Sliders, badge: 'Deals' },
    { name: 'Choose Your Clan', path: '/admin/clans', icon: Flame, badge: 'Vaults' },
    { name: 'Product Management', path: '/admin/products', icon: ShoppingBag },
    { name: 'User Accounts', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#121218] border-r border-[#282834] flex flex-col justify-between min-h-screen p-4 sticky top-0">
      <div className="space-y-6">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-[#282834] pb-4">
          <div className="w-9 h-9 flex items-center justify-center bg-[#1E1E26] rounded-xl border border-[#E85D3D]/50 shadow-flame-glow text-[#E85D3D]">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-flame-gradient leading-none">ENEN ADMIN</h2>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF7A00]">Control Center</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-3 text-xs font-bold rounded-2xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white shadow-flame-glow'
                    : 'text-gray-400 hover:text-white hover:bg-[#18181F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] uppercase font-black bg-[#FF7A00] text-black rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="space-y-2 pt-4 border-t border-[#282834]">
        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-[#18181F] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#E85D3D]" /> Return to Storefront
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
