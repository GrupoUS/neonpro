/**
 * TanStack Router Validator - NeonPro Healthcare Integration
 *
 * Specialized validator for TanStack Router v1.58.15+ integration in NeonPro.
 * Validates file-based routing patterns, healthcare-specific route configurations,
 * and performance optimizations for Brazilian healthcare compliance.
 *
 * Constitutional Requirements:
 * - Process route files efficiently within memory limits
 * - Validate healthcare routing patterns (LGPD/ANVISA)
 * - Ensure routing performance meets healthcare network requirements
 * - Quality standard ≥9.5/10
 */

import { EventEmitter, } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'
import { performance, } from 'perf_hooks'

// TanStack Router specific interfaces
export interface TanStackRouterConfig {
  routesDirectory: string
  generatedRouteTree: string
  routeFileIgnorePrefix: string
  quoteStyle: 'single' | 'double'
  autoCodeSplitting: boolean
}

export interface RouteDefinition {
  filePath: string
  routePath: string
  routeType: 'layout' | 'index' | 'route' | 'error' | 'loading'
  hasLoader: boolean
  hasAction: boolean
  hasComponent: boolean
  hasErrorComponent: boolean
  isProtected: boolean
  healthcareCompliant: boolean
  dependencies: string[]
  exports: string[]
}

export interface RouterValidationResult {
  routeCount: number
  validRoutes: RouteDefinition[]
  invalidRoutes: Array<{ route: RouteDefinition; issues: string[] }>
  performanceMetrics: {
    bundleSizes: Record<string, number>
    loadingTimes: Record<string, number>
    codesplitting: {
      enabled: boolean
      chunksGenerated: number
      averageChunkSize: number
    }
  }
  healthcareCompliance: {
    lgpdCompliant: boolean
    anvisaCompliant: boolean
    secureRouting: boolean
    dataProtectionRoutes: string[]
  }
  recommendations: string[]
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low'
    message: string
    affectedRoutes: string[]
    solution: string
  }>
}

export class TanStackRouterValidator extends EventEmitter {
  private routesDirectory: string
  private projectRoot: string
  private config: TanStackRouterConfig | null = null

  constructor(projectRoot: string = process.cwd(), routesDirectory?: string,) {
    super()
    this.projectRoot = projectRoot
    this.routesDirectory = routesDirectory || 'src/routes'
    this.setupEventHandlers()
  }

  /**
   * Main validation method for TanStack Router
   */
  async validateRouter(): Promise<RouterValidationResult> {
    const startTime = performance.now()
    this.emit('router:validation-started',)

    try {
      // Load router configuration
      await this.loadRouterConfig()

      // Discover and analyze routes
      const routes = await this.discoverRoutes()
      const validationResults = await this.validateRoutes(routes,)

      // Analyze performance characteristics
      const performanceMetrics = await this.analyzePerformance(routes,)

      // Check healthcare compliance
      const healthcareCompliance = await this.validateHealthcareCompliance(routes,)

      // Generate recommendations
      const recommendations = this.generateRecommendations(validationResults, performanceMetrics,)

      const result: RouterValidationResult = {
        routeCount: routes.length,
        validRoutes: validationResults.valid,
        invalidRoutes: validationResults.invalid,
        performanceMetrics,
        healthcareCompliance,
        recommendations,
        issues: validationResults.issues,
      }

      const duration = performance.now() - startTime
      this.emit('router:validation-completed', { result, duration, },)

      return result
    } catch (error) {
      this.emit('router:validation-failed', { error: error.message, },)
      throw error
    }
  }

  /**
   * Load TanStack Router configuration from vite.config.ts or similar
   */
  private async loadRouterConfig(): Promise<void> {
    try {
      // Try to read Vite configuration
      const viteConfigPath = path.join(this.projectRoot, 'vite.config.ts',)
      const viteConfig = await fs.readFile(viteConfigPath, 'utf8',)

      // Extract TanStack Router configuration
      const routerConfig = this.parseRouterConfig(viteConfig,)
      if (routerConfig) {
        this.config = routerConfig
        this.routesDirectory = routerConfig.routesDirectory || this.routesDirectory
      }

      this.emit('router:config-loaded', { config: this.config, },)
    } catch (error) {
      // Use default configuration if vite.config.ts not found
      this.config = {
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
        quoteStyle: 'single',
        autoCodeSplitting: true,
      }

      this.emit('router:config-default', { config: this.config, },)
    }
  }

