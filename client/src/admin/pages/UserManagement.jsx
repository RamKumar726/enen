import React, { useState } from 'react';
import { Users, Shield, UserCheck, Search, Flame } from 'lucide-react';

const UserManagement = () => {
  const [usersList, setUsersList] = useState([
    { _id: 'u_101', firstName: 'ENEN', lastName: 'Admin', email: 'admin@enen.com', phone: '+91 9999988888', role: 'admin', createdAt: '2026-01-15' },
    { _id: 'u_102', firstName: 'Flame', lastName: 'Rider', email: 'demo@enen.com', phone: '+91 9876543210', role: 'user', createdAt: '2026-02-10' },
    { _id: 'u_103', firstName: 'Roronoa', lastName: 'Zoro', email: 'zoro@onepiece.com', phone: '+91 9811122233', role: 'user', createdAt: '2026-02-14' },
    { _id: 'u_104', firstName: 'Tanjiro', lastName: 'Kamado', email: 'tanjiro@demonslayer.com', phone: '+91 9844455566', role: 'user', createdAt: '2026-02-18' },
    { _id: 'u_105', firstName: 'Eren', lastName: 'Yeager', email: 'eren@aot.com', phone: '+91 9877788899', role: 'user', createdAt: '2026-02-20' }
  ]);

  const [search, setSearch] = useState('');

  const toggleUserRole = (id) => {
    setUsersList(usersList.map(u => {
      if (u._id === id) {
        return { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
      }
      return u;
    }));
  };

  const filtered = usersList.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.firstName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#282834] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Users className="w-4 h-4 text-[#FF7A00]" />
            <span>MEMBER ACCOUNTS MANAGEMENT</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            USER <span className="text-flame-gradient">MANAGEMENT</span>
          </h1>
        </div>
      </div>

      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-4">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121218] border border-[#282834] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
          />
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-lg font-extrabold text-white">Registered Flame Members ({filtered.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#121218] text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#282834]">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Account Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Toggle Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282834]">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-[#22222D]">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#E85D3D]" />
                    <span>{u.firstName} {u.lastName}</span>
                  </td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4 font-mono text-gray-400">{u.phone}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                      u.role === 'admin'
                        ? 'bg-[#E85D3D]/20 text-[#E85D3D] border-[#E85D3D]/40'
                        : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}>
                      {u.role === 'admin' ? '🔥 Admin' : 'Flame Member'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{u.createdAt}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserRole(u._id)}
                      className="px-3 py-1 bg-[#22222D] hover:bg-[#E85D3D] text-white text-[10px] font-bold rounded-xl border border-[#282834] transition-colors"
                    >
                      Set as {u.role === 'admin' ? 'Member' : 'Admin'}
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

export default UserManagement;
