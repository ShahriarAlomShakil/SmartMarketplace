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
        'modern-shimmer': 'modern-shimmer 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'modern-shimmer': {
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
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'modern': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'modern-lg': '0 20px 60px rgba(0, 0, 0, 0.20)',
        'modern-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glow': '0 0 25px rgba(59, 130, 246, 0.4)',
        'glow-lg': '0 0 45px rgba(59, 130, 246, 0.5)',
      },
      borderColor: {
        'modern': 'rgba(255, 255, 255, 0.25)',
        'modern-light': 'rgba(255, 255, 255, 0.15)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.modern-morphism': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
        '.modern-morphism-dark': {
          background: 'rgba(0, 0, 0, 0.90)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.80)',
        },
        '.modern-card': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
        '.modern-button': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          transition: 'all 0.3s ease',
        },
        '.modern-button:hover': {
          background: 'rgba(255, 255, 255, 0.25)',
          borderColor: 'rgba(255, 255, 255, 0.35)',
          transform: 'translateY(-3px)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.20)',
        },
        '.blur-background': {
          background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.4) 0%, rgba(159, 122, 234, 0.4) 100%)',
          backdropFilter: 'blur(24px)',
        },
        '.amoled-card': {
          background: 'rgba(0, 0, 0, 0.90)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.90)',
        },
        '.amoled-button': {
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.20)',
          transition: 'all 0.3s ease',
          color: 'white',
        },
        '.amoled-button:hover': {
          background: 'rgba(0, 0, 0, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.30)',
          transform: 'translateY(-3px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.80)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