  /**
   * Parse router configuration from Vite config
   */
  private parseRouterConfig(viteConfigContent: string,): TanStackRouterConfig | null {
    try {
      // Extract TanStackRouterVite configuration
      const routerMatch = viteConfigContent.match(/TanStackRouterVite\(\s*{([^}]+)}/s,)
      if (!routerMatch) return null

      const configText = routerMatch[1]

      // Parse configuration properties
      const routesDirectory = this.extractConfigValue(configText, 'routesDirectory',)
        || './src/routes'
      const generatedRouteTree = this.extractConfigValue(configText, 'generatedRouteTree',)
        || './src/routeTree.gen.ts'
      const routeFileIgnorePrefix = this.extractConfigValue(configText, 'routeFileIgnorePrefix',)
        || '-'
      const quoteStyle = this.extractConfigValue(configText, 'quoteStyle',) || 'single'
      const autoCodeSplitting = configText.includes('autoCodeSplitting: true',)

      return {
        routesDirectory,
        generatedRouteTree,
        routeFileIgnorePrefix,
        quoteStyle: quoteStyle as 'single' | 'double',
        autoCodeSplitting,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Extract configuration value from config text
   */
  private extractConfigValue(configText: string, key: string,): string | null {
    const match = configText.match(new RegExp(`${key}:\\s*['"\`]([^'"\`]+)['"\`]`,),)
    return match ? match[1] : null
  }

  /**
   * Discover all route files in the routes directory
   */
  private async discoverRoutes(): Promise<RouteDefinition[]> {
    const routesPath = path.resolve(this.projectRoot, this.routesDirectory,)
    const routes: RouteDefinition[] = []

    try {
      const routeFiles = await this.findRouteFiles(routesPath,)

      for (const filePath of routeFiles) {
        const route = await this.analyzeRouteFile(filePath, routesPath,)
        if (route) {
          routes.push(route,)
        }
      }

      this.emit('router:routes-discovered', { count: routes.length, },)
      return routes
    } catch (error) {
      this.emit('router:discovery-failed', { error: error.message, },)
      return []
    }
  }

  /**
   * Find all route files recursively
   */
  private async findRouteFiles(routesPath: string,): Promise<string[]> {
    const files: string[] = []

    const scanDirectory = async (dirPath: string,): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true, },)

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name,)

          if (entry.isDirectory()) {
            await scanDirectory(fullPath,)
          } else if (this.isRouteFile(entry.name,)) {
            files.push(fullPath,)
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    }

    await scanDirectory(routesPath,)
    return files
  }

  /**
   * Check if file is a valid route file
   */
  private isRouteFile(filename: string,): boolean {
    // Skip ignored files
    if (
      this.config?.routeFileIgnorePrefix && filename.startsWith(this.config.routeFileIgnorePrefix,)
    ) {
      return false
    }

    // Check for valid route file extensions
    return /\.(tsx|ts|jsx|js)$/.test(filename,)
  }

  /**
   * Analyze individual route file
   */
  private async analyzeRouteFile(
    filePath: string,
    routesBasePath: string,
  ): Promise<RouteDefinition | null> {
    try {
      const content = await fs.readFile(filePath, 'utf8',)
      const relativePath = path.relative(routesBasePath, filePath,)
      const routePath = this.filePathToRoutePath(relativePath,)

      const routeDefinition: RouteDefinition = {
        filePath,
        routePath,
        routeType: this.determineRouteType(relativePath, content,),
        hasLoader: /export\s+(?:const|function)\s+loader/m.test(content,),
        hasAction: /export\s+(?:const|function)\s+action/m.test(content,),
        hasComponent: /export\s+(?:default|const|function)\s+(?:component|Component)/mi.test(
          content,
        ),
        hasErrorComponent: /export\s+(?:const|function)\s+errorComponent/m.test(content,),
        isProtected: this.checkIfProtectedRoute(content,),
        healthcareCompliant: await this.checkHealthcareCompliance(content, routePath,),
        dependencies: this.extractDependencies(content,),
        exports: this.extractExports(content,),
      }

      return routeDefinition
    } catch (error) {
      this.emit('router:file-analysis-failed', { filePath, error: error.message, },)
      return null
    }
  }

