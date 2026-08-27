import React from 'react';
import { motion } from 'framer-motion';

const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="bg-white dark:bg-[#111116] border border-[#EAE6DD] dark:border-[#1E1E28] rounded-2xl sm:rounded-3xl overflow-hidden"
  >
    {/* Image skeleton */}
    <div className="relative bg-[#F4F1EA] dark:bg-[#0D0D11] animate-pulse" style={{ aspectRatio: '1 / 1.1' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
    </div>
    {/* Content skeleton */}
    <div className="p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 bg-[#F0EDE8] dark:bg-[#1A1A22] rounded animate-pulse" />
        <div className="h-2 w-8 bg-[#F0EDE8] dark:bg-[#1A1A22] rounded animate-pulse" />
      </div>
      <div className="h-3 w-full bg-[#F0EDE8] dark:bg-[#1A1A22] rounded animate-pulse" />
      <div className="h-3 w-4/5 bg-[#F0EDE8] dark:bg-[#1A1A22] rounded animate-pulse" />
      <div className="flex gap-1 pt-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-6 h-6 bg-[#F0EDE8] dark:bg-[#1A1A22] rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-[#EAE6DD] dark:border-[#1E1E28]">
        <div className="h-5 w-14 bg-[#F0EDE8] dark:bg-[#1A1A22] rounded animate-pulse" />
        <div className="h-7 w-14 bg-[#E85D3D]/20 rounded-xl animate-pulse" />
      </div>
    </div>
  </motion.div>
);

const ProductSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
    {[...Array(count)].map((_, i) => <SkeletonCard key={i} index={i} />)}
  </div>
);

export default ProductSkeleton;
