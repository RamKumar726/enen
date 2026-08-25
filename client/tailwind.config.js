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
          darkBg: '#0F0F12',
          cardBg: '#18181F',
          cardBorder: '#282834',
          cream: '#F5F1EB',
          mutedText: '#9A9A9E'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Outfit', 'sans-serif'],
        japanese: ['Shippori Mincho', 'serif']
      },
      boxShadow: {
        'flame-glow': '0 0 25px rgba(232, 93, 61, 0.45)',
        'flame-intense': '0 0 35px rgba(255, 122, 0, 0.65)',
        'card-hover': '0 10px 30px -10px rgba(0, 0, 0, 0.7)'
      },
      animation: {
        'flame-pulse': 'flamePulse 3s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'glow-spin': 'glowSpin 8s linear infinite'
      },
      keyframes: {
        flamePulse: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(232, 93, 61, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 25px rgba(255, 122, 0, 0.8))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glowSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
