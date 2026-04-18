/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'var(--palette-navy)',
          cyan: 'var(--palette-cyan)',
          muted: 'var(--palette-gray-light)',
          soft: 'var(--palette-gray-mid)',
          white: 'var(--palette-white)',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'loader-orbit': 'loader-orbit 2.8s ease-in-out infinite',
        'loader-pulse-soft': 'loader-pulse-soft 1.8s ease-in-out infinite',
        'loader-shimmer': 'loader-shimmer 2.2s ease-in-out infinite',
      },
      keyframes: {
        'loader-orbit': {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)', opacity: '0.85' },
          '50%': { transform: 'rotate(180deg) scale(1.06)', opacity: '1' },
        },
        'loader-pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.35' },
          '50%': { transform: 'scale(1.15)', opacity: '0.65' },
        },
        'loader-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
