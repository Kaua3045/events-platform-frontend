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
        primary: '#6366F1', // Indigo-500 (mais vibrante, consistente)
        'primary-light': '#A5B4FC', // Indigo-300

        background: '#F8FAFC', // um pouco mais azulada, menos "lavada"
        surface: '#FFFFFF',

        'text-primary': '#1E293B', // Slate-800 - mais contraste e leitura
        'text-secondary': '#64748B', // Slate-500

        accent: '#14B8A6', // Teal-500 (mais moderno que o verde puro)
        danger: '#DC2626', // Red-600 (melhor contraste e consistência)
        warning: '#F59E0B', // ok, bom contraste

        border: '#E2E8F0', // Slate-200 (mais coerente com fundo e texto)P
        // primary: '#4F46E5',
        // 'primary-light': '#6366F1',
        // background: '#F9FAFB',
        // surface: '#FFFFFF',
        // 'text-primary': '#111827',
        // 'text-secondary': '#6B7280',
        // accent: '#10B981',
        // danger: '#EF4444',
        // warning: '#F59E0B',
        // border: '#E5E7EB',
      },
    },
  },
  plugins: [],
}