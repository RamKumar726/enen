import React from 'react';

const ProductSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="bg-[#18181F] border border-[#282834] rounded-2xl overflow-hidden animate-pulse flex flex-col"
        >
          <div className="w-full h-72 bg-[#22222D]" />
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-1/3 h-4 bg-[#282834] rounded" />
              <div className="w-4/5 h-6 bg-[#2D2D3A] rounded" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="w-1/4 h-6 bg-[#E85D3D]/30 rounded" />
              <div className="w-24 h-9 bg-[#282834] rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
