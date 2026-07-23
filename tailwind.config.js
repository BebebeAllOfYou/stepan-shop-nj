/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf8f2',
          100: '#f9eedf',
          200: '#f2d9b8',
          300: '#e8be88',
          400: '#db9e56',
          500: '#c97f30',
          600: '#a96425',
          700: '#874e20',
          800: '#6b3e1f',
          900: '#57331b',
        },
        stone: {
          950: '#0f0d0b',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                    to: { opacity: '1' }                   },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fadeIn':  'fadeIn 0.2s ease',
        'slideUp': 'slideUp 0.25s ease',
      },
    },
  },
  plugins: [],
}
