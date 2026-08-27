import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ArrowUp, Flame } from 'lucide-react';

/**
 * ScrollTop — premium scroll-to-top button with scroll progress ring.
 * Appears after user scrolls 400px, shows orange progress arc.
 */
const ScrollTop = () => {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => setVisible(v > 0.08));
    return unsub;
  }, [scrollYProgress]);

  const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="fixed bottom-8 right-6 z-50 group"
          aria-label="Scroll to top"
        >
          <div className="relative w-12 h-12">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C94A20] to-[#FF7A00] shadow-flame-glow" />

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
              <motion.circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                style={{ pathLength: progress }}
              />
            </svg>

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollTop;
