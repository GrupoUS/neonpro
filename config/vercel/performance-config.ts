// Performance optimization configuration for healthcare platform
export const performanceConfig = {
  // Build optimizations
  build: {
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          charts: ['recharts'],
          healthcare: ['@supabase/supabase-js', '@prisma/client'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
  },

  // Compression settings
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6,
    threshold: 10240, // 10KB
    filter: (req, _res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return true
    },
  },

  // Brotli compression (better than gzip)
  brotli: {
    enabled: true,
    compressionLevel: 11,
    mode: 0, // generic
    quality: 11,
  },

  // Cache strategies
  cache: {
    // Static assets - 1 year immutable
    staticAssets: {
      pattern: '/assets/**/*',
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
      },
    },

    // API responses - 5 minutes
    api: {
      pattern: '/api/**/*',
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    },

    // Patient data - no cache (compliance requirement)
    patientData: {
      pattern: '/api/patient/**/*',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },

    // Medical data - no cache (compliance requirement)
    medicalData: {
      pattern: '/api/medical/**/*',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },

    // Images - 30 days
    images: {
      pattern: '/images/**/*',
      headers: {
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
      },
    },
  },

  // Image optimization
  images: {
    domains: [
      'neonpro-db.supabase.co',
      'neonpro-healthcare.s3.sa-east-1.amazonaws.com',
    ],
    formats: ['image/webp', 'image/avif'],
    quality: 85,
    sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: '/_next/image',
    loader: 'default',
    loaderFile: '',
  },

  // Font optimization
  fonts: {
    optimize: true,
    preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    display: 'swap',
  },

  // Code splitting
  codeSplitting: {
    enabled: true,
    strategy: 'smart',
    maxChunkSize: 244000, // 244KB
    minChunkSize: 20000, // 20KB
  },

  // Lazy loading
  lazyLoading: {
    images: true,
    components: true,
    routes: true,
    threshold: 0.1,
  },

  // Prefetching
  prefetching: {
    enabled: true,
    strategy: 'hover',
    delay: 100,
  },

  // Service Worker configuration
  serviceWorker: {
    enabled: true,
    scope: '/',
    cacheName: 'neonpro-healthcare-v1',
    precache: ['/', '/manifest.json', '/offline.html'],
    runtimeCaching: [
      {
        urlPattern: '/assets/**/*',
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 31536000, // 1 year
          },
        },
      },
      {
        urlPattern: '/api/**/*',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 300, // 5 minutes
          },
        },
      },
    ],
  },

  // Bundle analysis
  bundleAnalysis: {
    enabled: true,
    reportFilename: 'bundle-analysis.html',
    openAnalyzer: false,
    analyzerMode: 'static',
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
  },

  // Performance budgets
  budgets: [
    {
      type: 'initial',
      maximumSize: '300KB',
      maximumWarning: '250KB',
    },
    {
      type: 'script',
      maximumSize: '200KB',
      maximumWarning: '180KB',
    },
    {
      type: 'style',
      maximumSize: '50KB',
      maximumWarning: '40KB',
    },
    {
      type: 'any',
      maximumSize: '100KB',
      maximumWarning: '80KB',
    },
  ],

  // Critical CSS extraction
  criticalCss: {
    enabled: true,
    criticalKeys: ['/', '/dashboard', '/patient/**'],
    criticalWidth: 600,
    criticalHeight: 900,
    targetPath: 'dist/critical.css',
  },

  // CDN configuration
  cdn: {
    enabled: true,
    provider: 'vercel',
    edge: true,
    regions: ['gru1', 'iad1'],
    compression: true,
    caching: true,
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    webVitals: true,
    lighthouse: true,
    bundleSize: true,
    loadTime: true,
    firstContentfulPaint: true,
    largestContentfulPaint: true,
    cumulativeLayoutShift: true,
    interactionToNextPaint: true,
  },
}

export default performanceConfig
