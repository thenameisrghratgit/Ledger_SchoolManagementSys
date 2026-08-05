/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1B33',
          50: '#F4F6FA',
          100: '#E4E9F3',
          200: '#C3CEE3',
          300: '#96A7CA',
          400: '#5E739F',
          500: '#3A4E76',
          600: '#26375A',
          700: '#1B2A47',
          800: '#141F37',
          900: '#0F1B33',
          950: '#090F1D',
        },
        royal: {
          DEFAULT: '#2955A3',
          50: '#EEF3FC',
          100: '#DCE7F8',
          200: '#B3CBEE',
          300: '#82A9E1',
          400: '#5486D4',
          500: '#2955A3',
          600: '#204480',
          700: '#1A3766',
          800: '#152B4F',
          900: '#101F3A',
        },
        gold: {
          DEFAULT: '#C89A4B',
          50: '#FBF6EC',
          100: '#F5E9CE',
          200: '#EBD49E',
          300: '#DDBB6E',
          400: '#C89A4B',
          500: '#AD7F35',
          600: '#8A6329',
        },
        slate: {
          450: '#6B7688',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,51,0.04), 0 12px 32px -12px rgba(15,27,51,0.18)',
        'card-hover': '0 1px 2px rgba(15,27,51,0.06), 0 20px 40px -16px rgba(15,27,51,0.28)',
        glow: '0 0 0 1px rgba(200,154,75,0.4), 0 8px 24px -8px rgba(200,154,75,0.35)',
      },
      backgroundImage: {
        'seal-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-14px) translateX(6px)' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(10px) translateX(-8px)' },
        },
      },
      animation: {
        drift: 'drift 7s ease-in-out infinite',
        'drift-slow': 'driftSlow 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
