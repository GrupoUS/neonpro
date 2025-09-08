/**
 * Brazilian Connectivity Optimizer
 * Adaptive loading based on Brazilian internet infrastructure tiers
 */

export type ConnectivityTier =
  | 'tier1_premium'
  | 'tier2_standard'
  | 'tier3_limited'

export interface BrazilianRegion {
  id: string
  name: string
  cdnNodes: string[]
  tier: ConnectivityTier
  expectedLatency: number // in ms
}

export interface PerformanceMetrics {
  connectionType: string
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

export interface BrazilianCDNConfig {
  primaryNodes: BrazilianRegion[]
  assetOptimization: {
    images: {
      formats: string[]
      quality: Record<ConnectivityTier, number>
      lazy: boolean
      placeholder: 'blur' | 'empty'
    }
    scripts: {
      compression: 'brotli' | 'gzip'
      minification: 'esbuild' | 'terser'
      splitting: boolean
    }
    styles: {
      critical: boolean
      defer: boolean
      inline: boolean
    }
  }
  healthcareWorkflows: {
    emergencyAccess: number // < 100ms target
    patientLookup: number // < 200ms target
    appointmentBooking: number // < 500ms target
    aiChatResponse: number // < 1.5s target
  }
}

class BrazilianConnectivityOptimizer {
  private static instance: BrazilianConnectivityOptimizer
  private performanceObserver: PerformanceObserver | null = null
  private metrics: PerformanceMetrics | null = null

  private readonly brazilianRegions: BrazilianRegion[] = [
    {
      id: 'sao-paulo',
      name: 'São Paulo',
      cdnNodes: ['sao-paulo-1', 'sao-paulo-2',],
      tier: 'tier1_premium',
      expectedLatency: 20,
    },
    {
      id: 'rio-janeiro',
      name: 'Rio de Janeiro',
      cdnNodes: ['rio-janeiro-1',],
      tier: 'tier1_premium',
      expectedLatency: 25,
    },
    {
      id: 'brasilia',
      name: 'Brasília',
      cdnNodes: ['brasilia-1',],
      tier: 'tier1_premium',
      expectedLatency: 30,
    },
    {
      id: 'regional-capitals',
      name: 'Regional Capitals',
      cdnNodes: [
        'belo-horizonte-1',
        'porto-alegre-1',
        'recife-1',
        'salvador-1',
      ],
      tier: 'tier2_standard',
      expectedLatency: 50,
    },
    {
      id: 'interior-cities',
      name: 'Interior Cities',
      cdnNodes: ['interior-central-1',],
      tier: 'tier3_limited',
      expectedLatency: 100,
    },
  ]

  private readonly cdnConfig: BrazilianCDNConfig = {
    primaryNodes: this.brazilianRegions,
    assetOptimization: {
      images: {
        formats: ['webp', 'avif', 'jpeg',],
        quality: {
          tier1_premium: 85,
          tier2_standard: 75,
          tier3_limited: 60,
        },
        lazy: true,
        placeholder: 'blur',
      },
      scripts: {
        compression: 'brotli',
        minification: 'esbuild',
        splitting: true,
      },
      styles: {
        critical: true,
        defer: true,
        inline: true,
      },
    },
    healthcareWorkflows: {
      emergencyAccess: 100,
      patientLookup: 200,
      appointmentBooking: 500,
      aiChatResponse: 1500,
    },
  }

  private constructor() {
    this.initializePerformanceMonitoring()
  }

  static getInstance(): BrazilianConnectivityOptimizer {
    if (!BrazilianConnectivityOptimizer.instance) {
      BrazilianConnectivityOptimizer.instance = new BrazilianConnectivityOptimizer()
    }
    return BrazilianConnectivityOptimizer.instance
  }

  /**
   * Detect user's connectivity tier based on connection quality and location
   */
  detectConnectivityTier(): ConnectivityTier {
    // Check if running in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return 'tier2_standard' // Default for server-side
    }

    const connection = (navigator as unknown).connection || (navigator as unknown).mozConnection

    if (connection) {
      const effectiveType = connection.effectiveType
      const downlink = connection.downlink

      // High-quality connections (4G+)
      if (effectiveType === '4g' && downlink > 10) {
        return 'tier1_premium'
      }

      // Standard connections (3G, slower 4G)
      if (
        effectiveType === '3g'
        || (effectiveType === '4g' && downlink <= 10)
      ) {
        return 'tier2_standard'
      }

      // Limited connections (2G, very slow)
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return 'tier3_limited'
      }
    }

