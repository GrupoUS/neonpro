/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      animation: {
        'background-position-spin': 'background-position-spin 3s infinite alternate',
        'glow-scale': 'glow-scale 5s infinite',
        'glow-slide': 'glow-slide 5s infinite linear',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'background-position-spin': {
          '0%': { backgroundPosition: 'top center' },
          '100%': { backgroundPosition: 'bottom center' },
        },
        'glow-scale': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.8)' 
          },
        },
        'glow-slide': {
          '0%': { 
            transform: 'translateX(-100%)',
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.8)' 
          },
          '100%': { 
            transform: 'translateX(100%)',
            boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' 
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}