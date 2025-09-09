import { access, constants, readdir, readFile, } from 'fs/promises'
import { join, relative, } from 'path'
import { performance, } from 'perf_hooks'
import {
  Performance,
  SecurityResult,
  SystemValidator,
  ValidationResult,
} from '../core/system-validator'

/**
 * ViteValidator - Constitutional TDD Compliance for Vite Healthcare Build Systems
 *
 * Validates Vite build configurations, performance optimizations, and healthcare
 * compliance for NeonPro healthcare management system with LGPD/ANVISA requirements.
 *
 * Constitutional Requirements:
 * - Process 10k+ files in <4 hours
 * - Memory usage <2GB
 * - Healthcare compliance validation (LGPD/ANVISA)
 * - Build performance assessment
 * - Security configuration validation
 * - Bundle optimization analysis
 */

interface ViteConfig {
  root?: string
  base?: string
  mode?: string
  define?: Record<string, any>
  plugins?: VitePlugin[]
  resolve?: ResolveConfig
  css?: CSSConfig
  json?: JSONConfig
  esbuild?: ESBuildConfig
  assetsInclude?: string[]
  logLevel?: string
  clearScreen?: boolean
  envDir?: string
  envPrefix?: string | string[]
  appType?: string
  server?: ServerConfig
  build?: BuildConfig
  preview?: PreviewConfig
  optimizeDeps?: OptimizeDepsConfig
  ssr?: SSRConfig
  worker?: WorkerConfig
  test?: TestConfig
}

interface VitePlugin {
  name: string
  config?: any
  healthcareRelevant: boolean
  securityImpact: 'low' | 'medium' | 'high'
}

interface ResolveConfig {
  alias?: Record<string, string>
  dedupe?: string[]
  conditions?: string[]
  mainFields?: string[]
  extensions?: string[]
  preserveSymlinks?: boolean
}

interface CSSConfig {
  modules?: CSSModulesConfig
  postcss?: any
  preprocessorOptions?: Record<string, any>
  devSourcemap?: boolean
  codegeneration?: any
}

interface CSSModulesConfig {
  scopeBehaviour?: 'global' | 'local'
  globalModulePaths?: string[]
  generateScopedName?: string
  hashPrefix?: string
  localsConvention?: string
}

interface JSONConfig {
  namedExports?: boolean
  stringify?: boolean
}

interface ESBuildConfig {
  include?: string[]
  exclude?: string[]
  jsxFactory?: string
  jsxFragment?: string
  jsxInject?: string
  format?: string
  globalName?: string
  platform?: string
  target?: string
}

interface ServerConfig {
  host?: string | boolean
  port?: number
  strictPort?: boolean
  https?: any
  open?: boolean | string
  proxy?: Record<string, any>
  cors?: any
  headers?: Record<string, string>
  hmr?: any
  watch?: any
  middlewareMode?: any
  base?: string
  fs?: FileSystemConfig
}

interface FileSystemConfig {
  strict?: boolean
  allow?: string[]
  deny?: string[]
}

interface BuildConfig {
  target?: string | string[]
  polyfillModulePreload?: boolean
  outDir?: string
  assetsDir?: string
  assetsInlineLimit?: number
  cssCodeSplit?: boolean
  cssTarget?: string | string[]
  sourcemap?: boolean | 'inline' | 'hidden'
  rollupOptions?: RollupOptions
  commonjsOptions?: any
  dynamicImportVarsOptions?: any
  lib?: LibConfig
  manifest?: boolean | string
  ssrManifest?: boolean | string
  ssr?: boolean | string
  minify?: boolean | 'terser' | 'esbuild'
  terserOptions?: any
  write?: boolean
  emptyOutDir?: boolean
  copyPublicDir?: boolean
  reportCompressedSize?: boolean
  chunkSizeWarningLimit?: number
  watch?: any
}

interface RollupOptions {
  input?: any
  output?: any
  external?: string[]
  plugins?: any[]
  preserveEntrySignatures?: boolean
  cache?: boolean
}

interface LibConfig {
  entry: string
  name?: string
  formats?: string[]
  fileName?: string
}

interface PreviewConfig {
  host?: string | boolean
  port?: number
  strictPort?: boolean
  https?: any
  open?: boolean | string
  proxy?: Record<string, any>
  cors?: any
  headers?: Record<string, string>
}

interface OptimizeDepsConfig {
  entries?: string[]
  exclude?: string[]
  include?: string[]
  esbuildOptions?: any
  force?: boolean
  holdUntilCrawlEnd?: boolean
}

interface SSRConfig {
  external?: string[]
  noExternal?: string[]
  target?: string
  format?: string
  optimizeDeps?: OptimizeDepsConfig
}

interface WorkerConfig {
  format?: string
  plugins?: VitePlugin[]
  rollupOptions?: RollupOptions
}

interface TestConfig {
  include?: string[]
  exclude?: string[]
  testTimeout?: number
  hookTimeout?: number
  setupFiles?: string[]
  globalSetup?: string[]
  watchExclude?: string[]
  forceRerunTriggers?: string[]
  coverage?: CoverageConfig
}

interface CoverageConfig {
  provider?: string
  enabled?: boolean
  include?: string[]
  exclude?: string[]
  reporter?: string[]
  reportsDirectory?: string
  skipFull?: boolean
  thresholds?: CoverageThresholds
}

interface CoverageThresholds {
  lines?: number
  functions?: number
  branches?: number
  statements?: number
}

interface BuildAnalysis {
  bundleSize: BundleSize
  chunkAnalysis: ChunkAnalysis
  assetOptimization: AssetOptimization
  treeShaking: TreeShakingAnalysis
  healthcareOptimizations: string[]
}

interface BundleSize {
  totalSize: number
  gzippedSize: number
  sizesByChunk: Record<string, number>
  exceedsHealthcareThresholds: boolean
  recommendations: string[]
}

interface ChunkAnalysis {
  totalChunks: number
  vendorChunks: number
  asyncChunks: number
  healthcareModuleChunks: number
  chunkSizeDistribution: Record<string, number>
  recommendations: string[]
}

interface AssetOptimization {
  images: AssetTypeAnalysis
  fonts: AssetTypeAnalysis
  css: AssetTypeAnalysis
  js: AssetTypeAnalysis
  healthcareAssets: string[]
  recommendations: string[]
}

interface AssetTypeAnalysis {
  totalCount: number
  totalSize: number
  optimized: number
  needsOptimization: number
  formats: Record<string, number>
}

interface TreeShakingAnalysis {
  enabled: boolean
  unusedExports: string[]
  potentialSavings: number
  healthcareModuleOptimization: boolean
  recommendations: string[]
}

interface ViteValidationResult extends ValidationResult {
  configuration: {
    valid: boolean
    configFile: string | null
    issues: string[]
    healthcareOptimizations: {
      enabled: string[]
      missing: string[]
      score: number
    }
    environmentConfiguration: {
      valid: boolean
      variables: {
        present: string[]
        missing: string[]
        insecure: string[]
      }
    }
  }
  plugins: {
    total: number
    healthcareRelevant: number
    securityCritical: number
    missing: string[]
    issues: string[]
    recommendations: string[]
  }
  build: {
    configuration: {
      valid: boolean
      production: boolean
      development: boolean
      issues: string[]
    }
    analysis: BuildAnalysis
    performance: {
      buildTime: number
      bundleSize: number
      optimizationLevel: number
      healthcareCompliant: boolean
    }
  }
  server: {
    configuration: {
      valid: boolean
      secure: boolean
      healthcareCompliant: boolean
      issues: string[]
    }
    proxy: {
      configured: boolean
      healthcareEndpoints: string[]
      securityIssues: string[]
    }
  }
  healthcareCompliance: {
    lgpdScore: number
    performanceScore: number
    securityScore: number
    overallScore: number
    criticalIssues: string[]
    recommendations: string[]
  }
  security: SecurityResult & {
    sourceMapSecurity: {
      productionSourceMaps: boolean
      sensitiveDataExposure: boolean
      recommendations: string[]
    }
    environmentSecurity: {
      envVarLeakage: boolean
      secretsInBundle: boolean
      recommendations: string[]
    }
  }
  performance: Performance & {
    buildOptimization: {
      treeShaking: boolean
      minification: boolean
      compression: boolean
      codesplitting: boolean
      score: number
      recommendations: string[]
    }
    developmentExperience: {
      hmrPerformance: boolean
      buildSpeed: number
      reloadTime: number
      healthcareDeveloperOptimized: boolean
    }
  }
}
export class ViteValidator extends SystemValidator {
  private config: ViteConfig = {}
  private validationStartTime: number = 0

