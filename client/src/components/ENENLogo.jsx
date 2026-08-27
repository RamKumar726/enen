import React from 'react';

/**
 * ENEN Twin Flame SVG Logo Component
 * Dark variant (for navbar / dark backgrounds)
 * Light variant available via `variant` prop
 */
const ENENLogo = ({
  variant = 'dark',        // 'dark' | 'light'
  size = 'md',             // 'sm' | 'md' | 'lg' | 'xl'
  showTagline = true,
  showText = true,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) => {
  const sizes = {
    sm:  { flame: 28, text: 14, tagline: 7  },
    md:  { flame: 36, text: 18, tagline: 8  },
    lg:  { flame: 52, text: 26, tagline: 10 },
    xl:  { flame: 72, text: 36, tagline: 13 },
  };

  const s = sizes[size] || sizes.md;
  const textColor = variant === 'dark' ? '#F0EDE8' : '#1C1C1C';
  const taglineColor = '#E85D3D';

  // Twin Flame SVG — two separate flame paths
  const TwinFlames = ({ h }) => {
    const w = h * 1.18; // aspect ratio of the twin flame group
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 120 102"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* LEFT FLAME — solid orange-red */}
        <path
          d="M38 96 C16 96 4 80 4 62 C4 44 14 32 22 22 C22 22 20 36 28 42 C28 28 36 14 46 4 C46 4 40 24 50 32 C56 36 60 44 58 56 C62 48 62 38 58 28 C68 38 72 52 68 66 C66 76 58 86 48 92 C44 94 41 96 38 96 Z"
          fill="url(#leftFlame)"
        />
        {/* LEFT FLAME — inner dark curl */}
        <path
          d="M46 96 C46 96 52 84 46 76 C42 70 46 62 52 62 C48 70 50 80 56 86 C52 90 48 94 46 96 Z"
          fill="#2C1810"
          opacity="0.35"
        />

        {/* RIGHT FLAME — orange to yellow gradient */}
        <path
          d="M82 96 C60 96 48 80 48 62 C48 44 58 32 66 22 C66 22 64 36 72 42 C72 28 80 14 90 4 C90 4 84 24 94 32 C100 36 104 44 102 56 C106 48 106 38 102 28 C112 38 116 52 112 66 C110 76 102 86 92 92 C88 94 85 96 82 96 Z"
          fill="url(#rightFlame)"
        />
        {/* RIGHT FLAME — inner dark curl */}
        <path
          d="M90 96 C90 96 96 84 90 76 C86 70 90 62 96 62 C92 70 94 80 100 86 C96 90 92 94 90 96 Z"
          fill="#2C1810"
          opacity="0.30"
        />

        <defs>
          <linearGradient id="leftFlame" x1="35" y1="4" x2="35" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="55%" stopColor="#E85D3D" />
            <stop offset="100%" stopColor="#D9480F" />
          </linearGradient>
          <linearGradient id="rightFlame" x1="80" y1="4" x2="80" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFD166" />
            <stop offset="40%" stopColor="#FF9A00" />
            <stop offset="100%" stopColor="#E85D3D" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  if (orientation === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <TwinFlames h={s.flame} />
        {showText && (
          <div className="flex flex-col leading-none">
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: s.text,
                fontWeight: 900,
                letterSpacing: '0.18em',
                color: textColor,
                lineHeight: 1,
              }}
            >
              ENEN
            </span>
            {showTagline && (
              <span
                style={{
                  fontSize: s.tagline,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: taglineColor,
                  marginTop: 4,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                UNLEASH THE BLAZE
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Vertical / stacked layout (for footer or standalone)
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <TwinFlames h={s.flame} />
      {showText && (
        <div className="flex flex-col items-center">
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: s.text,
              fontWeight: 900,
              letterSpacing: '0.25em',
              color: textColor,
              lineHeight: 1,
            }}
          >
            ENEN
          </span>
          {showTagline && (
            <>
              {/* Separator line */}
              <div
                style={{
                  width: s.text * 3.5,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${taglineColor}, transparent)`,
                  margin: '6px 0',
                }}
              />
              <span
                style={{
                  fontSize: s.tagline,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: taglineColor,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                UNLEASH THE BLAZE
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ENENLogo;
