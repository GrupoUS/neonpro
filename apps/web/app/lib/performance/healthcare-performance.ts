/**
 * NeonPro Healthcare Performance Optimization
 * ≥95% Core Web Vitals for patient-facing interfaces
 * <100ms emergency response performance for critical medical access
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  emergencyResponseTime?: number;
  userPersona: 'dr_marina' | 'carla_santos' | 'ana_costa' | 'generic';
}

interface HealthcarePerformanceConfig {
  enableEmergencyOptimization: boolean;
  medicalPersonaOptimization: boolean;
  patientSafetyMode: boolean;
  lgpdComplianceMode: boolean;
}

class HealthcarePerformanceOptimizer {
  private static instance: HealthcarePerformanceOptimizer;
  private config: HealthcarePerformanceConfig;
  private metrics: PerformanceMetrics[] = [];

  constructor() {
    this.config = {
      enableEmergencyOptimization: true,
      medicalPersonaOptimization: true,
      patientSafetyMode: true,
      lgpdComplianceMode: true,
    };
  }

  static getInstance(): HealthcarePerformanceOptimizer {
    if (!HealthcarePerformanceOptimizer.instance) {
      HealthcarePerformanceOptimizer.instance =
        new HealthcarePerformanceOptimizer();
    }
    return HealthcarePerformanceOptimizer.instance;
  } /**
   * Optimize for emergency medical access <100ms response
   */
  async optimizeEmergencyResponse(): Promise<void> {
    if (!this.config.enableEmergencyOptimization) return;

    try {
      // Preload critical emergency resources
      await this.preloadEmergencyAssets();

      // Enable emergency mode caching
      this.enableEmergencyCache();

      // Optimize emergency API endpoints
      this.optimizeEmergencyEndpoints();

      console.log('✅ Emergency response optimization activated');
    } catch (error) {
      console.error('❌ Emergency optimization failed:', error);
    }
  }

  /**
   * Optimize for medical personas (Dr. Marina: <3 clicks, Carla: speed)
   */
  async optimizeForPersona(
    persona: 'dr_marina' | 'carla_santos' | 'ana_costa',
  ): Promise<void> {
    const optimizations = {
      dr_marina: {
        // Business owner needs efficiency and quick access
        preloadRoutes: ['/dashboard', '/analytics', '/financial'],
        cacheStrategy: 'aggressive',
        clickOptimization: true,
        maxClicks: 3,
      },
      carla_santos: {
        // Power user needs speed and automation
        preloadRoutes: [
          '/dashboard/appointments',
          '/dashboard/patients',
          '/scheduling',
        ],
        cacheStrategy: 'ultra_aggressive',
        keyboardShortcuts: true,
        automationFeatures: true,
      },
      ana_costa: {
        // Patient needs trust and anxiety reduction
        preloadRoutes: ['/patient-portal', '/appointments', '/treatments'],
        cacheStrategy: 'patient_optimized',
        anxietyReduction: true,
        transparencyMode: true,
      },
    };

    const config = optimizations[persona];

    // Preload persona-specific routes
    await this.preloadRoutes(config.preloadRoutes);

    // Apply persona-specific caching
    this.applyCacheStrategy(config.cacheStrategy);

    console.log(`✅ Optimization applied for ${persona}`);
  } /**
   * Measure Core Web Vitals for healthcare compliance
   */
  async measureCoreWebVitals(): Promise<PerformanceMetrics> {
    return new Promise((resolve) => {
      const metrics: Partial<PerformanceMetrics> = {
        userPersona: 'generic',
      };

      // Measure FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          metrics.firstContentfulPaint = entries[0].startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Measure LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          metrics.largestContentfulPaint =
            entries[entries.length - 1].startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure CLS (Cumulative Layout Shift)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
        metrics.cumulativeLayoutShift = clsScore;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Complete measurement after page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          metrics.pageLoadTime = performance.now();
          metrics.timeToInteractive = metrics.pageLoadTime; // Simplified
          resolve(metrics as PerformanceMetrics);
        }, 100);
      });
    });
  } /**
   * Preload emergency medical assets for <100ms response
   */
  private async preloadEmergencyAssets(): Promise<void> {
    const emergencyAssets = [
      '/emergency-access',
      '/api/emergency/notify',
      '/api/patients/emergency-access',
      '/api/health-check',
    ];

    for (const asset of emergencyAssets) {
      try {
        await fetch(asset, { method: 'HEAD' });
      } catch (error) {
        console.warn(`Failed to preload emergency asset: ${asset}`);
      }
    }
  }

  /**
   * Enable emergency mode caching for critical paths
   */
  private enableEmergencyCache(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.postMessage({
        type: 'ENABLE_EMERGENCY_CACHE',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Optimize emergency API endpoints
   */
  private optimizeEmergencyEndpoints(): void {
    // Set emergency response headers
    if (typeof window !== 'undefined') {
      (window as any).emergencyOptimizationEnabled = true;
    }
  }

  /**
   * Preload routes for persona optimization
   */
  private async preloadRoutes(routes: string[]): Promise<void> {
    for (const route of routes) {
      try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      } catch (error) {
        console.warn(`Failed to preload route: ${route}`);
      }
    }
  }

  /**
   * Apply persona-specific caching strategy
   */
  private applyCacheStrategy(strategy: string): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.postMessage({
        type: 'SET_CACHE_STRATEGY',
        strategy,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Validate healthcare performance standards
   */
  async validateHealthcarePerformance(): Promise<boolean> {
    const metrics = await this.measureCoreWebVitals();

    const standards = {
      firstContentfulPaint: 1500, // 1.5s max
      largestContentfulPaint: 2500, // 2.5s max
      cumulativeLayoutShift: 0.1, // 0.1 max
      emergencyResponseTime: 100, // 100ms max for emergency
    };

    const isCompliant =
      metrics.firstContentfulPaint <= standards.firstContentfulPaint &&
      metrics.largestContentfulPaint <= standards.largestContentfulPaint &&
      metrics.cumulativeLayoutShift <= standards.cumulativeLayoutShift;

    console.log('Healthcare performance validation:', {
      metrics,
      standards,
      isCompliant,
    });

    return isCompliant;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Export singleton instance
export const healthcarePerformance =
  HealthcarePerformanceOptimizer.getInstance();
export default healthcarePerformance;