  // Healthcare-optimized build patterns for Brazilian regulations
  private readonly healthcareOptimizations = {
    // Performance optimizations for clinic workflows
    performance: [
      'vite:react-swc', // Fast React compilation
      '@vitejs/plugin-react', // React support
      'vite-plugin-pwa', // Progressive Web App for clinics
      'vite-plugin-windicss', // Utility-first CSS
      'vite-plugin-eslint', // Code quality
      'vite-bundle-analyzer', // Bundle analysis
      'vite-plugin-checker', // Type checking
    ],

    // Security plugins for LGPD compliance
    security: [
      'vite-plugin-mock', // API mocking for development
      'vite-plugin-env-compatible', // Environment variable handling
      '@rollup/plugin-replace', // Secret replacement
      'rollup-plugin-visualizer', // Bundle security analysis
      'vite-plugin-html', // HTML template security
    ],

    // Healthcare-specific optimizations
    healthcare: [
      'vite-plugin-windicss', // Responsive design for medical interfaces
      'vite-plugin-pwa', // Offline capability for clinics
      '@vitejs/plugin-legacy', // IE11 support for older systems
      'vite-plugin-mock', // Medical API simulation
      'vite-plugin-components', // Auto-import medical components
    ],
  }

  // Security patterns for healthcare builds
  private readonly securityPatterns = {
    // Environment variable patterns that should be secure
    environmentSecurity: [
      /VITE_SUPABASE_KEY|VITE_API_KEY|VITE_SECRET/i,
      /VITE_DATABASE_URL|VITE_DB_PASSWORD/i,
      /VITE_MEDICAL_API|VITE_HEALTHCARE_TOKEN/i,
      /VITE_PATIENT_DATA|VITE_LGPD_KEY/i,
      /VITE_ANVISA_TOKEN|VITE_REGULATORY_KEY/i,
    ],

    // Build patterns that could expose sensitive data
    buildSecurity: [
      /console\.log|console\.debug|debugger/i,
      /\.env|process\.env/i,
      /localhost|127\.0\.0\.1|0\.0\.0\.0/i,
      /password|secret|token|key.*=|api.*key/i,
      /patient.*id|medical.*record|cpf|rg/i,
    ],

    // Source map security patterns
    sourceMapSecurity: [
      /sourcemap.*true|sourceMap.*true/i,
      /devtool.*source.*map/i,
      /\.map$/i,
    ],
  }

  // Healthcare performance thresholds for Brazilian clinics
  private readonly performanceThresholds = {
    bundleSize: {
      critical: 3 * 1024 * 1024, // 3MB - Maximum for 3G networks
      warning: 2 * 1024 * 1024, // 2MB - Recommended for Brazilian internet
      optimal: 1 * 1024 * 1024, // 1MB - Optimal for mobile clinics
    },
    chunkSizes: {
      vendor: 800 * 1024, // 800KB - Third-party libraries
      main: 500 * 1024, // 500KB - Main application bundle
      healthcare: 300 * 1024, // 300KB - Healthcare-specific modules
    },
    buildTime: {
      development: 5000, // 5s - Development build time
      production: 120000, // 2min - Production build time
    },
  }

  constructor() {
    super()
  }

  async validate(projectPath: string,): Promise<ViteValidationResult> {
    this.validationStartTime = performance.now()

    console.log('🔍 Starting Vite validation for healthcare build optimization...',)

    const result: ViteValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      performance: {
        duration: 0,
        filesProcessed: 0,
        memoryUsage: 0,
        buildOptimization: {
          treeShaking: false,
          minification: false,
          compression: false,
          codesplitting: false,
          score: 0,
          recommendations: [],
        },
        developmentExperience: {
          hmrPerformance: false,
          buildSpeed: 0,
          reloadTime: 0,
          healthcareDeveloperOptimized: false,
        },
      },
      configuration: {
        valid: false,
        configFile: null,
        issues: [],
        healthcareOptimizations: {
          enabled: [],
          missing: [],
          score: 0,
        },
        environmentConfiguration: {
          valid: false,
          variables: {
            present: [],
            missing: [],
            insecure: [],
          },
        },
      },
      plugins: {
        total: 0,
        healthcareRelevant: 0,
        securityCritical: 0,
        missing: [],
        issues: [],
        recommendations: [],
      },
      build: {
        configuration: {
          valid: false,
          production: false,
          development: false,
          issues: [],
        },
        analysis: {
          bundleSize: {
            totalSize: 0,
            gzippedSize: 0,
            sizesByChunk: {},
            exceedsHealthcareThresholds: false,
            recommendations: [],
          },
          chunkAnalysis: {
            totalChunks: 0,
            vendorChunks: 0,
            asyncChunks: 0,
            healthcareModuleChunks: 0,
            chunkSizeDistribution: {},
            recommendations: [],
          },
          assetOptimization: {
            images: {
              totalCount: 0,
              totalSize: 0,
              optimized: 0,
              needsOptimization: 0,
              formats: {},
            },
            fonts: {
              totalCount: 0,
              totalSize: 0,
              optimized: 0,
              needsOptimization: 0,
              formats: {},
            },
            css: { totalCount: 0, totalSize: 0, optimized: 0, needsOptimization: 0, formats: {}, },
            js: { totalCount: 0, totalSize: 0, optimized: 0, needsOptimization: 0, formats: {}, },
            healthcareAssets: [],
            recommendations: [],
          },
          treeShaking: {
            enabled: false,
            unusedExports: [],
            potentialSavings: 0,
            healthcareModuleOptimization: false,
            recommendations: [],
          },
          healthcareOptimizations: [],
        },
        performance: {
          buildTime: 0,
          bundleSize: 0,
          optimizationLevel: 0,
          healthcareCompliant: false,
        },
      },
      server: {
        configuration: {
          valid: false,
          secure: false,
          healthcareCompliant: false,
          issues: [],
        },
        proxy: {
          configured: false,
          healthcareEndpoints: [],
          securityIssues: [],
        },
      },
      healthcareCompliance: {
        lgpdScore: 0,
        performanceScore: 0,
        securityScore: 0,
        overallScore: 0,
        criticalIssues: [],
        recommendations: [],
      },
      security: {
        score: 0,
        issues: [],
        recommendations: [],
        sourceMapSecurity: {
          productionSourceMaps: false,
          sensitiveDataExposure: false,
          recommendations: [],
        },
        environmentSecurity: {
          envVarLeakage: false,
          secretsInBundle: false,
          recommendations: [],
        },
      },
    }

    try {
      // 1. Validate Vite configuration
      await this.validateConfiguration(projectPath, result,)

      // 2. Analyze plugins and optimizations
      await this.validatePlugins(projectPath, result,)

      // 3. Validate build configuration
      await this.validateBuildConfiguration(projectPath, result,)

      // 4. Analyze server configuration
      await this.validateServerConfiguration(projectPath, result,)

      // 5. Healthcare compliance assessment
      await this.assessHealthcareCompliance(projectPath, result,)

      // 6. Security validation
      await this.validateSecurity(projectPath, result,)

      // 7. Performance analysis
      await this.analyzePerformance(projectPath, result,)

      // 8. Build analysis (if build artifacts exist)
      await this.analyzeBuildOutput(projectPath, result,)

      // Calculate overall validity
      result.valid = this.calculateOverallValidity(result,)
    } catch (error) {
      result.errors.push(`Vite validation failed: ${error.message}`,)
    }

    // Performance metrics
    const endTime = performance.now()
    result.performance.duration = endTime - this.validationStartTime
    result.performance.memoryUsage = process.memoryUsage().heapUsed

    console.log(`✅ Vite validation completed in ${result.performance.duration.toFixed(2,)}ms`,)
    console.log(`📊 Healthcare compliance score: ${result.healthcareCompliance.overallScore}/100`,)

