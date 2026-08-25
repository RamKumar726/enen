import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    const result = await login({ email, password });
    setLoading(false);

    if (result.type === 'auth/login/fulfilled') {
      const userRole = result.payload?.user?.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#18181F] border border-[#E85D3D]/40 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#1E1E26] border border-[#E85D3D]/40 rounded-2xl flex items-center justify-center mx-auto shadow-flame-glow text-[#E85D3D]">
            <Flame className="w-7 h-7 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">IGNITE YOUR <span className="text-flame-gradient">ACCOUNT</span></h1>
          <p className="text-xs text-gray-400">Welcome back to ENEN — Unleash the blaze</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@enen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400">
              <label className="uppercase">Password</label>
              <a href="#" className="text-[#E85D3D] hover:underline text-[11px]">Forgot Password?</a>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121218] border border-[#282834] rounded-xl py-3 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-xl shadow-flame-glow flex items-center justify-center gap-2 hover:shadow-flame-intense transition-all"
          >
            {loading ? 'AUTHENTICATING...' : 'IGNITE LOGIN'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#282834] text-center space-y-2">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#E85D3D] font-bold hover:underline">
              Register Account
            </Link>
          </p>

          <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit Encrypted JWT Secure Authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
