import React from 'react';

/**
 * ENEN Logo Component
 * Renders logo.jpg image with fallback and sizing options.
 */
const ENENLogo = ({
  variant = 'dark',        // kept for backward compatibility
  size = 'md',             // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  showText = true,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) => {
  const sizes = {
    sm: { img: 'h-8', text: 'text-sm', tagline: 'text-[9px]' },
    md: { img: 'h-10', text: 'text-base', tagline: 'text-[10px]' },
    lg: { img: 'h-14', text: 'text-xl', tagline: 'text-xs' },
    xl: { img: 'h-20', text: 'text-3xl', tagline: 'text-sm' },
  };

  const s = sizes[size] || sizes.md;
  const textColor = variant === 'dark' ? 'text-[#F0EDE8]' : 'text-[#1C1C1C]';

  return (
    <div className={`flex items-center gap-3 ${orientation === 'vertical' ? 'flex-col items-center text-center' : ''} ${className}`}>
      <img
        src="/logo.jpg"
        alt="ENEN Logo"
        className={`${s.img} w-auto object-contain rounded-md shadow-sm border border-[#E85D3D]/20`}
      />
      {showText && (
        <div className={`flex flex-col ${orientation === 'vertical' ? 'items-center' : 'items-start'} leading-none`}>
          <span
            className={`font-black tracking-[0.18em] ${s.text} ${textColor}`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            ENEN
          </span>
          {showTagline && (
            <span
              className={`font-bold tracking-[0.2em] text-[#E85D3D] mt-1 ${s.tagline}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              UNLEASH THE BLAZE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ENENLogo;

