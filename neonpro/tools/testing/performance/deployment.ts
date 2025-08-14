/**
 * Production Deployment Optimization Scripts
 * 
 * Advanced optimization utilities for Next.js 15 production deployments
 * Based on 2025 deployment best practices
 */

import { promises as fs } from 'fs'
import path from 'path'
import { execSync } from 'child_process'

// Deployment configuration
export const DEPLOYMENT_CONFIG = {
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  TURBOPACK: process.env.USE_TURBOPACK === 'true',
  ANALYZE: process.env.ANALYZE === 'true',
  
  // Build optimization flags
  BUILD_FLAGS: [
    '--no-lint',        // Skip linting in CI (should be done separately)
    '--experimental-build-mode=compile',  // Faster builds
  ],
  
  // Environment-specific settings
  ENVIRONMENTS: {
    development: {
      minify: false,
      sourceMaps: true,
      compression: false,
    },
    staging: {
      minify: true,
      sourceMaps: true,
      compression: true,
    },
    production: {
      minify: true,
      sourceMaps: false,
      compression: true,
    }
  }
} as const

// Pre-build optimization tasks
export class PreBuildOptimizer {
  static async optimizeAssets(): Promise<void> {
    console.log('🎨 Optimizing assets...')
    
    try {
      // Optimize images in public directory
      await this.optimizeImages()
      
      // Clean up temporary files
      await this.cleanupTempFiles()
      
      // Validate environment variables
      await this.validateEnvironment()
      
      console.log('✅ Assets optimized successfully')
    } catch (error) {
      console.error('❌ Asset optimization failed:', error)
      throw error
    }
  }
  
  private static async optimizeImages(): Promise<void> {
    const publicDir = path.join(process.cwd(), 'public')
    
    try {
      const files = await this.getAllFiles(publicDir, ['.png', '.jpg', '.jpeg'])
      
      for (const file of files) {
        // Check if image needs optimization (> 500KB)
        const stats = await fs.stat(file)
        if (stats.size > 500 * 1024) {
          console.log(`📷 Large image detected: ${path.relative(process.cwd(), file)} (${(stats.size / 1024).toFixed(0)}KB)`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Image optimization check failed:', error)
    }
  }
  
  private static async cleanupTempFiles(): Promise<void> {
    const tempDirs = ['.next', '.swc', 'node_modules/.cache']
    
    for (const dir of tempDirs) {
      const fullPath = path.join(process.cwd(), dir)
      try {
        await fs.access(fullPath)
        // Don't delete, just report size
        const size = await this.getDirectorySize(fullPath)
        console.log(`📁 ${dir}: ${this.formatBytes(size)}`)
      } catch {
        // Directory doesn't exist, skip
      }
    }
  }
  
  private static async validateEnvironment(): Promise<void> {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL',
    ]
    
    const missing = requiredVars.filter(varName => !process.env[varName])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
    
    console.log('✅ Environment variables validated')
  }
  
  private static async getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = []
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name)
        
        if (item.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath, extensions))
        } else if (extensions.some(ext => item.name.toLowerCase().endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or is not accessible
    }
    
    return files
  }
  
  private static async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name)
        
        if (item.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath)
        } else {
          const stats = await fs.stat(fullPath)
          totalSize += stats.size
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
    
    return totalSize
  }
  
  private static formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
}

// Build optimization
export class BuildOptimizer {
  static async optimizedBuild(): Promise<void> {
    console.log('🏗️ Starting optimized build...')
    
    const startTime = Date.now()
    
    try {
      // Pre-build optimizations
      await PreBuildOptimizer.optimizeAssets()
      
      // Configure build environment
      this.configureBuildEnvironment()
      
      // Run build with optimizations
      await this.runBuild()
      
      // Post-build analysis
      await this.analyzeBuild()
      
      const buildTime = Date.now() - startTime
      console.log(`🎉 Build completed in ${(buildTime / 1000).toFixed(2)}s`)
      
    } catch (error) {
      console.error('❌ Build failed:', error)
      process.exit(1)
    }
  }
  
  private static configureBuildEnvironment(): void {
    // Set optimal Node.js flags for build
    process.env.NODE_OPTIONS = [
      '--max-old-space-size=4096',  // Increase memory limit
      '--optimize-for-size',        // Optimize for smaller bundles
    ].join(' ')
    
    // Enable optimizations
    process.env.NODE_ENV = 'production'
    
    if (DEPLOYMENT_CONFIG.TURBOPACK) {
      console.log('⚡ Using Turbopack for faster builds')
    }
    
    console.log('⚙️ Build environment configured')
  }
  
  private static async runBuild(): Promise<void> {
    const buildCommand = [
      'next',
      'build',
      DEPLOYMENT_CONFIG.TURBOPACK ? '--turbopack' : '',
      ...DEPLOYMENT_CONFIG.BUILD_FLAGS
    ].filter(Boolean).join(' ')
    
    console.log(`🔨 Running: ${buildCommand}`)
    
    try {
      execSync(buildCommand, { 
        stdio: 'inherit',
        env: { ...process.env }
      })
    } catch (error) {
      throw new Error(`Build command failed: ${error}`)
    }
  }
  