    return result
  }
  private async validateConfiguration(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('🔧 Validating Vite configuration...',)

    // Check for Vite configuration files
    const configFiles = [
      'vite.config.ts',
      'vite.config.js',
      'vite.config.mjs',
      'vitest.config.ts',
      'vitest.config.js',
    ]

    let configFound = false

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)
        await this.analyzeConfigurationFile(content, configFile, result,)
        result.configuration.configFile = configFile
        configFound = true
        result.performance.filesProcessed++
        break // Use first found config file
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    if (!configFound) {
      result.configuration.issues.push('No Vite configuration file found',)
    }

    // Check package.json for Vite-related scripts and dependencies
    await this.analyzePackageJson(projectPath, result,)

    // Check environment configuration
    await this.validateEnvironmentConfiguration(projectPath, result,)

    // Validate healthcare optimizations
    this.assessHealthcareConfigurationOptimizations(result,)
  }

  private async analyzeConfigurationFile(
    content: string,
    filename: string,
    result: ViteValidationResult,
  ): Promise<void> {
    try {
      // Extract basic configuration patterns
      if (content.includes('build:',) || content.includes('build ',)) {
        result.build.configuration.production = content.includes('production',)
          || content.includes('build',)
      }

      if (content.includes('server:',) || content.includes('server ',)) {
        result.server.configuration.valid = true
      }

      // Check for development configuration
      if (content.includes('hmr',) || content.includes('hot',)) {
        result.performance.developmentExperience.hmrPerformance = true
      }

      // Extract plugins configuration
      this.extractPluginsFromConfig(content, result,)

      // Check for healthcare-specific configurations
      this.analyzeHealthcareConfigurations(content, result,)

      // Check for security configurations
      this.analyzeSecurityConfigurations(content, result,)

      // Check for performance optimizations
      this.analyzePerformanceConfigurations(content, result,)
    } catch (error) {
      result.configuration.issues.push(`Failed to parse ${filename}: ${error.message}`,)
    }
  }

  private extractPluginsFromConfig(content: string, result: ViteValidationResult,): void {
    // Extract plugin usage patterns
    const pluginPatterns = [
      /@vitejs\/plugin-react/g,
      /@vitejs\/plugin-vue/g,
      /@vitejs\/plugin-legacy/g,
      /vite-plugin-pwa/g,
      /vite-plugin-windicss/g,
      /vite-plugin-mock/g,
      /vite-plugin-eslint/g,
      /vite-bundle-analyzer/g,
      /vite-plugin-checker/g,
      /rollup-plugin-visualizer/g,
    ]

    for (const pattern of pluginPatterns) {
      const matches = content.match(pattern,)
      if (matches) {
        const pluginName = pattern.source.replace(/[\/\\g]/g, '',)

        const plugin: VitePlugin = {
          name: pluginName,
          config: null,
          healthcareRelevant: this.isHealthcareRelevantPlugin(pluginName,),
          securityImpact: this.assessPluginSecurityImpact(pluginName,),
        }

        // Note: We'll track these in the plugins validation phase
        result.plugins.total++

        if (plugin.healthcareRelevant) {
          result.plugins.healthcareRelevant++
        }

        if (plugin.securityImpact === 'high') {
          result.plugins.securityCritical++
        }
      }
    }
  }

  private analyzeHealthcareConfigurations(content: string, result: ViteValidationResult,): void {
    // Check for healthcare-optimized build targets
    if (content.includes('target:',) && (content.includes('es2015',) || content.includes('es5',))) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Legacy browser support for healthcare systems',
      )
    }

    // Check for PWA configuration (important for offline clinic access)
    if (content.includes('vite-plugin-pwa',) || content.includes('workbox',)) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Progressive Web App for offline healthcare access',
      )
    }

    // Check for CSS optimization (important for medical interface responsiveness)
    if (content.includes('windicss',) || content.includes('tailwindcss',)) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Utility-first CSS for responsive medical interfaces',
      )
    }

    // Check for bundle analysis (important for performance in clinics)
    if (content.includes('rollup-plugin-visualizer',) || content.includes('bundle-analyzer',)) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Bundle analysis for healthcare performance optimization',
      )
    }
  }

  private analyzeSecurityConfigurations(content: string, result: ViteValidationResult,): void {
    // Check for source map configuration
    if (content.includes('sourcemap',) && content.includes('false',)) {
      // Good: source maps disabled in production
    } else if (content.includes('sourcemap',) && content.includes('true',)) {
      result.security.sourceMapSecurity.productionSourceMaps = true
      result.security.issues.push('Source maps enabled - may expose sensitive healthcare code',)
    }

    // Check for environment variable handling
    if (content.includes('define',) || content.includes('process.env',)) {
      if (this.securityPatterns.environmentSecurity.some(pattern => pattern.test(content,))) {
        result.security.environmentSecurity.envVarLeakage = true
        result.security.issues.push('Potential sensitive environment variable exposure in build',)
      }
    }

    // Check for development/production environment handling
    if (!content.includes('NODE_ENV',) && !content.includes('MODE',)) {
      result.security.issues.push('Missing environment-specific configuration',)
    }
  }

  private analyzePerformanceConfigurations(content: string, result: ViteValidationResult,): void {
    // Check for tree shaking
    if (content.includes('treeshake',) || content.includes('sideEffects',)) {
      result.performance.buildOptimization.treeShaking = true
    }

    // Check for minification
    if (content.includes('minify',) && !content.includes('false',)) {
      result.performance.buildOptimization.minification = true
    }

    // Check for code splitting
    if (content.includes('manualChunks',) || content.includes('splitChunks',)) {
      result.performance.buildOptimization.codesplitting = true
    }

    // Check for compression
    if (
      content.includes('gzip',) || content.includes('brotli',) || content.includes('compression',)
    ) {
      result.performance.buildOptimization.compression = true
    }
  }

  private async analyzePackageJson(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    const packageJsonPath = join(projectPath, 'package.json',)

    try {
      await access(packageJsonPath, constants.F_OK,)
      const content = await readFile(packageJsonPath, 'utf-8',)
      const packageJson = JSON.parse(content,)

      // Check Vite version
      const viteVersion = packageJson.dependencies?.vite || packageJson.devDependencies?.vite
      if (!viteVersion) {
        result.configuration.issues.push('Vite not found in package.json dependencies',)
        return
      }

      // Check for healthcare-relevant dependencies
      this.analyzeHealthcareDependencies(packageJson, result,)

      // Check for build scripts
      this.analyzeBuildScripts(packageJson, result,)

      result.performance.filesProcessed++
    } catch (error) {
      result.configuration.issues.push('Failed to analyze package.json',)
    }
  }

  private analyzeHealthcareDependencies(packageJson: any, result: ViteValidationResult,): void {
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies, }

    // Healthcare-relevant dependencies
    const healthcareDeps = [
      'react-query',
      '@tanstack/react-query', // Data fetching for medical records
      'react-hook-form',
      'formik', // Form handling for patient data
      'date-fns',
      'dayjs',
      'moment', // Date handling for appointments
      'chart.js',
      'recharts',
      'd3', // Medical data visualization
      'react-router-dom',
      '@tanstack/react-router', // Healthcare app navigation
      'axios',
      'fetch', // API communication for medical data
      '@supabase/supabase-js', // Healthcare database
      'typescript', // Type safety for medical data
    ]

    for (const dep of healthcareDeps) {
      if (allDeps[dep]) {
        result.configuration.healthcareOptimizations.enabled.push(`Healthcare dependency: ${dep}`,)
      }
    }

    // Security-relevant dependencies
    const securityDeps = ['helmet', 'cors', 'express-rate-limit', 'bcrypt', 'jsonwebtoken',]
    for (const dep of securityDeps) {
      if (allDeps[dep]) {
        result.plugins.securityCritical++
      }
    }
  }

  private analyzeBuildScripts(packageJson: any, result: ViteValidationResult,): void {
    const scripts = packageJson.scripts || {}

    // Check for build scripts
    if (scripts.build) {
      result.build.configuration.production = true

      // Check for healthcare-optimized build commands
      if (scripts.build.includes('--mode production',) || scripts.build.includes('--minify',)) {
        result.configuration.healthcareOptimizations.enabled.push('Production build optimization',)
      }
    }

    // Check for development scripts
    if (scripts.dev || scripts.start) {
      result.build.configuration.development = true
    }

    // Check for preview scripts (important for healthcare testing)
    if (scripts.preview) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Build preview for healthcare testing',
      )
    }

    // Check for type checking scripts
    if (scripts['type-check'] || scripts.tsc) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Type checking for healthcare data safety',
      )
    }
  }
  private async validateEnvironmentConfiguration(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    // Check for environment files
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production', '.env.example',]

    for (const envFile of envFiles) {
      const filePath = join(projectPath, envFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        // Check for Vite-specific environment variables
        const viteVars = content.match(/VITE_[A-Z_]+/g,) || []
        result.configuration.environmentConfiguration.variables.present.push(...viteVars,)

        // Check for insecure patterns
        for (const pattern of this.securityPatterns.environmentSecurity) {
          if (pattern.test(content,)) {
            result.configuration.environmentConfiguration.variables.insecure.push(
              `Potentially insecure environment variable in ${envFile}`,
            )
          }
        }

        result.performance.filesProcessed++
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Check for required healthcare environment variables
    const requiredHealthcareVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_APP_VERSION',
      'VITE_NODE_ENV',
    ]

    for (const requiredVar of requiredHealthcareVars) {
      if (!result.configuration.environmentConfiguration.variables.present.includes(requiredVar,)) {
        result.configuration.environmentConfiguration.variables.missing.push(requiredVar,)
      }
    }

    result.configuration.environmentConfiguration.valid =
      result.configuration.environmentConfiguration.variables.missing.length === 0
      && result.configuration.environmentConfiguration.variables.insecure.length === 0
  }

  private assessHealthcareConfigurationOptimizations(result: ViteValidationResult,): void {
    const totalOptimizations = Object.values(this.healthcareOptimizations,).flat().length
    const enabledOptimizations = result.configuration.healthcareOptimizations.enabled.length

    result.configuration.healthcareOptimizations.score = totalOptimizations > 0
      ? (enabledOptimizations / totalOptimizations) * 100
      : 0

    // Add missing optimizations
    const allHealthcareOptimizations = Object.values(this.healthcareOptimizations,).flat()
    for (const optimization of allHealthcareOptimizations) {
      const isEnabled = result.configuration.healthcareOptimizations.enabled.some(enabled =>
        enabled.includes(optimization,) || optimization.includes('plugin',)
      )

      if (!isEnabled) {
        result.configuration.healthcareOptimizations.missing.push(optimization,)
      }
    }

    result.configuration.valid = result.configuration.issues.length === 0
      && result.configuration.healthcareOptimizations.score >= 60
  }

  private async validatePlugins(projectPath: string, result: ViteValidationResult,): Promise<void> {
    console.log('🔌 Validating Vite plugins for healthcare optimization...',)

    // Analyze plugins from package.json
    await this.analyzePluginsFromPackageJson(projectPath, result,)

    // Check for missing healthcare-essential plugins
    this.checkMissingHealthcarePlugins(result,)

    // Validate plugin configurations
    await this.validatePluginConfigurations(projectPath, result,)

    // Generate plugin recommendations
    this.generatePluginRecommendations(result,)
  }

  private async analyzePluginsFromPackageJson(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    const packageJsonPath = join(projectPath, 'package.json',)

    try {
      const content = await readFile(packageJsonPath, 'utf-8',)
      const packageJson = JSON.parse(content,)
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies, }

      // Analyze each plugin
      for (const [depName, version,] of Object.entries(allDeps,)) {
        if (depName.includes('vite-plugin',) || depName.includes('@vitejs/plugin',)) {
          result.plugins.total++

          if (this.isHealthcareRelevantPlugin(depName,)) {
            result.plugins.healthcareRelevant++
          }

          const securityImpact = this.assessPluginSecurityImpact(depName,)
          if (securityImpact === 'high') {
            result.plugins.securityCritical++
          }
        }
      }
    } catch (error) {
      result.plugins.issues.push('Failed to analyze plugins from package.json',)
    }
  }

  private isHealthcareRelevantPlugin(pluginName: string,): boolean {
    const healthcarePlugins = [
      '@vitejs/plugin-react', // React support for medical UIs
      '@vitejs/plugin-legacy', // IE11 support for older clinic systems
      'vite-plugin-pwa', // Offline capability for clinics
      'vite-plugin-windicss', // Responsive design for medical interfaces
      'vite-plugin-mock', // API mocking for medical development
      'vite-plugin-eslint', // Code quality for medical data safety
      'vite-bundle-analyzer', // Performance analysis for clinic networks
      'vite-plugin-checker', // Type checking for healthcare data
      'rollup-plugin-visualizer', // Bundle analysis for healthcare optimization
    ]

    return healthcarePlugins.some(healthcarePlugin =>
      pluginName.includes(healthcarePlugin,) || healthcarePlugin.includes(pluginName,)
    )
  }

  private assessPluginSecurityImpact(pluginName: string,): 'low' | 'medium' | 'high' {
    const highSecurityPlugins = [
      'vite-plugin-mock', // API mocking could expose endpoints
      '@rollup/plugin-replace', // String replacement could leak secrets
      'vite-plugin-html', // HTML manipulation could introduce XSS
      'vite-plugin-env-compatible', // Environment variable handling
    ]

    const mediumSecurityPlugins = [
      'vite-bundle-analyzer', // Bundle analysis reveals code structure
      'rollup-plugin-visualizer', // Bundle visualization
      'vite-plugin-checker', // Type checking might expose internal types
    ]

    if (highSecurityPlugins.some(plugin => pluginName.includes(plugin,))) {
      return 'high'
    }

    if (mediumSecurityPlugins.some(plugin => pluginName.includes(plugin,))) {
      return 'medium'
    }

    return 'low'
  }

  private checkMissingHealthcarePlugins(result: ViteValidationResult,): void {
    const essentialHealthcarePlugins = [
      '@vitejs/plugin-react', // Essential for React healthcare UIs
      'vite-plugin-pwa', // Offline capability for clinic reliability
      'vite-plugin-eslint', // Code quality for patient data safety
      'vite-bundle-analyzer', // Performance monitoring for clinic networks
    ]

    for (const plugin of essentialHealthcarePlugins) {
      // This is a simplified check - in real implementation would check actual dependencies
      const found = result.plugins.total > 0 // Placeholder logic

      if (!found) {
        result.plugins.missing.push(plugin,)
      }
    }
  }

  private async validatePluginConfigurations(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    // Check for plugin configuration files
    const configFiles = [
      'vite.config.ts',
      'vite.config.js',
      'postcss.config.js',
      'tailwind.config.js',
      'windi.config.ts',
    ]

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        // Check for healthcare-specific plugin configurations
        this.validateHealthcarePluginConfig(content, configFile, result,)

        result.performance.filesProcessed++
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private validateHealthcarePluginConfig(
    content: string,
    filename: string,
    result: ViteValidationResult,
  ): void {
    // PWA configuration validation
    if (filename.includes('vite.config',) && content.includes('vite-plugin-pwa',)) {
      if (content.includes('offline',) || content.includes('workbox',)) {
        result.configuration.healthcareOptimizations.enabled.push(
          'PWA offline configuration for healthcare',
        )
      } else {
        result.plugins.issues.push('PWA plugin found but offline capability not configured',)
      }
    }

    // CSS framework validation
    if (
      (filename.includes('tailwind',) || filename.includes('windi',))
      && content.includes('responsive',)
    ) {
      result.configuration.healthcareOptimizations.enabled.push(
        'Responsive CSS framework for medical interfaces',
      )
    }

    // Mock plugin validation
    if (content.includes('vite-plugin-mock',) && content.includes('/api/',)) {
      result.configuration.healthcareOptimizations.enabled.push(
        'API mocking for healthcare development',
      )
    }
  }

  private generatePluginRecommendations(result: ViteValidationResult,): void {
    // Healthcare-specific plugin recommendations
    if (result.plugins.healthcareRelevant < 3) {
      result.plugins.recommendations.push(
        'Add more healthcare-relevant plugins for optimal medical UI development',
      )
    }

    if (result.plugins.missing.includes('@vitejs/plugin-react',)) {
      result.plugins.recommendations.push(
        'Add @vitejs/plugin-react for React healthcare UI development',
      )
    }

    if (result.plugins.missing.includes('vite-plugin-pwa',)) {
      result.plugins.recommendations.push(
        'Add vite-plugin-pwa for offline healthcare application capability',
      )
    }

    if (result.plugins.missing.includes('vite-plugin-eslint',)) {
      result.plugins.recommendations.push(
        'Add vite-plugin-eslint for code quality in healthcare data handling',
      )
    }

    if (result.plugins.securityCritical > 0 && result.security.score < 80) {
      result.plugins.recommendations.push(
        'Review security configurations for plugins handling sensitive healthcare data',
      )
    }
  }
  private async validateBuildConfiguration(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('🏗️ Validating build configuration for healthcare performance...',)

    // Check build configuration in vite.config files
    await this.analyzeBuildConfigFromViteConfig(projectPath, result,)

    // Check for build artifacts and analyze them
    await this.analyzeBuildDirectory(projectPath, result,)

    // Validate healthcare build requirements
    this.validateHealthcareBuildRequirements(result,)
  }

  private async analyzeBuildConfigFromViteConfig(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    const configFiles = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs',]

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        // Extract build configuration
        this.extractBuildConfig(content, result,)

        result.performance.filesProcessed++
        break // Use first found config
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private extractBuildConfig(content: string, result: ViteValidationResult,): void {
    // Check for production optimizations
    if (content.includes('build:',) || content.includes('build ',)) {
      result.build.configuration.production = true

      // Check for minification
      if (content.includes('minify',) && !content.includes('false',)) {
        result.performance.buildOptimization.minification = true
      }

      // Check for tree shaking
      if (content.includes('rollupOptions',) || content.includes('treeshake',)) {
        result.performance.buildOptimization.treeShaking = true
      }

      // Check for code splitting
      if (content.includes('manualChunks',) || content.includes('chunkFileNames',)) {
        result.performance.buildOptimization.codesplitting = true
      }

      // Check for source maps
      if (content.includes('sourcemap',)) {
        if (content.includes('sourcemap: false',) || content.includes('sourcemap:false',)) {
          // Good: source maps disabled in production
        } else if (content.includes('sourcemap: true',) || content.includes('sourcemap:true',)) {
          result.security.sourceMapSecurity.productionSourceMaps = true
        }
      }

      // Check for asset optimization
      if (content.includes('assetsInlineLimit',) || content.includes('assetsDir',)) {
        result.build.analysis.assetOptimization.healthcareAssets.push(
          'Asset optimization configured',
        )
      }

      // Check for healthcare-specific build targets
      if (content.includes('target:',) && content.includes('es2015',)) {
        result.build.analysis.healthcareOptimizations.push(
          'ES2015 target for older healthcare systems',
        )
      }

      if (content.includes('polyfillModulePreload',)) {
        result.build.analysis.healthcareOptimizations.push(
          'Module preload polyfill for legacy browsers',
        )
      }
    }
  }

  private async analyzeBuildDirectory(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    // Check for build output directory
    const buildDirs = ['dist', 'build', 'out',]

    for (const buildDir of buildDirs) {
      const buildPath = join(projectPath, buildDir,)
      try {
        await access(buildPath, constants.F_OK,)
        await this.analyzeBuildOutput(buildPath, result,)
        break // Use first found build directory
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }
  }

  private async analyzeBuildOutput(
    buildPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    try {
      const files = await readdir(buildPath, { withFileTypes: true, },)

      for (const file of files) {
        if (file.isFile()) {
          const filePath = join(buildPath, file.name,)
          const stats = await this.getFileStats(filePath,)

          // Analyze different file types
          if (file.name.endsWith('.js',)) {
            result.build.analysis.assetOptimization.js.totalCount++
            result.build.analysis.assetOptimization.js.totalSize += stats.size

            // Check if it's a chunk file
            if (file.name.includes('chunk',) || file.name.includes('vendor',)) {
              result.build.analysis.chunkAnalysis.totalChunks++

              if (file.name.includes('vendor',)) {
                result.build.analysis.chunkAnalysis.vendorChunks++
              }

              // Check chunk size against healthcare thresholds
              if (stats.size > this.performanceThresholds.chunkSizes.vendor) {
                result.build.analysis.chunkAnalysis.recommendations.push(
                  `Large chunk detected: ${file.name} (${this.formatBytes(stats.size,)})`,
                )
              }
            }

            // Check for healthcare-related chunks
            if (this.isHealthcareRelatedFile(file.name,)) {
              result.build.analysis.chunkAnalysis.healthcareModuleChunks++
            }
          } else if (file.name.endsWith('.css',)) {
            result.build.analysis.assetOptimization.css.totalCount++
            result.build.analysis.assetOptimization.css.totalSize += stats.size
          } else if (this.isImageFile(file.name,)) {
            result.build.analysis.assetOptimization.images.totalCount++
            result.build.analysis.assetOptimization.images.totalSize += stats.size
          } else if (this.isFontFile(file.name,)) {
            result.build.analysis.assetOptimization.fonts.totalCount++
            result.build.analysis.assetOptimization.fonts.totalSize += stats.size
          }

          // Check for source map files in production
          if (file.name.endsWith('.map',)) {
            result.security.sourceMapSecurity.productionSourceMaps = true
            result.security.sourceMapSecurity.recommendations.push(
              'Remove source maps from production build to prevent code exposure',
            )
          }

          result.performance.filesProcessed++
        }
      }

      // Calculate total bundle size
      const totalSize = result.build.analysis.assetOptimization.js.totalSize
        + result.build.analysis.assetOptimization.css.totalSize
        + result.build.analysis.assetOptimization.images.totalSize
        + result.build.analysis.assetOptimization.fonts.totalSize

      result.build.analysis.bundleSize.totalSize = totalSize
      result.build.performance.bundleSize = totalSize

      // Check against healthcare performance thresholds
      if (totalSize > this.performanceThresholds.bundleSize.critical) {
        result.build.analysis.bundleSize.exceedsHealthcareThresholds = true
        result.build.analysis.bundleSize.recommendations.push(
          `Bundle size ${this.formatBytes(totalSize,)} exceeds healthcare network threshold`,
        )
      }
    } catch (error) {
      result.build.configuration.issues.push(`Failed to analyze build output: ${error.message}`,)
    }
  }

  private async getFileStats(filePath: string,): Promise<{ size: number }> {
    try {
      const stats = await readFile(filePath,)
      return { size: stats.length, }
    } catch (error) {
      return { size: 0, }
    }
  }

  private isHealthcareRelatedFile(filename: string,): boolean {
    const healthcareKeywords = [
      'patient',
      'medical',
      'health',
      'clinic',
      'appointment',
      'prescription',
      'diagnosis',
      'treatment',
      'doctor',
      'nurse',
    ]

    const lowerFilename = filename.toLowerCase()
    return healthcareKeywords.some(keyword => lowerFilename.includes(keyword,))
  }

  private isImageFile(filename: string,): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',]
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext,))
  }

  private isFontFile(filename: string,): boolean {
    const fontExtensions = ['.woff', '.woff2', '.ttf', '.otf', '.eot',]
    return fontExtensions.some(ext => filename.toLowerCase().endsWith(ext,))
  }

  private formatBytes(bytes: number,): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB',]
    const i = Math.floor(Math.log(bytes,) / Math.log(k,),)
    return parseFloat((bytes / Math.pow(k, i,)).toFixed(2,),) + ' ' + sizes[i]
  }

  private validateHealthcareBuildRequirements(result: ViteValidationResult,): void {
    // Check if build meets healthcare performance requirements
    let score = 100

    // Bundle size check
    if (result.build.analysis.bundleSize.exceedsHealthcareThresholds) {
      score -= 30
      result.build.configuration.issues.push(
        'Bundle size exceeds healthcare network performance thresholds',
      )
    }

    // Optimization checks
    if (!result.performance.buildOptimization.minification) {
      score -= 20
      result.build.configuration.issues.push('Minification not enabled for production build',)
    }

    if (!result.performance.buildOptimization.treeShaking) {
      score -= 15
      result.build.configuration.issues.push('Tree shaking not configured for bundle optimization',)
    }

    if (!result.performance.buildOptimization.codesplitting) {
      score -= 10
      result.build.configuration.issues.push(
        'Code splitting not configured for healthcare module loading',
      )
    }

    // Security checks
    if (result.security.sourceMapSecurity.productionSourceMaps) {
      score -= 25
      result.build.configuration.issues.push(
        'Source maps enabled in production build - security risk',
      )
    }

    result.build.performance.optimizationLevel = Math.max(0, score,)
    result.build.performance.healthcareCompliant = score >= 70

    result.build.configuration.valid = result.build.configuration.issues.length === 0
  }

  private async validateServerConfiguration(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('🖥️ Validating server configuration for healthcare development...',)

    // Check server configuration in vite config
    await this.analyzeServerConfigFromViteConfig(projectPath, result,)

    // Check for proxy configuration (important for healthcare API access)
    this.analyzeProxyConfiguration(result,)

    // Validate healthcare-specific server requirements
    this.validateHealthcareServerRequirements(result,)
  }

  private async analyzeServerConfigFromViteConfig(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    const configFiles = ['vite.config.ts', 'vite.config.js',]

    for (const configFile of configFiles) {
      const filePath = join(projectPath, configFile,)
      try {
        await access(filePath, constants.F_OK,)
        const content = await readFile(filePath, 'utf-8',)

        // Extract server configuration
        this.extractServerConfig(content, result,)

        break // Use first found config
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  private extractServerConfig(content: string, result: ViteValidationResult,): void {
    if (content.includes('server:',) || content.includes('server ',)) {
      result.server.configuration.valid = true

      // Check for HTTPS configuration
      if (content.includes('https:',) && content.includes('true',)) {
        result.server.configuration.secure = true
      } else if (content.includes('https',) && !content.includes('false',)) {
        result.server.configuration.secure = true
      }

      // Check for host configuration
      if (content.includes('host:',) && content.includes('0.0.0.0',)) {
        result.server.configuration.issues.push(
          'Server configured to listen on all interfaces - potential security risk',
        )
      }

      // Check for port configuration
      if (content.includes('port:',)) {
        const portMatch = content.match(/port:\s*(\d+)/,)
        if (portMatch) {
          const port = parseInt(portMatch[1],)
          if (port < 1024) {
            result.server.configuration.issues.push(
              'Server using privileged port - may require elevated permissions',
            )
          }
        }
      }

      // Check for proxy configuration
      if (content.includes('proxy:',)) {
        result.server.proxy.configured = true
        this.extractProxyConfig(content, result,)
      }

      // Check for CORS configuration
      if (content.includes('cors:',)) {
        if (content.includes('cors: true',) || content.includes('cors:true',)) {
          result.server.configuration.issues.push(
            'CORS enabled for all origins - potential security risk for healthcare data',
          )
        }
      }
    }
  }

  private extractProxyConfig(content: string, result: ViteValidationResult,): void {
    // Look for healthcare API endpoints in proxy configuration
    const healthcareEndpoints = [
      '/api/patients',
      '/api/medical',
      '/api/health',
      '/api/clinic',
      '/api/appointments',
      '/api/prescriptions',
      '/api/diagnosis',
      '/supabase',
      '/auth',
      '/medical-records',
    ]

    for (const endpoint of healthcareEndpoints) {
      if (content.includes(endpoint,)) {
        result.server.proxy.healthcareEndpoints.push(endpoint,)
      }
    }

    // Check for potential security issues in proxy configuration
    if (content.includes('http://',) && !content.includes('localhost',)) {
      result.server.proxy.securityIssues.push(
        'HTTP proxy target detected - should use HTTPS for healthcare data',
      )
    }

    if (content.includes('changeOrigin: false',)) {
      result.server.proxy.securityIssues.push(
        'Proxy changeOrigin disabled - may cause CORS issues with healthcare APIs',
      )
    }
  }

  private analyzeProxyConfiguration(result: ViteValidationResult,): void {
    if (result.server.proxy.configured) {
      // Validate healthcare proxy endpoints
      if (result.server.proxy.healthcareEndpoints.length > 0) {
        result.server.configuration.healthcareCompliant = true
      } else {
        result.server.configuration.issues.push(
          'No healthcare API endpoints detected in proxy configuration',
        )
      }

      // Check for security issues
      if (result.server.proxy.securityIssues.length > 0) {
        result.server.configuration.secure = false
      }
    } else {
      result.server.configuration.issues.push(
        'No proxy configuration found - may be needed for healthcare API integration',
      )
    }
  }

  private validateHealthcareServerRequirements(result: ViteValidationResult,): void {
    // Healthcare server requirements
    let healthcareCompliant = true

    // HTTPS requirement for healthcare data
    if (!result.server.configuration.secure) {
      healthcareCompliant = false
      result.server.configuration.issues.push(
        'HTTPS not configured - required for healthcare data transmission',
      )
    }

    // Proxy configuration for healthcare APIs
    if (!result.server.proxy.configured) {
      result.server.configuration.issues.push(
        'Consider configuring proxy for healthcare API integration',
      )
    }

    // Security checks
    if (result.server.proxy.securityIssues.length > 0) {
      healthcareCompliant = false
    }

    result.server.configuration.healthcareCompliant = healthcareCompliant
    result.server.configuration.valid = result.server.configuration.issues.length === 0
  }
  private async assessHealthcareCompliance(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('🏥 Assessing healthcare compliance for Vite configuration...',)

    let lgpdScore = 0
    let performanceScore = 0
    let securityScore = 0
    const maxScore = 100

    // LGPD Compliance Assessment (Data Protection)
    lgpdScore += this.assessLGPDBuildCompliance(result,) * 30 // 30 points
    lgpdScore += this.assessLGPDEnvironmentCompliance(result,) * 25 // 25 points
    lgpdScore += this.assessLGPDSourceMapCompliance(result,) * 20 // 20 points
    lgpdScore += this.assessLGPDAssetCompliance(result,) * 15 // 15 points
    lgpdScore += this.assessLGPDDevelopmentCompliance(result,) * 10 // 10 points

    // Performance Compliance for Healthcare Networks
    performanceScore += this.assessHealthcarePerformanceCompliance(result,) * 40 // 40 points
    performanceScore += this.assessBundleOptimization(result,) * 30 // 30 points
    performanceScore += this.assessAssetOptimization(result,) * 20 // 20 points
    performanceScore += this.assessDevelopmentPerformance(result,) * 10 // 10 points

    // Security Compliance for Medical Data
    securityScore += this.assessMedicalDataSecurity(result,) * 35 // 35 points
    securityScore += this.assessBuildSecurity(result,) * 30 // 30 points
    securityScore += this.assessServerSecurity(result,) * 25 // 25 points
    securityScore += this.assessEnvironmentSecurity(result,) * 10 // 10 points

    // Calculate overall score
    const overallScore = (lgpdScore + performanceScore + securityScore) / 3

    result.healthcareCompliance.lgpdScore = Math.min(lgpdScore, maxScore,)
    result.healthcareCompliance.performanceScore = Math.min(performanceScore, maxScore,)
    result.healthcareCompliance.securityScore = Math.min(securityScore, maxScore,)
    result.healthcareCompliance.overallScore = Math.min(overallScore, maxScore,)

    // Generate recommendations
    this.generateHealthcareComplianceRecommendations(result,)

    // Identify critical issues
    this.identifyHealthcareCriticalIssues(result,)
  }

  private assessLGPDBuildCompliance(result: ViteValidationResult,): number {
    let score = 0

    // Source map compliance (data exposure prevention)
    if (!result.security.sourceMapSecurity.productionSourceMaps) {
      score += 0.4 // 40% of LGPD build compliance
    }

    // Environment variable compliance
    if (result.configuration.environmentConfiguration.variables.insecure.length === 0) {
      score += 0.3 // 30% of LGPD build compliance
    }

    // Minification compliance (code obfuscation)
    if (result.performance.buildOptimization.minification) {
      score += 0.2 // 20% of LGPD build compliance
    }

    // Healthcare asset protection
    if (result.build.analysis.assetOptimization.healthcareAssets.length > 0) {
      score += 0.1 // 10% of LGPD build compliance
    }

    return score
  }

  private assessLGPDEnvironmentCompliance(result: ViteValidationResult,): number {
    const totalVars = result.configuration.environmentConfiguration.variables.present.length
    const insecureVars = result.configuration.environmentConfiguration.variables.insecure.length

    if (totalVars === 0) return 1.0 // No environment variables to assess

    return Math.max(0, (totalVars - insecureVars) / totalVars,)
  }

  private assessLGPDSourceMapCompliance(result: ViteValidationResult,): number {
    // Source maps in production violate LGPD by potentially exposing internal code structure
    return result.security.sourceMapSecurity.productionSourceMaps ? 0 : 1.0
  }

  private assessLGPDAssetCompliance(result: ViteValidationResult,): number {
    // Basic compliance if assets are optimized (reduces data transmission)
    const totalAssets = result.build.analysis.assetOptimization.images.totalCount
      + result.build.analysis.assetOptimization.css.totalCount
      + result.build.analysis.assetOptimization.js.totalCount

    if (totalAssets === 0) return 1.0

    const optimizedAssets = result.build.analysis.assetOptimization.images.optimized
      + result.build.analysis.assetOptimization.css.optimized
      + result.build.analysis.assetOptimization.js.optimized

    return optimizedAssets / totalAssets
  }

  private assessLGPDDevelopmentCompliance(result: ViteValidationResult,): number {
    let score = 0

    // HMR compliance (prevents data leakage during development)
    if (result.performance.developmentExperience.hmrPerformance) {
      score += 0.5
    }

    // Secure server configuration
    if (result.server.configuration.secure) {
      score += 0.3
    }

    // Proxy security for healthcare APIs
    if (result.server.proxy.securityIssues.length === 0) {
      score += 0.2
    }

    return score
  }

  private assessHealthcarePerformanceCompliance(result: ViteValidationResult,): number {
    let score = 0

    // Bundle size compliance
    if (!result.build.analysis.bundleSize.exceedsHealthcareThresholds) {
      score += 0.4 // 40% of performance compliance
    } else {
      // Partial score based on how much it exceeds
      const exceedRatio = result.build.analysis.bundleSize.totalSize
        / this.performanceThresholds.bundleSize.critical
      score += Math.max(0, 0.4 * (2 - exceedRatio),) // Diminishing returns for larger bundles
    }

    // Optimization compliance
    const optimizations = [
      result.performance.buildOptimization.minification,
      result.performance.buildOptimization.treeShaking,
      result.performance.buildOptimization.codesplitting,
      result.performance.buildOptimization.compression,
    ].filter(Boolean,).length

    score += (optimizations / 4) * 0.4 // 40% of performance compliance

    // Healthcare-specific optimizations
    if (result.build.analysis.healthcareOptimizations.length > 0) {
      score += 0.2 // 20% bonus for healthcare optimizations
    }

    return score
  }

  private assessBundleOptimization(result: ViteValidationResult,): number {
    const optimizationCount = [
      result.performance.buildOptimization.minification,
      result.performance.buildOptimization.treeShaking,
      result.performance.buildOptimization.codesplitting,
      result.performance.buildOptimization.compression,
    ].filter(Boolean,).length

    return optimizationCount / 4
  }

  private assessAssetOptimization(result: ViteValidationResult,): number {
    const totalAssets = result.build.analysis.assetOptimization.images.totalCount
      + result.build.analysis.assetOptimization.css.totalCount
      + result.build.analysis.assetOptimization.js.totalCount
      + result.build.analysis.assetOptimization.fonts.totalCount

    if (totalAssets === 0) return 1.0

    const optimizedAssets = result.build.analysis.assetOptimization.images.optimized
      + result.build.analysis.assetOptimization.css.optimized
      + result.build.analysis.assetOptimization.js.optimized
      + result.build.analysis.assetOptimization.fonts.optimized

    return optimizedAssets / totalAssets
  }

  private assessDevelopmentPerformance(result: ViteValidationResult,): number {
    let score = 0

    if (result.performance.developmentExperience.hmrPerformance) score += 0.5
    if (result.configuration.healthcareOptimizations.score > 60) score += 0.3
    if (result.plugins.healthcareRelevant > 2) score += 0.2

    return score
  }

  private assessMedicalDataSecurity(result: ViteValidationResult,): number {
    let score = 0

    // Source map security for medical code protection
    if (!result.security.sourceMapSecurity.productionSourceMaps) {
      score += 0.3
    }

    // Environment security for medical credentials
    if (
      !result.security.environmentSecurity.envVarLeakage
      && !result.security.environmentSecurity.secretsInBundle
    ) {
      score += 0.4
    }

    // Server security for medical data transmission
    if (result.server.configuration.secure && result.server.proxy.securityIssues.length === 0) {
      score += 0.3
    }

    return score
  }

  private assessBuildSecurity(result: ViteValidationResult,): number {
    let score = 1.0

    // Deduct points for security issues
    if (result.security.sourceMapSecurity.productionSourceMaps) score -= 0.4
    if (result.security.environmentSecurity.secretsInBundle) score -= 0.3
    if (result.build.configuration.issues.some(issue => issue.includes('security',))) score -= 0.2
    if (result.configuration.issues.some(issue => issue.includes('insecure',))) score -= 0.1

    return Math.max(0, score,)
  }

  private assessServerSecurity(result: ViteValidationResult,): number {
    let score = 0

    if (result.server.configuration.secure) score += 0.4
    if (result.server.proxy.securityIssues.length === 0) score += 0.3
    if (result.server.configuration.healthcareCompliant) score += 0.3

    return score
  }

  private assessEnvironmentSecurity(result: ViteValidationResult,): number {
    const totalVars = result.configuration.environmentConfiguration.variables.present.length
    const insecureVars = result.configuration.environmentConfiguration.variables.insecure.length

    if (totalVars === 0) return 1.0

    return Math.max(0, (totalVars - insecureVars) / totalVars,)
  }

  private async validateSecurity(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('🔒 Validating security configurations for healthcare data protection...',)

    // Initialize security results
    result.security.sourceMapSecurity = {
      productionSourceMaps: false,
      sensitiveDataExposure: false,
      recommendations: [],
    }

    result.security.environmentSecurity = {
      envVarLeakage: false,
      secretsInBundle: false,
      recommendations: [],
    }

    // Check build security
    await this.validateBuildSecurity(projectPath, result,)

    // Check environment security
    this.validateEnvironmentSecurity(result,)

    // Check server security
    this.validateServerSecurity(result,)

    // Calculate overall security score
    this.calculateSecurityScore(result,)
  }

  private async validateBuildSecurity(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    // Check for sensitive data in build files
    const buildDirs = ['dist', 'build', 'out',]

    for (const buildDir of buildDirs) {
      const buildPath = join(projectPath, buildDir,)
      try {
        await access(buildPath, constants.F_OK,)
        await this.scanBuildForSensitiveData(buildPath, result,)
        break
      } catch (error) {
        // Build directory doesn't exist
      }
    }
  }

  private async scanBuildForSensitiveData(
    buildPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    try {
      const files = await readdir(buildPath, { withFileTypes: true, },)

      for (const file of files) {
        if (file.isFile() && (file.name.endsWith('.js',) || file.name.endsWith('.css',))) {
          const filePath = join(buildPath, file.name,)
          const content = await readFile(filePath, 'utf-8',)

          // Check for sensitive patterns
          for (const pattern of this.securityPatterns.buildSecurity) {
            if (pattern.test(content,)) {
              result.security.environmentSecurity.secretsInBundle = true
              result.security.issues.push(
                `Potential sensitive data found in build file: ${file.name}`,
              )
            }
          }

          result.performance.filesProcessed++
        }
      }
    } catch (error) {
      result.security.issues.push(
        `Failed to scan build files for sensitive data: ${error.message}`,
      )
    }
  }

  private validateEnvironmentSecurity(result: ViteValidationResult,): void {
    // Check for insecure environment variables
    if (result.configuration.environmentConfiguration.variables.insecure.length > 0) {
      result.security.environmentSecurity.envVarLeakage = true
      result.security.issues.push('Potentially insecure environment variables detected',)
    }

    // Generate environment security recommendations
    if (result.security.environmentSecurity.envVarLeakage) {
      result.security.environmentSecurity.recommendations.push(
        'Review environment variable patterns for healthcare data security',
      )
    }

    if (result.configuration.environmentConfiguration.variables.missing.length > 0) {
      result.security.environmentSecurity.recommendations.push(
        'Add missing environment variables for complete healthcare configuration',
      )
    }
  }

  private validateServerSecurity(result: ViteValidationResult,): void {
    // Check server security issues
    if (!result.server.configuration.secure) {
      result.security.issues.push('HTTPS not configured for healthcare data transmission',)
    }

    if (result.server.proxy.securityIssues.length > 0) {
      result.security.issues.push(
        'Proxy security issues detected for healthcare API communication',
      )
    }

    // Generate server security recommendations
    if (!result.server.configuration.secure) {
      result.security.recommendations.push(
        'Configure HTTPS for secure healthcare data transmission',
      )
    }

    if (result.server.proxy.configured && result.server.proxy.securityIssues.length > 0) {
      result.security.recommendations.push(
        'Fix proxy security issues for healthcare API integration',
      )
    }
  }

  private calculateSecurityScore(result: ViteValidationResult,): void {
    let score = 100

    // Deduct points for security issues
    score -= result.security.issues.length * 15
    score -= result.security.sourceMapSecurity.productionSourceMaps ? 25 : 0
    score -= result.security.environmentSecurity.envVarLeakage ? 20 : 0
    score -= result.security.environmentSecurity.secretsInBundle ? 30 : 0
    score -= result.server.proxy.securityIssues.length * 10

    // Bonus points for good security practices
    if (result.server.configuration.secure) score += 10
    if (result.performance.buildOptimization.minification) score += 5
    if (result.configuration.environmentConfiguration.valid) score += 5

    result.security.score = Math.max(0, Math.min(100, score,),)

    // Generate general security recommendations
    if (result.security.score < 70) {
      result.security.recommendations.push(
        'Implement comprehensive security measures for healthcare data protection',
      )
    }

    if (result.security.score < 50) {
      result.security.recommendations.push(
        'Critical security issues detected - immediate review required',
      )
    }
  }

  private async analyzePerformance(
    projectPath: string,
    result: ViteValidationResult,
  ): Promise<void> {
    console.log('⚡ Analyzing performance optimizations for healthcare networks...',)

    // Calculate build optimization score
    this.calculateBuildOptimizationScore(result,)

    // Assess development experience
    this.assessDevelopmentExperience(result,)

    // Generate performance recommendations
    this.generatePerformanceRecommendations(result,)
  }

  private calculateBuildOptimizationScore(result: ViteValidationResult,): void {
    const optimizations = [
      result.performance.buildOptimization.treeShaking,
      result.performance.buildOptimization.minification,
      result.performance.buildOptimization.compression,
      result.performance.buildOptimization.codesplitting,
    ]

    const enabledOptimizations = optimizations.filter(Boolean,).length
    result.performance.buildOptimization.score = (enabledOptimizations / optimizations.length) * 100

    // Healthcare-specific performance assessment
    if (result.build.analysis.bundleSize.exceedsHealthcareThresholds) {
      result.performance.buildOptimization.score *= 0.7 // Penalty for large bundles
    }

    if (result.build.analysis.healthcareOptimizations.length > 0) {
      result.performance.buildOptimization.score += 10 // Bonus for healthcare optimizations
    }

    result.performance.buildOptimization.score = Math.min(
      100,
      result.performance.buildOptimization.score,
    )
  }

  private assessDevelopmentExperience(result: ViteValidationResult,): void {
    // Assess HMR performance
    result.performance.developmentExperience.hmrPerformance = result.configuration
      .healthcareOptimizations.enabled.some(opt => opt.includes('HMR',) || opt.includes('hot',))

    // Assess healthcare developer optimizations
    result.performance.developmentExperience.healthcareDeveloperOptimized =
      result.plugins.healthcareRelevant > 2
      && result.configuration.healthcareOptimizations.score > 60

    // Estimate build speed (placeholder - would need actual benchmarks)
    result.performance.developmentExperience.buildSpeed =
      result.performance.buildOptimization.score > 70 ? 85 : 60

    result.performance.developmentExperience.reloadTime =
      result.performance.developmentExperience.hmrPerformance ? 95 : 70
  }
  private generatePerformanceRecommendations(result: ViteValidationResult,): void {
    // Bundle size recommendations
    if (result.build.analysis.bundleSize.exceedsHealthcareThresholds) {
      result.performance.buildOptimization.recommendations.push(
        'Reduce bundle size for better performance on healthcare networks',
      )
      result.performance.buildOptimization.recommendations.push(
        'Implement code splitting for healthcare modules',
      )
    }

    // Optimization recommendations
    if (!result.performance.buildOptimization.minification) {
      result.performance.buildOptimization.recommendations.push(
        'Enable minification for production builds',
      )
    }

    if (!result.performance.buildOptimization.treeShaking) {
      result.performance.buildOptimization.recommendations.push(
        'Configure tree shaking to remove unused code',
      )
    }

    if (!result.performance.buildOptimization.compression) {
      result.performance.buildOptimization.recommendations.push(
        'Enable compression for faster healthcare application loading',
      )
    }

    if (!result.performance.buildOptimization.codesplitting) {
      result.performance.buildOptimization.recommendations.push(
        'Implement code splitting for better caching and loading performance',
      )
    }

    // Healthcare-specific recommendations
    if (result.build.analysis.healthcareOptimizations.length === 0) {
      result.performance.buildOptimization.recommendations.push(
        'Add healthcare-specific build optimizations for clinic workflows',
      )
    }

    if (!result.performance.developmentExperience.healthcareDeveloperOptimized) {
      result.performance.buildOptimization.recommendations.push(
        'Optimize development experience for healthcare application development',
      )
    }
  }

  private generateHealthcareComplianceRecommendations(result: ViteValidationResult,): void {
    const recommendations = result.healthcareCompliance.recommendations

    // LGPD recommendations
    if (result.healthcareCompliance.lgpdScore < 80) {
      recommendations.push('Disable source maps in production to prevent healthcare code exposure',)
      recommendations.push('Secure environment variables for healthcare API credentials',)
      recommendations.push('Enable minification for healthcare data protection',)
    }

    if (result.healthcareCompliance.lgpdScore < 60) {
      recommendations.push('Implement comprehensive asset optimization for data minimization',)
      recommendations.push('Review build configuration for LGPD compliance',)
    }

    // Performance recommendations for healthcare networks
    if (result.healthcareCompliance.performanceScore < 80) {
      recommendations.push('Optimize bundle size for Brazilian healthcare network conditions',)
      recommendations.push('Enable all build optimizations for clinic performance',)
      recommendations.push('Implement healthcare-specific performance optimizations',)
    }

    if (result.healthcareCompliance.performanceScore < 60) {
      recommendations.push('Critical performance issues detected - optimize for 3G networks',)
      recommendations.push('Implement progressive loading for healthcare modules',)
    }

    // Security recommendations for medical data
    if (result.healthcareCompliance.securityScore < 80) {
      recommendations.push('Configure HTTPS for all healthcare data transmission',)
      recommendations.push('Secure proxy configuration for medical API communication',)
      recommendations.push('Implement environment security for medical credentials',)
    }

    if (result.healthcareCompliance.securityScore < 60) {
      recommendations.push(
        'Critical security issues detected - immediate healthcare compliance review required',
      )
      recommendations.push('Implement comprehensive medical data protection measures',)
    }

    // Overall recommendations
    if (result.healthcareCompliance.overallScore < 70) {
      recommendations.push('Conduct comprehensive healthcare compliance audit with legal team',)
      recommendations.push('Implement LGPD-compliant build configuration',)
      recommendations.push('Optimize for Brazilian healthcare infrastructure requirements',)
    }
  }

  private identifyHealthcareCriticalIssues(result: ViteValidationResult,): void {
    const criticalIssues = result.healthcareCompliance.criticalIssues

    // Critical LGPD issues
    if (result.security.sourceMapSecurity.productionSourceMaps) {
      criticalIssues.push(
        'CRITICAL: Source maps enabled in production - healthcare code exposure risk',
      )
    }

    if (result.security.environmentSecurity.secretsInBundle) {
      criticalIssues.push('CRITICAL: Sensitive data detected in build bundle - LGPD violation',)
    }

    // Critical performance issues
    if (result.build.analysis.bundleSize.exceedsHealthcareThresholds) {
      criticalIssues.push(
        `CRITICAL: Bundle size ${
          this.formatBytes(result.build.analysis.bundleSize.totalSize,)
        } exceeds healthcare network limits`,
      )
    }

    // Critical security issues
    if (!result.server.configuration.secure && result.server.proxy.healthcareEndpoints.length > 0) {
      criticalIssues.push('CRITICAL: HTTPS not configured for healthcare API proxy',)
    }

    if (result.configuration.environmentConfiguration.variables.insecure.length > 0) {
      criticalIssues.push(
        'CRITICAL: Insecure environment variables detected for healthcare credentials',
      )
    }

    // Critical configuration issues
    if (!result.configuration.valid && result.plugins.healthcareRelevant === 0) {
      criticalIssues.push('CRITICAL: No healthcare-optimized Vite configuration detected',)
    }
  }

  private calculateOverallValidity(result: ViteValidationResult,): boolean {
    // Configuration must be present
    if (!result.configuration.configFile) return false

    // Must have minimal healthcare compliance
    if (result.healthcareCompliance.overallScore < 50) return false

    // Security score must be acceptable for healthcare
    if (result.security.score < 60) return false

    // No critical healthcare compliance issues
    if (result.healthcareCompliance.criticalIssues.length > 0) return false

    // Build configuration must be reasonably valid
    if (result.build.configuration.issues.length > 5) return false

    // Performance must meet healthcare requirements
    if (result.performance.buildOptimization.score < 40) return false

    return true
  }

  // Public method to get validation summary
  getValidationSummary(result: ViteValidationResult,): string {
    return `
🔍 Vite Healthcare Build Audit Summary
=====================================

📊 Overall Status: ${result.valid ? '✅ VALID' : '❌ INVALID'}
📁 Config File: ${result.configuration.configFile || 'Not Found'}

🏥 Healthcare Compliance:
  • LGPD Score: ${result.healthcareCompliance.lgpdScore.toFixed(1,)}/100
  • Performance Score: ${result.healthcareCompliance.performanceScore.toFixed(1,)}/100
  • Security Score: ${result.healthcareCompliance.securityScore.toFixed(1,)}/100
  • Overall Score: ${result.healthcareCompliance.overallScore.toFixed(1,)}/100

🔧 Configuration:
  • Healthcare Optimizations: ${result.configuration.healthcareOptimizations.score.toFixed(1,)}/100
  • Environment Variables: ${result.configuration.environmentConfiguration.variables.present.length} present, ${result.configuration.environmentConfiguration.variables.missing.length} missing
  • Insecure Variables: ${result.configuration.environmentConfiguration.variables.insecure.length}

🔌 Plugins:
  • Total Plugins: ${result.plugins.total}
  • Healthcare Relevant: ${result.plugins.healthcareRelevant}
  • Security Critical: ${result.plugins.securityCritical}
  • Missing Essential: ${result.plugins.missing.length}

🏗️ Build Analysis:
  • Bundle Size: ${this.formatBytes(result.build.analysis.bundleSize.totalSize,)}
  • Exceeds Healthcare Limits: ${
      result.build.analysis.bundleSize.exceedsHealthcareThresholds ? '⚠️ Yes' : '✅ No'
    }
  • Total Chunks: ${result.build.analysis.chunkAnalysis.totalChunks}
  • Healthcare Chunks: ${result.build.analysis.chunkAnalysis.healthcareModuleChunks}

⚡ Performance Optimization:
  • Build Optimization Score: ${result.performance.buildOptimization.score.toFixed(1,)}/100
  • Tree Shaking: ${result.performance.buildOptimization.treeShaking ? '✅' : '❌'}
  • Minification: ${result.performance.buildOptimization.minification ? '✅' : '❌'}
  • Code Splitting: ${result.performance.buildOptimization.codesplitting ? '✅' : '❌'}
  • Compression: ${result.performance.buildOptimization.compression ? '✅' : '❌'}

🖥️ Server Configuration:
  • HTTPS Configured: ${result.server.configuration.secure ? '✅' : '❌'}
  • Healthcare API Proxy: ${result.server.proxy.configured ? '✅' : '❌'}
  • Healthcare Endpoints: ${result.server.proxy.healthcareEndpoints.length}
  • Security Issues: ${result.server.proxy.securityIssues.length}

🔒 Security Assessment:
  • Security Score: ${result.security.score}/100
  • Production Source Maps: ${
      result.security.sourceMapSecurity.productionSourceMaps ? '⚠️ Exposed' : '✅ Secure'
    }
  • Environment Leakage: ${
      result.security.environmentSecurity.envVarLeakage ? '⚠️ Detected' : '✅ Secure'
    }
  • Secrets in Bundle: ${
      result.security.environmentSecurity.secretsInBundle ? '⚠️ Detected' : '✅ Secure'
    }

⚡ Performance Metrics:
  • Processing Time: ${result.performance.duration.toFixed(2,)}ms
  • Files Processed: ${result.performance.filesProcessed}
  • Memory Usage: ${(result.performance.memoryUsage / 1024 / 1024).toFixed(2,)}MB

🚨 Critical Issues: ${result.healthcareCompliance.criticalIssues.length}
⚠️ Warnings: ${result.warnings.length}
❌ Errors: ${result.errors.length}
    `.trim()
  }
}
