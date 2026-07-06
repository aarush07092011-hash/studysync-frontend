/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // StudySync dark theme palette -- from the brief
        bg: {
          DEFAULT: '#0F172A', // dark blue-black (page bg)
          card: '#1E293B',    // dark slate (cards)
          hover: '#273449',   // slightly lighter slate for hover
        },
        accent: {
          blue: '#3B82F6',    // electric blue
          purple: '#8B5CF6',  // purple
        },
        text: {
          DEFAULT: '#F1F5F9', // light slate
          muted: '#94A3B8',   // muted slate
          dim: '#64748B',     // dim slate
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        // Inter for everything; falls back to system if Inter isn't installed.
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-lg': '0 8px 24px rgba(0, 0, 0, 0.25)',
        glow: '0 0 24px rgba(139, 92, 246, 0.35)', // purple glow
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(135deg, #1E293B 0%, #273449 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};