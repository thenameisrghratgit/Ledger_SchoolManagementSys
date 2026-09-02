/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1C3A28',
          deep: '#122618',
        },
        gold: {
          DEFAULT: '#C4622D',
          muted: '#B3581F',
          50: '#FDF3EC',
          100: '#F9E2CC',
          200: '#F2C49A',
          300: '#E89F66',
          400: '#C4622D',
          500: '#A84E1E',
          600: '#863C14',
        },
        surface: {
          DEFAULT: '#F4EFE8',
          card: '#FAF7F2',
        },
        text: {
          DEFAULT: '#1A1A16',
          secondary: '#6B6558',
        },
        border: {
          DEFAULT: '#DDD6CB',
        },
        ink: {
          DEFAULT: '#1C3A28',
          50: '#F0F5F2',
          100: '#D9EBE0',
          200: '#A8D0B8',
          300: '#6FAE8A',
          400: '#3D7E5C',
          500: '#2A5C40',
          600: '#1C3A28',
          700: '#152D1F',
          800: '#0F2118',
          900: '#091510',
          950: '#040C09',
        },
        royal: {
          DEFAULT: '#1C3A28',
          50: '#F0F5F2',
          100: '#D9EBE0',
          200: '#A8D0B8',
          300: '#6FAE8A',
          400: '#3D7E5C',
          500: '#2A5C40',
          600: '#1C3A28',
          700: '#152D1F',
          800: '#0F2118',
          900: '#091510',
        },
        amber: {
          DEFAULT: '#C4622D',
          50: '#FDF3EC',
          100: '#F9E2CC',
          200: '#F2C49A',
          300: '#E89F66',
          400: '#D07A42',
          500: '#C4622D',
          600: '#A84E1E',
        },
        slate: {
          450: '#7A7065',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(28, 58, 40, 0.06), 0 4px 12px rgba(28, 58, 40, 0.04)',
        'card-hover': '0 1px 3px rgba(28, 58, 40, 0.08), 0 8px 20px rgba(28, 58, 40, 0.08)',
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
