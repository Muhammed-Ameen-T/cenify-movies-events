/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#e6f1fe',
          100: '#cce3fd',
          200: '#99c8fb',
          300: '#66acf9',
          400: '#3391f7',
          500: '#0066F5',
          600: '#0052c4',
          700: '#003d93',
          800: '#002962',
          900: '#001431',
        },
        'dark': {
          50: '#e6e6e6',
          100: '#cccccc',
          200: '#999999',
          300: '#666666',
          400: '#333333',
          500: '#1E1E2D',
          600: '#18181f',
          700: '#121218',
          800: '#0c0c10',
          900: '#060608',
        },
        'accent': {
          50: '#fee6ef',
          100: '#fdccdf',
          200: '#fb99bf',
          300: '#f9669f',
          400: '#f7337f',
          500: '#f5005f',
          600: '#c4004c',
          700: '#930039',
          800: '#620026',
          900: '#310013',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};