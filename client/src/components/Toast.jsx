import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Toast = () => {
  const { toastMessage, clearToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#18181F]/95 backdrop-blur-xl border border-[#E85D3D]/50 px-5 py-3.5 rounded-2xl shadow-flame-glow text-[#F5F1EB]"
        >
          <div className="p-2 bg-[#E85D3D]/20 text-[#E85D3D] rounded-xl flex items-center justify-center">
            <Flame className="w-5 h-5 animate-bounce" />
          </div>
          <span className="font-medium text-sm pr-2">{toastMessage}</span>
          <button 
            onClick={clearToast}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
