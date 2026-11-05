import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Flame, CheckCircle } from "lucide-react";
import { authService } from "../services/api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 12) return setError("Password must be at least 12 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await authService.resetPassword(token, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Invalid or expired reset link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "radial-gradient(ellipse at top, #1a0a00 0%, #0F0F12 60%)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-4xl font-black text-white tracking-tighter">EN<span className="text-[#E85D3D]">EN</span></div>
            <p className="text-[10px] text-[#FF7A00] font-bold tracking-[4px] uppercase mt-1">Unleash the Blaze</p>
          </Link>
        </div>
        <div className="bg-[#18181F] border border-[#282834] rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white">Password Reset!</h2>
              <p className="text-sm text-gray-400">Redirecting you to login in a moment...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#E85D3D]/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#E85D3D]" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white">Reset Password</h1>
                  <p className="text-xs text-gray-400">Enter your new password below</p>
                </div>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password}
                      minLength={12} maxLength={72} onChange={(e) => setPassword(e.target.value)} placeholder="At least 12 characters"
                      className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E85D3D] pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-400">Confirm New Password</label>
                  <input type={showPassword ? "text" : "password"} required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
                    className="w-full bg-[#121218] border border-[#282834] rounded-xl p-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E85D3D]" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D9480F] via-[#E85D3D] to-[#FF7A00] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
                  <Flame className="w-4 h-4" />
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
              <p className="text-center text-xs text-gray-500 mt-4">
                Remember your password?{" "}
                <Link to="/login" className="text-[#E85D3D] hover:text-[#FF7A00] font-bold">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
