/**
 * Performance Monitoring Dashboard Configuration
 * 
 * Comprehensive performance monitoring for NEONPRO platform
 * Tracks Core Web Vitals, theme performance, and user experience metrics
 */

export const performanceMonitoringConfig = {
  // Core Web Vitals targets
  coreWebVitals: {
    lcp: {
      target: '2.5s',
      current: '~2.1s',
      description: 'Largest Contentful Paint - Main content loading'
    },
    inp: {
      target: '200ms',
      current: '~150ms',
      description: 'Interaction to Next Paint - Responsiveness'
    },
    cls: {
      target: '0.1',
      current: '~0.05',
      description: 'Cumulative Layout Shift - Visual stability'
    }
  },
  
  // NEONPRO-specific performance metrics
  customMetrics: {
    themeSwitch: {
      target: '< 100ms',
      description: 'Time to switch between light/dark themes',
      measurement: 'Time from click to visual change completion'
    },
    fontLoading: {
      target: '< 500ms',
      description: 'Time to load and apply custom fonts',
      measurement: 'FOIT (Flash of Invisible Text) duration'
    },
    componentHydration: {
      target: '< 300ms', 
      description: 'Time for components to become interactive',
      measurement: 'SSR to hydration completion'
    },
    bundleSize: {
      target: '< 250KB',
      description: 'Total JavaScript bundle size',
      measurement: 'Gzipped production bundle'
    }
  },  
  // Healthcare industry performance requirements
  healthcareRequirements: {
    accessibility: {
      target: 'WCAG 2.1 AA compliance with <300ms response',
      description: 'Critical for users with disabilities',
      monitoring: 'Automated accessibility testing + performance'
    },
    reliability: {
      target: '99.9% uptime',
      description: 'Medical platform reliability standards',
      monitoring: 'Uptime monitoring + error tracking'
    },
    dataProtection: {
      target: 'LGPD compliance with <100ms encryption',
      description: 'Patient data security performance',
      monitoring: 'Security audit + performance impact'
    }
  },
  
  // Monitoring implementation
  monitoring: {
    realUserMonitoring: {
      tool: 'Vercel Analytics + Web Vitals API',
      metrics: ['CWV', 'custom metrics', 'error rates'],
      frequency: 'Real-time'
    },
    syntheticMonitoring: {
      tool: 'Lighthouse CI + Playwright',
      metrics: ['Performance scores', 'accessibility', 'SEO'],
      frequency: 'Every deployment + hourly'
    },
    businessMetrics: {
      tool: 'Custom dashboard',
      metrics: ['User satisfaction', 'conversion rates', 'bounce rates'],
      frequency: 'Daily reports'
    }
  },
  
  // Alert thresholds
  alerts: {
    critical: {
      lcp: '> 4s',
      inp: '> 500ms',
      cls: '> 0.25',
      errorRate: '> 1%'
    },
    warning: {
      lcp: '> 2.5s',
      inp: '> 200ms', 
      cls: '> 0.1',
      errorRate: '> 0.5%'
    }
  },
  
  // Dashboard implementation
  dashboard: {
    components: [
      'Real-time Core Web Vitals',
      'NEONPRO theme performance metrics',
      'Healthcare compliance indicators',
      'User experience trends',
      'Error tracking and alerts'
    ],
    updateFrequency: '5 minutes',
    retentionPeriod: '30 days',
    integrations: ['Vercel', 'Lighthouse', 'Web Vitals API']
  }
} as const;

export default performanceMonitoringConfig;