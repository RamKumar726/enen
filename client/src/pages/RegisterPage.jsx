import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [validationErr, setValidationErr] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErr(null);
    clearError();

    if (formData.password !== formData.confirmPassword) {
      setValidationErr('Passwords do not match');
      return;
    }

    if (formData.password.length < 12) {
      setValidationErr('Password must be at least 12 characters');
      return;
    }

    setLoading(true);
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    });
    setLoading(false);

    if (result.type === 'auth/register/fulfilled') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#18181F] border border-[#E85D3D]/40 rounded-3xl p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1E1E26] border border-[#E85D3D]/40 rounded-2xl flex items-center justify-center mx-auto shadow-flame-glow text-[#E85D3D]">
            <Flame className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">JOIN THE <span className="text-flame-gradient">FLAME ORDER</span></h1>
          <p className="text-xs text-gray-400">Create an account for early drop access and order tracking</p>
        </div>

        {(error || validationErr) && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs font-bold text-center">
            {validationErr || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="Rengoku"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="Kyojuro"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="flame@enen.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-xl shadow-flame-glow flex items-center justify-center gap-2 hover:shadow-flame-intense transition-all"
          >
            {loading ? 'REGISTERING...' : 'CREATE ACCOUNT'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#E85D3D] font-bold hover:underline">
            Sign In
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default RegisterPage;
