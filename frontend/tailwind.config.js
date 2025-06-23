/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.1)',
          100: 'rgba(255, 255, 255, 0.2)',
          200: 'rgba(255, 255, 255, 0.3)',
          300: 'rgba(255, 255, 255, 0.4)',
          dark: 'rgba(0, 0, 0, 0.1)',
          'dark-100': 'rgba(0, 0, 0, 0.2)',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'glass-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.15)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.2)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-morphism-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-button': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease',
        },
        '.glass-button:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
        },
        '.blur-background': {
          background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.3) 0%, rgba(159, 122, 234, 0.3) 100%)',
          backdropFilter: 'blur(20px)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
