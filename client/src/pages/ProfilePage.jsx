import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { User, MapPin, PackageCheck, Plus, Trash2, Check, Flame, Shield, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [msg, setMsg] = useState(null);

  useEffect(() => {
    userService.getAddresses().then(res => {
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    }).catch(() => {});
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateProfile(profileForm);
      if (res.success) {
        setMsg('Profile updated successfully! 🔥');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      setMsg(err.message || 'Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.addAddress(newAddrForm);
      if (res.success) {
        setAddresses(res.addresses || []);
        setShowAddAddress(false);
        setNewAddrForm({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      }
    } catch (err) {}
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await userService.deleteAddress(id);
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="border-b border-[#282834] pb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4" />
            <span>MEMBER DASHBOARD</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            USER <span className="text-flame-gradient">PROFILE</span>
          </h1>
        </div>

        <Link
          to="/orders"
          className="px-4 py-2 bg-[#18181F] border border-[#282834] hover:border-[#E85D3D] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <PackageCheck className="w-4 h-4 text-[#FF7A00]" /> View Order History
        </Link>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EDIT USER DETAILS */}
        <div className="lg:col-span-5 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-4 border-b border-[#282834] pb-4">
            <img
              src={profileForm.profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E85D3D] shadow-flame-glow"
            />
            <div>
              <h3 className="font-extrabold text-white text-lg">{user?.firstName} {user?.lastName}</h3>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[9px] uppercase font-extrabold bg-[#E85D3D]/20 text-[#E85D3D] rounded">
                {user?.role === 'admin' ? '🔥 Admin' : 'Flame Member'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">First Name</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Last Name</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E85D3D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#D9480F] to-[#E85D3D] text-white font-bold text-xs rounded-xl shadow-flame-glow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ADDRESS BOOK MANAGER */}
        <div className="lg:col-span-7 bg-[#18181F] border border-[#282834] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#282834] pb-4">
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E85D3D]" /> Saved Address Book
            </h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-3 py-1.5 bg-[#22222D] hover:bg-[#E85D3D] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-[#282834]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          {/* ADD ADDRESS FORM */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-[#121218] border border-[#282834] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase">New Address Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newAddrForm.name}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, name: e.target.value })}
                  className="bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={newAddrForm.phone}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, phone: e.target.value })}
                  className="bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <input
                type="text"
                placeholder="Street Address"
                required
                value={newAddrForm.street}
                onChange={(e) => setNewAddrForm({ ...newAddrForm, street: e.target.value })}
                className="w-full bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
              />

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={newAddrForm.city}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, city: e.target.value })}
                  className="bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={newAddrForm.state}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, state: e.target.value })}
                  className="bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  required
                  value={newAddrForm.pincode}
                  onChange={(e) => setNewAddrForm({ ...newAddrForm, pincode: e.target.value })}
                  className="bg-[#18181F] border border-[#282834] rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#E85D3D] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save New Address
              </button>
            </form>
          )}

          {/* ADDRESS LIST */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400">No addresses saved yet.</p>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 bg-[#121218] border border-[#282834] rounded-2xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-[#E85D3D]/20 text-[#E85D3D] text-[9px] font-bold rounded uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-xs text-gray-500">Phone: {addr.phone}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
