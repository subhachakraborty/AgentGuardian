/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A3C5E',
          light: '#2A5A8E',
          dark: '#0F2640',
        },
        accent: {
          DEFAULT: '#2E86AB',
          light: '#3DA5D1',
          dark: '#1E6A89',
        },
        tier: {
          auto: '#22C55E',
          nudge: '#EAB308',
          stepup: '#EF4444',
        },
        surface: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'countdown': 'countdown 60s linear forwards',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        countdown: {
          from: { width: '100%' },
          to: { width: '0%' },
        },
      },
    },
  },
  plugins: [],
};