  /**
   * Convert file path to route path
   */
  private filePathToRoutePath(filePath: string,): string {
    let routePath = filePath
      .replace(/\.(tsx|ts|jsx|js)$/, '',) // Remove extension
      .replace(/\\/g, '/',) // Normalize separators
      .replace(/index$/, '',) // Remove index

    // Handle special route patterns
    routePath = routePath
      .replace(/\$([^/]+)/g, ':$1',) // $param -> :param
      .replace(/_([^/]+)/g, '$1',) // _layout -> layout
      .replace(/\[([^\]]+)\]/g, ':$1',) // [param] -> :param

    return routePath.startsWith('/',) ? routePath : `/${routePath}`
  }

  /**
   * Determine route type based on file path and content
   */
  private determineRouteType(filePath: string, content: string,): RouteDefinition['routeType'] {
    if (filePath.includes('__root',)) return 'layout'
    if (filePath.endsWith('index.tsx',) || filePath.endsWith('index.ts',)) return 'index'
    if (content.includes('ErrorComponent',) || filePath.includes('error',)) return 'error'
    if (content.includes('LoadingComponent',) || filePath.includes('loading',)) return 'loading'
    if (filePath.includes('_layout',) || content.includes('Outlet',)) return 'layout'
    return 'route'
  }

  /**
   * Check if route is protected (requires authentication)
   */
  private checkIfProtectedRoute(content: string,): boolean {
    const protectedPatterns = [
      /beforeLoad.*auth/i,
      /requireAuth/i,
      /useAuth/i,
      /AuthGuard/i,
      /ProtectedRoute/i,
      /auth\.user/i,
    ]

    return protectedPatterns.some(pattern => pattern.test(content,))
  }

  /**
   * Check healthcare compliance for routes
   */
  private async checkHealthcareCompliance(content: string, routePath: string,): Promise<boolean> {
    const complianceChecks = {
      // LGPD compliance patterns
      lgpd: [
        /LGPD_COMPLIANCE/i,
        /dataProtection/i,
        /privacyPolicy/i,
        /consentManagement/i,
      ],

      // ANVISA compliance patterns
      anvisa: [
        /ANVISA_COMPLIANCE/i,
        /medicalDevice/i,
        /healthcareValidation/i,
        /regulatoryCompliance/i,
      ],

      // Security patterns
      security: [
        /securityHeaders/i,
        /authenticate/i,
        /authorize/i,
        /encrypt/i,
      ],
    }

    // Check if route handles sensitive healthcare data
    const sensitiveRoutes = ['/patients', '/appointments', '/medical', '/health',]
    const isSensitiveRoute = sensitiveRoutes.some(route => routePath.includes(route,))

    if (isSensitiveRoute) {
      // Sensitive routes must have compliance patterns
      const hasLgpd = complianceChecks.lgpd.some(pattern => pattern.test(content,))
      const hasSecurity = complianceChecks.security.some(pattern => pattern.test(content,))

      return hasLgpd && hasSecurity
    }

    return true // Non-sensitive routes are compliant by default
  }

  /**
   * Extract dependencies from route file
   */
  private extractDependencies(content: string,): string[] {
    const dependencies: string[] = []

    // Extract import statements
    const importMatches = content.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g,)
    if (importMatches) {
      for (const importMatch of importMatches) {
        const match = importMatch.match(/from\s+['"]([^'"]+)['"]/,)
        if (match) {
          dependencies.push(match[1],)
        }
      }
    }

    return [...new Set(dependencies,),] // Remove duplicates
  }

  /**
   * Extract exports from route file
   */
  private extractExports(content: string,): string[] {
    const exports: string[] = []

    // Extract export statements
    const exportMatches = content.match(/export\s+(?:const|function|default)\s+(\w+)/g,)
    if (exportMatches) {
      for (const exportMatch of exportMatches) {
        const match = exportMatch.match(/export\s+(?:const|function|default)\s+(\w+)/,)
        if (match && match[1] !== 'default') {
          exports.push(match[1],)
        }
      }
    }

    // Check for default export
    if (/export\s+default/m.test(content,)) {
      exports.push('default',)
    }

    return [...new Set(exports,),]
  }

  // Event handlers stub to avoid runtime errors if not set elsewhere
  private setupEventHandlers(): void {
    this.on('router:validation-started', () => {},)
    this.on('router:validation-completed', () => {},)
    this.on('router:validation-failed', () => {},)
    this.on('router:routes-discovered', () => {},)
    this.on('router:config-loaded', () => {},)
    this.on('router:config-default', () => {},)
    this.on('router:file-analysis-failed', () => {},)
    this.on('router:discovery-failed', () => {},)
  }
}
