/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#134E4A',
          50: '#E6F0EF',
          100: '#CCE1DF',
          200: '#99C3BF',
          600: '#1A6B65',
          700: '#134E4A',
          800: '#0D3B37',
          900: '#082825',
        },
        accent: {
          DEFAULT: '#D97706',
          50: '#FEF3E2',
          500: '#D97706',
          600: '#B45309',
        },
        surface: '#FAFAF9',
        glass: 'rgba(255,255,255,0.06)',
        ink: {
          DEFAULT: '#1C1917',
          muted: '#57534E',
          faint: '#A8A29E',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(24 24 27 / 0.05), 0 1px 3px 0 rgb(24 24 27 / 0.04)',
        glow: '0 0 24px 0 rgba(19,78,74,0.35)',
        'glow-accent': '0 0 20px 0 rgba(217,119,6,0.4)',
        glass: '0 8px 32px 0 rgba(0,0,0,0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #082825 0%, #0D3B37 55%, #1A6B65 100%)',
        'hero-radial': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,107,101,0.35) 0%, transparent 70%)',
        'accent-gradient': 'linear-gradient(135deg, #D97706 0%, #134E4A 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 60%)',
      },
      animation: {
        'slide-up': 'slide-up 0.55s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'count-up': 'count-up 0.6s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}