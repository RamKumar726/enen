import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Carousel from '../components/Carousel';
import ProductGrid from '../components/ProductGrid';
import Collections from '../components/Collections';
import { fetchProducts } from '../redux/slices/productSlice';
import { Flame, ArrowRight, Sparkles, Shield, Truck, RefreshCw } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
  }, [dispatch]);

  const featuredProducts = items.slice(0, 8);

  return (
    <div className="space-y-12 pb-16">
      {/* PROMOTIONAL HERO CAROUSEL */}
      <Carousel />

      {/* ANIME COLLECTIONS CATEGORY SHOWCASE */}
      <Collections />

      {/* FEATURED DROPS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#282834] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#E85D3D] uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-[#FF7A00]" />
              <span>HANDPICKED ANIME DROPS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              HOTTEST <span className="text-flame-gradient">ENEN RELEASES</span>
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E85D3D] hover:text-[#FF7A00] transition-colors mt-2 sm:mt-0"
          >
            <span>VIEW ALL DROPS ({items.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* FABRIC & QUALITY HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#181820] via-[#1F1F2B] to-[#181820] border border-[#E85D3D]/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E85D3D]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-[#E85D3D]/20 text-[#E85D3D] text-xs font-extrabold uppercase tracking-wider rounded-lg inline-block">
                The ENEN Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                BUILT WITH <span className="text-flame-gradient">240 GSM HEAVYWEIGHT</span> COTTON
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                We reject paper-thin shirts. Every ENEN piece features thick 240 GSM Terry combed cotton, reinforced collar ribs, drop-shoulder streetwear fit, and non-cracking high-density puff prints.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
                  <h4 className="font-extrabold text-white text-base">240 GSM Terry</h4>
                  <p className="text-xs text-gray-400">Ultra heavyweight durable fabric</p>
                </div>
                <div className="p-4 bg-[#121218] border border-[#282834] rounded-2xl">
                  <h4 className="font-extrabold text-[#FF7A00] text-base">3D Puff Print</h4>
                  <p className="text-xs text-gray-400">Tactile high-density graphics</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#E85D3D]/40 shadow-flame-glow">
                <img
                  src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                  alt="Fabric Texture Detail"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ENEN TRUST BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 bg-[#18181F] border border-[#282834] rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#E85D3D]/20 text-[#E85D3D] rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Shipping</h4>
              <p className="text-xs text-gray-400">Free delivery on orders over $50</p>
            </div>
          </div>

          <div className="p-6 bg-[#18181F] border border-[#282834] rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#FF7A00]/20 text-[#FF7A00] rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Razorpay Secure</h4>
              <p className="text-xs text-gray-400">100% Encrypted transactions</p>
            </div>
          </div>

          <div className="p-6 bg-[#18181F] border border-[#282834] rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">7-Day Exchanges</h4>
              <p className="text-xs text-gray-400">Hassle-free size swaps</p>
            </div>
          </div>

          <div className="p-6 bg-[#18181F] border border-[#282834] rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Flame Certified</h4>
              <p className="text-xs text-gray-400">Original ENEN prints</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
