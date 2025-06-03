
// Configuração de animações e keyframes NEON PRO

export const keyframes = {
  // Animações básicas
  'accordion-down': {
    from: {
      height: '0'
    },
    to: {
      height: 'var(--radix-accordion-content-height)'
    }
  },
  'accordion-up': {
    from: {
      height: 'var(--radix-accordion-content-height)'
    },
    to: {
      height: '0'
    }
  },
  'fade-in': {
    '0%': {
      opacity: '0',
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)'
    }
  },
  'fade-in-up': {
    '0%': {
      opacity: '0',
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)'
    }
  },
  'scale-in': {
    '0%': {
      transform: 'scale(0.95)',
      opacity: '0'
    },
    '100%': {
      transform: 'scale(1)',
      opacity: '1'
    }
  },
  'slide-in-right': {
    '0%': {
      opacity: '0',
      transform: 'translateX(30px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateX(0)'
    }
  },
  'slide-in-left': {
    '0%': {
      opacity: '0',
      transform: 'translateX(-30px)'
    },
    '100%': {
      opacity: '1',
      transform: 'translateX(0)'
    }
  },
  'shimmer': {
    '0%': {
      backgroundPosition: '-200% 0'
    },
    '100%': {
      backgroundPosition: '200% 0'
    }
  },
  'pulse-gold': {
    '0%, 100%': {
      boxShadow: '0 0 0 0 rgba(172, 148, 105, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(172, 148, 105, 0)'
    }
  },
  // Animações NEON PRO
  'pulse-neon': {
    '0%, 100%': {
      boxShadow: '0 0 0 0 rgba(0, 245, 255, 0.7)'
    },
    '70%': {
      boxShadow: '0 0 0 15px rgba(0, 245, 255, 0)'
    }
  },
  'glow-neon': {
    '0%, 100%': {
      boxShadow: '0 0 5px rgba(0, 245, 255, 0.5), 0 0 10px rgba(0, 250, 154, 0.3)'
    },
    '50%': {
      boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), 0 0 30px rgba(0, 250, 154, 0.6), 0 0 40px rgba(0, 245, 255, 0.4)'
    }
  },
  'gradient-shift': {
    '0%': {
      backgroundPosition: '0% 50%'
    },
    '50%': {
      backgroundPosition: '100% 50%'
    },
    '100%': {
      backgroundPosition: '0% 50%'
    }
  }
};

export const animations = {
  // Animações básicas
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'fade-in': 'fade-in 0.3s ease-out',
  'fade-in-up': 'fade-in-up 0.6s ease-out',
  'scale-in': 'scale-in 0.2s ease-out',
  'slide-in-right': 'slide-in-right 0.5s ease-out',
  'slide-in-left': 'slide-in-left 0.5s ease-out',
  'shimmer': 'shimmer 2s infinite',
  'pulse-gold': 'pulse-gold 2s infinite',
  // Animações NEON PRO
  'pulse-neon': 'pulse-neon 2s infinite',
  'glow-neon': 'glow-neon 2s ease-in-out infinite',
  'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
};
