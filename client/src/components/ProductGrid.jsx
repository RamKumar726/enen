import React from 'react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { Flame } from 'lucide-react';

const ProductGrid = ({ products = [], loading = false, title, subtitle }) => {
  if (loading) {
    return <ProductSkeleton count={8} />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-[#18181F] border border-[#282834] rounded-3xl space-y-4">
        <div className="w-14 h-14 bg-[#22222D] text-[#E85D3D] rounded-2xl flex items-center justify-center mx-auto">
          <Flame className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white">No Anime Drop Found</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Try adjusting your price range, category filters, or search terms to uncover fresh ENEN flame tees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#282834] pb-4">
          <div>
            {subtitle && <span className="text-xs uppercase font-extrabold text-[#E85D3D] tracking-widest block mb-1">{subtitle}</span>}
            {title && <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>}
          </div>
          <span className="text-xs font-semibold text-gray-400 mt-2 sm:mt-0">
            Showing <strong className="text-white">{products.length}</strong> Products
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id || product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
