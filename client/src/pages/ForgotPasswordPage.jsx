import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await authService.forgotPassword(email.trim());
      setMessage(result.message || 'If an account exists, a reset link will be sent.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to request a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#18181F] border border-[#282834] rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Reset your password</h1>
          <p className="text-sm text-gray-400 mt-2">Enter your account email and we’ll send a reset link if it matches an account.</p>
        </div>

        {(message || error) && (
          <div role={error ? 'alert' : 'status'} className={`p-3 rounded-xl text-sm ${error ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'}`}>
            {error || message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="reset-email" className="block text-xs font-bold uppercase text-gray-400">Email address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input id="reset-email" name="email" type="email" autoComplete="email" required maxLength={254}
              value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"
              className="w-full bg-[#121218] border border-[#282834] rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#D9480F] to-[#FF7A00] rounded-xl text-white font-bold disabled:opacity-60">
            {loading ? 'SENDING…' : 'SEND RESET LINK'}
          </button>
        </form>

        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#E85D3D] hover:text-[#FF7A00]">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
