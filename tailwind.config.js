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
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(32px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        marquee:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fadeIn':    'fadeIn 0.2s ease',
        'fadeInUp':  'fadeInUp 0.6s ease both',
        'slideUp':   'slideUp 0.25s ease',
        'scaleIn':   'scaleIn 0.3s ease both',
        'shimmer':   'shimmer 2s linear infinite',
        'marquee':   'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
