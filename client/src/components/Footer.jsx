import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Mail, ArrowRight, Instagram, Twitter, Youtube, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#0A0A0D] border-t border-[#282834] text-gray-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* BRAND COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-[#1E1E26] rounded-xl border border-[#E85D3D]/40 shadow-flame-glow">
              <Flame className="w-5 h-5 text-[#E85D3D]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-wider text-flame-gradient leading-none">
                ENEN
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#FF7A00]/80">
                UNLEASH THE BLAZE
              </span>
            </div>
          </Link>

          <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
            ENEN is an elite anime streetwear brand crafting 240 GSM heavyweight oversized printed tees. Ignited for passionate otaku, gamers, and anime fans worldwide.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2.5 bg-[#18181F] border border-[#282834] hover:border-[#E85D3D] text-gray-300 hover:text-white rounded-xl transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 bg-[#18181F] border border-[#282834] hover:border-[#E85D3D] text-gray-300 hover:text-white rounded-xl transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 bg-[#18181F] border border-[#282834] hover:border-[#E85D3D] text-gray-300 hover:text-white rounded-xl transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/shop" className="hover:text-[#E85D3D] transition-colors">Shop All Drops</Link></li>
            <li><Link to="/shop?category=Anime+Classics" className="hover:text-[#E85D3D] transition-colors">Anime Classics</Link></li>
            <li><Link to="/shop?category=Trending" className="hover:text-[#E85D3D] transition-colors">Trending Shonen</Link></li>
            <li><Link to="/shop?category=Custom" className="hover:text-[#E85D3D] transition-colors">Custom Streetwear</Link></li>
            <li><Link to="/cart" className="hover:text-[#E85D3D] transition-colors">View Cart</Link></li>
          </ul>
        </div>

        {/* CUSTOMER SUPPORT */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/orders" className="hover:text-[#E85D3D] transition-colors">Order Tracking</Link></li>
            <li><Link to="/profile" className="hover:text-[#E85D3D] transition-colors">Saved Addresses</Link></li>
            <li><a href="#" className="hover:text-[#E85D3D] transition-colors">Size Guide & Fabric Info</a></li>
            <li><a href="#" className="hover:text-[#E85D3D] transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-[#E85D3D] transition-colors">Contact Support</a></li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Join The Flame Order</h4>
          <p className="text-xs text-gray-400">
            Get 10% off your first drop with promo code <strong className="text-[#FF7A00]">BLAZE10</strong>.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#18181F] border border-[#282834] rounded-xl py-2.5 pl-9 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E85D3D]"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 bg-[#E85D3D] hover:bg-[#FF7A00] text-white rounded-lg transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && (
              <p className="text-[11px] text-emerald-400 font-bold">🔥 Welcome to the Flame Order! Check your inbox.</p>
            )}
          </form>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#1E1E28] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>© {new Date().getFullYear()} ENEN Apparel Co. All rights reserved. UNLEASH THE BLAZE.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Razorpay Verified</span>
          <span>•</span>
          <span>100% Secure Checkout</span>
          <span>•</span>
          <span>Express Delivery</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
