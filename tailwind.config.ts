/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-light': '#6366F1',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        accent: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        border: '#E5E7EB',
      },
    },
  },
  plugins: [],
}