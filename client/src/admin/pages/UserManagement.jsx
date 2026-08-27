import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { Users, Shield, UserCheck, Search, Flame, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('success'); // 'success' or 'error'

  const loadUsers = () => {
    setLoading(true);
    adminService.getAllUsers()
      .then(res => {
        if (res.success) {
          setUsersList(res.users || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        showMsg('Failed to load users from database', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(null), 3500);
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        showMsg(res.message || `Role updated to ${newRole}`);
        loadUsers(); // Refresh from DB
      }
    } catch (err) {
      showMsg(err.message || 'Failed to update role', 'error');
    }
  };

  const filtered = usersList.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = usersList.filter(u => u.role === 'admin').length;
  const userCount = usersList.filter(u => u.role === 'user').length;

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

        {/* Quick stats */}
        <div className="flex gap-4">
          <div className="bg-[#18181F] border border-[#282834] rounded-2xl px-4 py-2 text-center">
            <p className="text-lg font-black text-white">{usersList.length}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Users</p>
          </div>
          <div className="bg-[#18181F] border border-[#282834] rounded-2xl px-4 py-2 text-center">
            <p className="text-lg font-black text-[#E85D3D]">{adminCount}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Admins</p>
          </div>
          <div className="bg-[#18181F] border border-[#282834] rounded-2xl px-4 py-2 text-center">
            <p className="text-lg font-black text-emerald-400">{userCount}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Members</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold border ${
          msgType === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {msg}
        </div>
      )}

      <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-4">
        <div className="relative w-full md:w-80">
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
        <h3 className="text-lg font-extrabold text-white">
          Registered Flame Members ({filtered.length})
        </h3>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading users from database...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No users found</div>
        ) : (
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
                    <td className="p-4 font-mono text-gray-400">{u.phone || '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                        u.role === 'admin'
                          ? 'bg-[#E85D3D]/20 text-[#E85D3D] border-[#E85D3D]/40'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {u.role === 'admin' ? '🔥 Admin' : 'Flame Member'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleUserRole(u._id, u.role)}
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
        )}
      </div>

    </div>
  );
};

export default UserManagement;
