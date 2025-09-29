/**
 * Advanced Animations & Micro-interactions Configuration
 * 
 * Premium animation system for NEONPRO aesthetic clinic platform
 * Designed for healthcare UX with accessibility and performance focus
 */

export const advancedAnimationsConfig = {
  // Animation principles for healthcare UX
  principles: {
    purposeful: 'Every animation serves a functional purpose',
    accessible: 'Respects user motion preferences and disabilities',
    performant: 'Optimized for 60fps on all devices',
    contextual: 'Animations match aesthetic clinic branding'
  },
  
  // Micro-interaction categories
  microInteractions: {
    feedbackAnimations: {
      description: 'Visual feedback for user actions',
      examples: [
        'Button press ripple effects',
        'Form validation indicators',
        'Loading state animations',
        'Success/error confirmations'
      ],
      duration: '150-300ms',
      easing: 'ease-out'
    },
    
    stateTransitions: {
      description: 'Smooth transitions between states',
      examples: [
        'Theme switching animations',
        'Modal open/close transitions',
        'Sidebar expand/collapse',
        'Card hover transformations'
      ],
      duration: '200-400ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    attentionDrawing: {
      description: 'Subtle animations to guide attention',
      examples: [
        'Pulse animations for important actions',
        'Glow effects for interactive elements',
        'Shake animations for errors',
        'Breathing animations for waiting states'
      ],
      duration: '800-1200ms',
      easing: 'ease-in-out'
    }
  },  
  // NEONPRO-specific animation library
  neonproAnimations: {
    themeTransition: {
      name: 'neonpro-theme-switch',
      description: 'Smooth transition between light/dark themes',
      duration: '400ms',
      implementation: 'CSS variables + framer-motion',
      triggers: ['theme toggle', 'system preference change']
    },
    
    componentEntrance: {
      name: 'neonpro-fade-up',
      description: 'Elegant entrance animation for components',
      duration: '600ms',
      implementation: 'Intersection Observer + framer-motion',
      triggers: ['viewport entry', 'dynamic content loading']
    },
    
    interactiveHover: {
      name: 'neonpro-interactive-hover',
      description: 'Sophisticated hover effects for interactive elements',
      duration: '200ms',
      implementation: 'CSS transforms + custom properties',
      triggers: ['mouse hover', 'focus events']
    },
    
    loadingStates: {
      name: 'neonpro-loading-premium',
      description: 'Premium loading animations with brand elements',
      duration: 'infinite loop',
      implementation: 'Keyframe animations + SVG morphing',
      triggers: ['async operations', 'data fetching']
    }
  },
  
  // Healthcare accessibility considerations
  accessibilityFeatures: {
    respectMotionPreference: {
      description: 'Honor prefers-reduced-motion setting',
      implementation: 'CSS media queries + JavaScript detection',
      fallback: 'Instant transitions or static states'
    },
    
    focusManagement: {
      description: 'Clear focus indicators with animations',
      implementation: 'Animated focus rings with high contrast',
      compliance: 'WCAG 2.1 AA focus visibility'
    },
    
    timingControl: {
      description: 'User control over animation timing',
      implementation: 'Settings panel for animation speed',
      options: ['disabled', 'reduced', 'normal', 'enhanced']
    }
  },
  
  // Performance optimization
  performance: {
    strategies: [
      'Use transform and opacity for 60fps animations',
      'Prefer CSS animations over JavaScript when possible',
      'Implement will-change property sparingly',
      'Use GPU acceleration for complex animations'
    ],
    
    monitoring: {
      metrics: ['Animation frame rate', 'GPU usage', 'Paint times'],
      tools: ['Performance API', 'Chrome DevTools', 'Lighthouse'],
      thresholds: {
        frameRate: '> 55fps',
        animationDuration: '< 500ms',
        gpuMemory: '< 50MB'
      }
    }
  },
  
  // Implementation roadmap
  implementation: {
    phase1: {
      name: 'Core Animation System',
      duration: '1 week',
      deliverables: [
        'Animation configuration system',
        'Basic micro-interactions',
        'Theme transition animations'
      ]
    },
    
    phase2: {
      name: 'Advanced Interactions',
      duration: '1 week',
      deliverables: [
        'Premium hover effects',
        'Loading state animations',
        'Form interaction feedback'
      ]
    },
    
    phase3: {
      name: 'Accessibility & Polish',
      duration: '1 week',
      deliverables: [
        'Motion preference handling',
        'Performance optimization',
        'Cross-browser testing'
      ]
    }
  }
} as const;

export default advancedAnimationsConfig;