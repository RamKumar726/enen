import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    const result = await login({ email, password });
    setLoading(false);
    if (result.type === 'auth/login/fulfilled') {
      const userRole = result.payload?.user?.role;
      navigate(userRole === 'admin' ? '/admin' : from, { replace: true });
    }
  };

  const fieldCls = (field) => `w-full bg-[#F4F1EA] dark:bg-[#0D0D11] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[#1C1C1C] dark:text-white placeholder-[#A8A8A8] dark:placeholder-gray-600 focus:outline-none`;
  const wrapCls = (field) => `relative rounded-2xl border transition-all duration-300 ${focused === field ? 'border-[#E85D3D]/60 shadow-[0_0_12px_rgba(232,93,61,0.15)]' : 'border-[#DDD9D0] dark:border-[#1E1E28]'}`;
  const iconCls = (field) => `w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === field ? 'text-[#E85D3D]' : 'text-[#A8A8A8] dark:text-gray-600'}`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E85D3D]/5 dark:bg-[#E85D3D]/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF7A00]/4 dark:bg-[#FF7A00]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md">
        <div className="bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-3xl p-8 shadow-card dark:shadow-2xl space-y-7">

          <div className="text-center space-y-3">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 bg-[#E85D3D]/10 dark:bg-[#E85D3D]/20 border border-[#E85D3D]/40 rounded-2xl flex items-center justify-center mx-auto shadow-flame-glow">
              <Flame className="w-7 h-7 text-[#E85D3D] animate-flame-pulse" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black text-[#1C1C1C] dark:text-white">
                IGNITE YOUR <span className="text-flame-gradient">ACCOUNT</span>
              </h1>
              <p className="text-xs text-[#7A7A7A] dark:text-gray-500 mt-1">Welcome back to ENEN — Unleash the blaze</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A7A] dark:text-gray-500">Email Address</label>
              <div className={wrapCls('email')}>
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  className={fieldCls('email')} />
                <Mail className={iconCls('email')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A7A] dark:text-gray-500">Password</label>
                <a href="#" className="text-[10px] text-[#E85D3D] hover:text-[#FF7A00] transition-colors font-semibold">Forgot?</a>
              </div>
              <div className={wrapCls('password')}>
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className={`${fieldCls('password')} pr-11`} />
                <Lock className={iconCls('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A8A8] dark:text-gray-500 hover:text-[#4A4A4A] dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-extrabold text-sm rounded-2xl shadow-flame-glow hover:shadow-flame-intense transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Authenticating...</>
                : <><Flame className="w-4 h-4" /> Ignite Login <ArrowRight className="w-4 h-4" /></>
              }
            </motion.button>
          </form>

          <div className="pt-2 border-t border-[#EAE6DD] dark:border-[#1E1E28] text-center space-y-3">
            <p className="text-xs text-[#7A7A7A] dark:text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#E85D3D] font-bold hover:text-[#FF7A00] transition-colors">Create Account</Link>
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-[#A8A8A8] dark:text-gray-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit Encrypted JWT Authentication</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
