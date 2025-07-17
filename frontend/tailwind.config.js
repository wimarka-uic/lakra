/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        primary: {
          50: '#fcf4f4',
          100: '#f9e7e8',
          200: '#f5d3d5',
          300: '#f0bfc2',
          400: '#e1888d',
          500: '#d26168',
          600: '#bd454c',
          700: '#9f363c',
          800: '#843035',
          900: '#6e2e32',
          950: '#3b1416',
        },
        'beauty-bush': {
          50: '#fcf4f4',
          100: '#f9e7e8',
          200: '#f5d3d5',
          300: '#f0bfc2',
          400: '#e1888d',
          500: '#d26168',
          600: '#bd454c',
          700: '#9f363c',
          800: '#843035',
          900: '#6e2e32',
          950: '#3b1416',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.5s ease-in-out',
        'slideInFromRight': 'slideInFromRight 0.3s ease-in-out',
        'slideOutToRight': 'slideOutToRight 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutToRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
} 