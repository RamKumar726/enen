import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CursorGlow — premium cursor follower with spring physics.
 * Only renders on non-touch desktop screens.
 */
const CursorGlow = () => {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [x, y]);

  /* Don't render on touch devices */
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9998] mix-blend-normal"
      style={{
        left: springX,
        top: springY,
        x: '-50%',
        y: '-50%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232, 93, 61, 0.055) 0%, transparent 70%)',
        filter: 'blur(4px)',
      }}
    />
  );
};

export default CursorGlow;
