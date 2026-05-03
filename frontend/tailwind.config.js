/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        midnight: '#0F172A',
        navy: '#1E293B',
        sky: '#38BDF8',
        snow: '#F9FAFB',
        'primary-50': '#F5F3FF',
        'primary-100': '#EDE9FE',
        'primary-200': '#DDD6FE',
        'primary-300': '#C4B5FD',
        'primary-400': '#A78BFA',
        'primary-500': '#8B5CF6',
        'primary-600': '#7C3AED',
        'primary-700': '#6D28D9',
        'primary-800': '#5B21B6',
        'primary-900': '#4C1D95',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};