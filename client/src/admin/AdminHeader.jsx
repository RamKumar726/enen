import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Bell, User, ShieldCheck } from 'lucide-react';

const AdminHeader = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-[#121218] border-b border-[#282834] px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#E85D3D]" /> {title}
        </h1>
        <p className="text-xs text-gray-400">ENEN E-Commerce Administrative System</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white bg-[#18181F] border border-[#282834] rounded-xl relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-[#E85D3D] rounded-full absolute top-1.5 right-1.5 animate-ping" />
        </button>

        <div className="flex items-center gap-3 p-1.5 pl-3 bg-[#18181F] border border-[#282834] rounded-xl">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt="Admin Avatar"
            className="w-7 h-7 rounded-lg object-cover border border-[#E85D3D]"
          />
          <div className="text-left hidden sm:block">
            <p className="text-xs font-extrabold text-white leading-none">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
            <span className="text-[9px] font-bold text-[#E85D3D] uppercase">System Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
