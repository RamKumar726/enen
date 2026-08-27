/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#E85D3D',
          darkOrange: '#D9480F',
          glow: '#FF7A00',
          fireRed: '#FF3D00',
          charcoal: '#2C2C2C',
          darkBg: '#0A0A0D',
          midBg: '#111116',
          cardBg: '#18181F',
          cardBorder: '#282834',
          cream: '#F5F1EB',
          mutedText: '#9A9A9E'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
        japanese: ['Shippori Mincho', 'serif']
      },
      boxShadow: {
        'flame-glow': '0 0 20px rgba(232, 93, 61, 0.35), 0 4px 20px rgba(0,0,0,0.4)',
        'flame-intense': '0 0 40px rgba(255, 122, 0, 0.55), 0 8px 30px rgba(0,0,0,0.5)',
        'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.7)',
        'glow-sm': '0 0 10px rgba(232, 93, 61, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(232, 93, 61, 0.08)',
      },
      animation: {
        'flame-pulse': 'flamePulse 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-spin': 'glowSpin 8s linear infinite',
        'shimmer': 'shimmerText 3s linear infinite',
        'fade-up': 'fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'border-glow': 'borderGlow 2.5s ease-in-out infinite',
        'ticker': 'ticker 28s linear infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'aurora': 'auroraDrift 12s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flamePulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(232, 93, 61, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 22px rgba(255, 122, 0, 0.75))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmerText: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        borderGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(232, 93, 61, 0.3)' },
          '50%': { boxShadow: '0 0 28px rgba(255, 122, 0, 0.55)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        auroraDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(5%, 8%) scale(1.15)' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'flame-gradient': 'linear-gradient(135deg, #D9480F 0%, #E85D3D 50%, #FF7A00 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0D 0%, #111116 100%)',
        'card-gradient': 'linear-gradient(145deg, #18181F 0%, #0F0F13 100%)',
        'glow-radial': 'radial-gradient(ellipse at center, rgba(232,93,61,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