    // Fallback based on user agent or other heuristics
    return this.fallbackTierDetection()
  }

  private fallbackTierDetection(): ConnectivityTier {
    // Basic heuristics for when Network Information API is not available
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()

      // Mobile devices on potentially slower connections
      if (/mobile|android|iphone|ipad/.test(userAgent,)) {
        return 'tier2_standard'
      }

      // Desktop browsers - assume better connection
      return 'tier1_premium'
    }

    return 'tier2_standard'
  }

  /**
   * Load resources optimized for the detected connectivity tier
   */
  async loadResourcesForTier(tier: ConnectivityTier,): Promise<void> {
    switch (tier) {
      case 'tier1_premium':
        await this.loadPremiumExperience()
        break
      case 'tier2_standard':
        await this.loadProgressiveExperience()
        break
      case 'tier3_limited':
        await this.loadEssentialExperience()
        break
    }
  }

  private async loadPremiumExperience(): Promise<void> {
    // Load full experience with all assets
    // High-quality images, all JavaScript modules, full feature set
    const promises = [
      this.preloadCriticalImages('high',),
      this.loadAllModules(),
      this.enableAdvancedFeatures(),
      this.preloadPatientData(),
    ]

    await Promise.all(promises,)
  }

  private async loadProgressiveExperience(): Promise<void> {
    // Progressive enhancement approach
    // Medium-quality images, lazy load modules, core features first
    const promises = [
      this.preloadCriticalImages('medium',),
      this.loadCoreModules(),
      this.enableCoreFeatures(),
    ]

    await Promise.all(promises,)

    // Load additional features in background
    setTimeout(() => {
      this.loadSecondaryModules()
      this.enableSecondaryFeatures()
    }, 2000,)
  }

  private async loadEssentialExperience(): Promise<void> {
    // Minimal critical features only
    // Low-quality images, essential JavaScript only, basic functionality
    await this.preloadCriticalImages('low',)
    await this.loadEssentialModules()
    await this.enableEssentialFeatures()
  }

  private async preloadCriticalImages(
    quality: 'high' | 'medium' | 'low',
  ): Promise<void> {
    const qualitySettings = this.cdnConfig.assetOptimization.images.quality
    const imageQuality = qualitySettings[this.detectConnectivityTier()]

    // Preload critical healthcare UI images
    const criticalImages = [
      '/images/logo.webp',
      '/images/emergency-icon.webp',
      '/images/patient-placeholder.webp',
    ]

    const preloadPromises = criticalImages.map(async (src,) => {
      const optimizedSrc = this.optimizeImageUrl(src, imageQuality,)
      return this.preloadImage(optimizedSrc,)
    },)

    await Promise.allSettled(preloadPromises,)
  }

  private optimizeImageUrl(src: string, quality: number,): string {
    // Add quality parameter for dynamic image optimization
    const url = new URL(src, window.location.origin,)
    url.searchParams.set('q', quality.toString(),)
    url.searchParams.set('f', 'webp',)
    return url.toString()
  }

  private preloadImage(src: string,): Promise<void> {
    return new Promise((resolve, reject,) => {
      const img = new Image()
      const onLoad = () => {
        img.removeEventListener('load', onLoad,)
        img.removeEventListener('error', onError,)
        resolve()
      }
      const onError = () => {
        img.removeEventListener('load', onLoad,)
        img.removeEventListener('error', onError,)
        reject()
      }
      img.addEventListener('load', onLoad,)
      img.addEventListener('error', onError,)
      img.src = src
    },)
  }

  private async loadAllModules(): Promise<void> {
    // Load all application modules for premium experience
    const modules = [
      import('../compliance/cfm'),
      import('../analytics/index'),
    ]

    await Promise.allSettled(modules,)
  }

  private async loadCoreModules(): Promise<void> {
    // Load core modules for standard experience
    const coreModules = [
      import('../compliance/cfm'),
      import('../analytics/index'),
    ]

    await Promise.all(coreModules,)
  }

  private async loadSecondaryModules(): Promise<void> {
    // Load secondary modules in background
    const secondaryModules = [
      import('../compliance/lgpd'),
      import('../analytics/calculations'),
    ]

    await Promise.allSettled(secondaryModules,)
  }

  private async loadEssentialModules(): Promise<void> {
    // Load only essential modules for limited connections
    await import('../compliance/cfm')
  }

  private async enableAdvancedFeatures(): Promise<void> {
    // Enable all features including AI, advanced analytics, real-time sync
    this.enableFeature('ai-chat',)
    this.enableFeature('real-time-sync',)
    this.enableFeature('advanced-analytics',)
    this.enableFeature('video-consultation',)
  }

  private async enableCoreFeatures(): Promise<void> {
    // Enable core healthcare features
    this.enableFeature('patient-lookup',)
    this.enableFeature('appointment-booking',)
    this.enableFeature('emergency-access',)
  }

  private async enableSecondaryFeatures(): Promise<void> {
    // Enable secondary features after core loading
    this.enableFeature('ai-chat',)
    this.enableFeature('basic-analytics',)
  }

  private async enableEssentialFeatures(): Promise<void> {
    // Enable only critical emergency features
    this.enableFeature('emergency-access',)
    this.enableFeature('basic-patient-lookup',)
  }

  private enableFeature(featureName: string,): void {
    // Feature flag management for progressive enhancement
    if (typeof window !== 'undefined') {
      ;(window as unknown).__NEONPRO_FEATURES = {
        ...(window as unknown).__NEONPRO_FEATURES,
        [featureName]: true,
      }
    }
  }

  private async preloadPatientData(): Promise<void> {
    // Preload critical patient data for premium connections
    try {
      const response = await fetch('/api/patients/recent', {
        headers: { 'Cache-Control': 'max-age=300', },
      },)

      if (response.ok) {
        const data = await response.json()
        // Cache in sessionStorage for quick access
        sessionStorage.setItem('preloaded-patients', JSON.stringify(data,),)
      }
    } catch {
      // Silent fail for preloading
    }
  }

  /**
   * Monitor performance and adjust optimization strategy
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    this.performanceObserver = new PerformanceObserver((list,) => {
      const entries = list.getEntries()

      entries.forEach((entry,) => {
        if (entry.entryType === 'navigation') {
          this.handleNavigationMetrics(entry as PerformanceNavigationTiming,)
        } else if (entry.entryType === 'resource') {
          this.handleResourceMetrics(entry as PerformanceResourceTiming,)
        }
      },)
    },)

    this.performanceObserver.observe({
      entryTypes: ['navigation', 'resource', 'measure',],
    },)
  }

  private handleNavigationMetrics(entry: PerformanceNavigationTiming,): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      dom: entry.domContentLoadedEventEnd - entry.responseEnd,
      load: entry.loadEventEnd - entry.loadEventStart,
    }

    // Check if performance meets Brazilian healthcare targets
    const totalLoad = entry.loadEventEnd - entry.navigationStart
    const tier = this.detectConnectivityTier()

    this.validatePerformanceTargets(totalLoad, tier, metrics,)
  }

  private handleResourceMetrics(entry: PerformanceResourceTiming,): void {
    // Track critical resource loading times
    const resourceType = this.getResourceType(entry.name,)
    const loadTime = entry.responseEnd - entry.startTime

    if (resourceType === 'critical' && loadTime > 1000) {
      console.warn(
        `Critical resource slow loading: ${entry.name} (${loadTime}ms)`,
      )
    }
  }

  private getResourceType(
    resourceName: string,
  ): 'critical' | 'secondary' | 'optional' {
    if (
      resourceName.includes('emergency',)
      || resourceName.includes('patient',)
    ) {
      return 'critical'
    }
    if (resourceName.includes('ai',) || resourceName.includes('analytics',)) {
      return 'secondary'
    }
    return 'optional'
  }

  private validatePerformanceTargets(
    totalLoad: number,
    tier: ConnectivityTier,
    metrics: Record<string, number>,
  ): void {
    const targets = {
      tier1_premium: 1500, // 1.5s
      tier2_standard: 3500, // 3.5s
      tier3_limited: 5000, // 5s
    }

    const target = targets[tier]

    if (totalLoad > target) {
      console.warn(
        `Performance target missed: ${totalLoad}ms > ${target}ms for ${tier}`,
      )

      // Send performance metrics for monitoring
      this.reportPerformanceIssue(tier, totalLoad, target, metrics,)
    }
  }

  private reportPerformanceIssue(
    tier: ConnectivityTier,
    actual: number,
    target: number,
    metrics: Record<string, number>,
  ): void {
    // Report performance issues for infrastructure monitoring
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      const data = JSON.stringify({
        type: 'performance_issue',
        tier,
        actual,
        target,
        metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: (navigator as unknown).connection,
      },)

      window.navigator.sendBeacon('/api/monitoring/performance', data,)
    }
  }

  /**
   * Get CDN configuration for current tier
   */
  getCDNConfig(): BrazilianCDNConfig {
    return this.cdnConfig
  }

  /**
   * Get optimal CDN node for user location
   */
  getOptimalCDNNode(): BrazilianRegion {
    // Simple geolocation-based CDN selection
    // In production, this would use more sophisticated edge routing
    const tier = this.detectConnectivityTier()

    return (
      this.brazilianRegions.find((region,) => region.tier === tier)
      || this.brazilianRegions[0]
    ) // fallback to São Paulo
  }

  /**
   * Cleanup performance monitoring
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
  }
}

// Export class for testing
export { BrazilianConnectivityOptimizer, }

// Create and export singleton instance
const _instance = BrazilianConnectivityOptimizer.getInstance()
export { _instance as brazilianConnectivityOptimizer, }
