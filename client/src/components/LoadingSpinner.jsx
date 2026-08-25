import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', text = 'IGNITING BLAZE...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-20 h-20 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size] || sizeClasses.medium} border-t-[#E85D3D] border-r-[#FF7A00] border-b-transparent border-l-transparent rounded-full`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 bg-[#FF7A00] rounded-full animate-ping" />
        </div>
      </div>
      {text && (
        <p className="text-xs uppercase tracking-widest text-[#E85D3D] font-bold animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
