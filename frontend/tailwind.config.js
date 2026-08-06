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
      },
    },
  },
  plugins: [],
}