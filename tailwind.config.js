/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#172A46',
          deep: '#0F1D33',
        },
        gold: {
          DEFAULT: '#C6A15B',
          muted: '#B8944F',
          50: '#FBF6EC',
          100: '#F5E9CE',
          200: '#EBD49E',
          300: '#DDBB6E',
          400: '#C6A15B',
          500: '#AD7F35',
          600: '#8A6329',
        },
        surface: {
          DEFAULT: '#F7F8FA',
          card: '#FAFBFC',
        },
        text: {
          DEFAULT: '#172033',
          secondary: '#6B7280',
        },
        border: {
          DEFAULT: '#E3E7ED',
        },
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
        slate: {
          450: '#6B7688',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(23, 42, 70, 0.06), 0 4px 12px rgba(23, 42, 70, 0.04)',
        'card-hover': '0 1px 3px rgba(23, 42, 70, 0.08), 0 8px 20px rgba(23, 42, 70, 0.08)',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '10px',
      },
    },
  },
  plugins: [],
}
