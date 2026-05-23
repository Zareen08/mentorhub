/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.5s ease both',
        'fade-up-2':'fadeUp 0.5s 0.1s ease both',
        'fade-up-3':'fadeUp 0.5s 0.2s ease both',
        'fade-up-4':'fadeUp 0.5s 0.3s ease both',
        'fade-in':  'fadeIn 0.3s ease both',
        'slide-in': 'slideIn 0.25s ease both',
        'shimmer':  'shimmer 1.5s infinite',
        'ticker':   'ticker 25s linear infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(20px)' },   to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' },                                  to: { opacity: '1' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(20px)' },   to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer:  { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        ticker:   { '0%': { transform: 'translateX(0)' },     '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
