import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { Flame } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, title, subtitle }) => {
  if (loading) {
    return <ProductSkeleton count={6} />;
  }

  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-14 px-4 bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-3xl space-y-3"
      >
        <div className="w-12 h-12 bg-[#E85D3D]/10 border border-[#E85D3D]/25 rounded-2xl flex items-center justify-center mx-auto">
          <Flame className="w-6 h-6 text-[#E85D3D] animate-pulse" />
        </div>
        <h3 className="text-lg font-black text-[#1C1C1C] dark:text-white">No Drops Found</h3>
        <p className="text-xs text-[#7A7A7A] dark:text-[#888890] max-w-xs mx-auto">
          Try adjusting your filters or search to find ENEN tees.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[#EAE6DD] dark:border-[#1E1E28]">
          <div>
            {subtitle && <span className="text-[10px] uppercase font-extrabold text-[#E85D3D] tracking-widest block mb-1">{subtitle}</span>}
            {title && <h2 className="text-xl sm:text-2xl font-black text-[#1C1C1C] dark:text-white">{title}</h2>}
          </div>
          <span className="text-xs font-semibold text-[#7A7A7A] dark:text-[#888890] mt-1 sm:mt-0">
            {products.length} items
          </span>
        </div>
      )}

      {/* ── 2 cols on mobile, 3 on md, 4 on xl ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product, i) => (
          <motion.div
            key={product._id || product.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease: [0.4, 0, 0.2, 1] }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
