/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // MoneyWithSense Brand Colors - Finance Professional Palette
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#1E6F5C', // Main Brand Green
          700: '#1F7A63',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'secondary': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'accent': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Brand semantic colors
        'brand': {
          'green': '#1E6F5C',
          'green-light': '#22A67D',
          'green-dark': '#165A4A',
          'navy': '#243A5E',
          'slate': '#2F3A45',
          'warm-gray': '#F7F8FA',
        },
        // Finance-specific semantic colors
        'finance': {
          'success': '#10B981',
          'warning': '#F59E0B',
          'danger': '#EF4444',
          'info': '#3B82F6',
          'savings': '#22C55E',
          'debt': '#EF4444',
          'investment': '#8B5CF6',
          'income': '#14B8A6',
        },
      },
      backgroundImage: {
        'gradient-finance': 'linear-gradient(135deg, #1E6F5C 0%, #243A5E 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #F7F8FA 0%, #FFFFFF 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #F7F8FA 100%)',
      },
      boxShadow: {
        'finance': '0 4px 14px 0 rgba(30, 111, 92, 0.12)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