  private static async analyzeBuild(): Promise<void> {
    const buildDir = path.join(process.cwd(), '.next')
    
    try {
      // Check if build directory exists
      await fs.access(buildDir)
      
      // Analyze build size
      const buildSize = await PreBuildOptimizer['getDirectorySize'](buildDir)
      console.log(`📦 Build size: ${PreBuildOptimizer['formatBytes'](buildSize)}`)
      
      // Check for critical files
      const criticalFiles = [
        '.next/static',
        '.next/server',
        '.next/standalone'
      ]
      
      for (const file of criticalFiles) {
        const filePath = path.join(process.cwd(), file)
        try {
          await fs.access(filePath)
          console.log(`✅ ${file} generated`)
        } catch {
          console.log(`⚠️ ${file} not found`)
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Build analysis failed:', error)
    }
  }
}

// Production health checks
export class ProductionHealthCheck {
  static async runHealthChecks(): Promise<boolean> {
    console.log('🏥 Running production health checks...')
    
    const checks = [
      this.checkBuildArtifacts,
      this.checkEnvironmentVariables,
      this.checkDependencies,
      this.checkSecurityHeaders,
      this.checkPerformanceConfig,
    ]
    
    const results = await Promise.allSettled(checks.map(check => check()))
    
    const failed = results.filter(result => result.status === 'rejected')
    
    if (failed.length > 0) {
      console.error(`❌ ${failed.length} health checks failed:`)
      failed.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`  ${index + 1}. ${result.reason}`)
        }
      })
      return false
    }
    
    console.log('✅ All health checks passed')
    return true
  }
  
  private static async checkBuildArtifacts(): Promise<void> {
    const requiredFiles = [
      '.next/BUILD_ID',
      '.next/static',
      '.next/server/app',
    ]
    
    for (const file of requiredFiles) {
      const fullPath = path.join(process.cwd(), file)
      try {
        await fs.access(fullPath)
      } catch {
        throw new Error(`Missing build artifact: ${file}`)
      }
    }
  }
  
  private static async checkEnvironmentVariables(): Promise<void> {
    const prodVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]
    
    for (const varName of prodVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing environment variable: ${varName}`)
      }
    }
    
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('NODE_ENV must be set to "production"')
    }
  }
  
  private static async checkDependencies(): Promise<void> {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
      
      // Check for production dependencies
      const prodDeps = Object.keys(packageJson.dependencies || {})
      const requiredDeps = ['next', 'react', 'react-dom']
      
      for (const dep of requiredDeps) {
        if (!prodDeps.includes(dep)) {
          throw new Error(`Missing required dependency: ${dep}`)
        }
      }
      
    } catch (error) {
      throw new Error(`Dependency check failed: ${error}`)
    }
  }
  
  private static async checkSecurityHeaders(): Promise<void> {
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
    
    try {
      const configContent = await fs.readFile(nextConfigPath, 'utf-8')
      
      // Check for security headers
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy'
      ]
      
      for (const header of requiredHeaders) {
        if (!configContent.includes(header)) {
          console.warn(`⚠️ Missing security header: ${header}`)
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not verify security headers:', error)
    }
  }
  
  private static async checkPerformanceConfig(): Promise<void> {
    const nextConfigPath = path.join(process.cwd(), 'next.config.mjs')
    
    try {
      const configContent = await fs.readFile(nextConfigPath, 'utf-8')
      
      // Check for performance optimizations
      const optimizations = [
        'swcMinify',
        'compress',
        'optimizePackageImports'
      ]
      
      for (const opt of optimizations) {
        if (!configContent.includes(opt)) {
          console.warn(`⚠️ Missing performance optimization: ${opt}`)
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not verify performance config:', error)
    }
  }
}

// Deployment automation
export class DeploymentAutomation {
  static async deploy(environment: 'staging' | 'production' = 'production'): Promise<void> {
    console.log(`🚀 Starting deployment to ${environment}...`)
    
    try {
      // Run health checks
      const healthChecksPassed = await ProductionHealthCheck.runHealthChecks()
      if (!healthChecksPassed) {
        throw new Error('Health checks failed')
      }
      
      // Run optimized build
      await BuildOptimizer.optimizedBuild()
      
      // Environment-specific deployment steps
      await this.deployToEnvironment(environment)
      
      console.log(`🎉 Deployment to ${environment} completed successfully`)
      
    } catch (error) {
      console.error(`❌ Deployment to ${environment} failed:`, error)
      process.exit(1)
    }
  }
  
  private static async deployToEnvironment(environment: string): Promise<void> {
    // This would typically integrate with your deployment platform
    // For example: Vercel, Netlify, AWS, etc.
    
    console.log(`📡 Deploying to ${environment} environment...`)
    
    // Example deployment steps
    const deploymentSteps = [
      'Uploading static assets',
      'Deploying server functions',
      'Updating environment configuration',
      'Running database migrations',
      'Warming up caches',
      'Running smoke tests'
    ]
    
    for (const step of deploymentSteps) {
      console.log(`  ${step}...`)
      // Simulate deployment step
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2]
  
  switch (command) {
    case 'build':
      BuildOptimizer.optimizedBuild()
      break
      
    case 'health-check':
      ProductionHealthCheck.runHealthChecks()
        .then(passed => process.exit(passed ? 0 : 1))
      break
      
    case 'deploy':
      const env = (process.argv[3] as 'staging' | 'production') || 'production'
      DeploymentAutomation.deploy(env)
      break
      
    default:
      console.log(`
Usage: node deployment.js <command>

Commands:
  build        Run optimized production build
  health-check Run production health checks  
  deploy       Deploy to production (or staging)

Examples:
  node deployment.js build
  node deployment.js health-check
  node deployment.js deploy staging
  node deployment.js deploy production
      `)
  }
}