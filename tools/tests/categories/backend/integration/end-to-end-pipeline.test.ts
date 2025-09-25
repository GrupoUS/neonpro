import { describe, it, expect, beforeEach } from 'vitest'

describe('End-to-End Pipeline Tests', () => {
  let rootPackageJson: any
  let testPackageJson: any
  let ciWorkflowContent: string
  const rootDir = process.cwd()

  beforeEach(() => {
    // Read all configuration files
    rootPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(rootDir, 'package.json'),
        'utf8'
      )
    )
    testPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(rootDir, 'tools/tests/package.json'),
        'utf8'
      )
    )
    const ciWorkflowPath = require('path').join(rootDir, '.github/workflows/ci-enhanced.yml')
    ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
  })

  describe('Complete Pipeline Configuration', () => {
    it('should have consistent package manager across entire pipeline', () => {
      const rootPackageManager = rootPackageJson.packageManager
      const testPackageManager = testPackageJson.packageManager
      
      // Check CI workflow for package manager usage
      const bunCommands = (ciWorkflowContent.match(/\bbun\b/g) || []).length
      const pnpmCommands = (ciWorkflowContent.match(/\bpnpm\b/g) || []).length
      
      // This test FAILS because there's mixed package manager usage
      expect(rootPackageManager).toBe(testPackageManager)
      
      if (rootPackageManager?.includes('pnpm')) {
        expect(bunCommands).toBe(0)
        expect(pnpmCommands).toBeGreaterThan(0)
      }
    })

    it('should have compatible caching strategy across all jobs', () => {
      const unsupportedCacheRefs = (ciWorkflowContent.match(/cache:\s*'bun'/g) || []).length
      
      // This test FAILS because GitHub Actions doesn't support bun caching
      expect(unsupportedCacheRefs).toBe(0)
    })

    it('should have valid job execution order and dependencies', () => {
      // Extract all job names
      const jobMatches = ciWorkflowContent.match(/^  (\w+):$/gm) || []
      const jobNames = jobMatches.map(match => match.trim())
      
      // Check for health-check job (should be first)
      const hasHealthCheck = jobNames.includes('health-check')
      
      // This test FAILS if essential jobs are missing
      expect(hasHealthCheck).toBe(true)
      expect(jobNames.length).toBeGreaterThan(5) // Should have multiple jobs
      
      // Check that jobs have proper dependencies
      jobNames.forEach(jobName => {
        const jobSection = ciWorkflowContent.match(
          new RegExp(`${jobName}:[\\s\\S]*?(?=^  \\w+:|$)`, 'gm')
        )?.[0] || ''
        
        // Check if job has needs section
        const hasNeeds = jobSection.includes('needs:')
        if (jobName !== 'health-check' && hasNeeds) {
          // This test FAILS if job dependencies are invalid
          const needsMatch = jobSection.match(/needs:\s*\[([^\]]+)\]/)
          if (needsMatch) {
            const neededJobs = needsMatch[1].split(',').map(j => j.trim())
            neededJobs.forEach(neededJob => {
              expect(jobNames).toContain(neededJob)
            })
          }
        }
      })
    })
  })

  describe('Test Execution Pipeline', () => {
    it('should have working test execution from root level', () => {
      const rootTestScripts = Object.entries(rootPackageJson.scripts || {})
        .filter(([key]) => key.startsWith('test'))
      
      // This test FAILS if root level test scripts are missing or broken
      expect(rootTestScripts.length).toBeGreaterThan(0)
      
      rootTestScripts.forEach(([scriptName, scriptCommand]) => {
        if (typeof scriptCommand === 'string') {
          // Check if script references correct test directory
          const hasValidTestPath = scriptCommand.includes('tools/tests') || 
                                   scriptCommand.includes('cd tools/tests')
          
          // This test FAILS if test scripts reference wrong paths
          expect(hasValidTestPath).toBe(true)
        }
      })
    })

    it('should have consistent test configuration across all test types', () => {
      const testScripts = testPackageJson.scripts || {}
      const testTypes = ['unit', 'integration', 'e2e', 'coverage']
      
      testTypes.forEach(testType => {
        const scriptName = `test:${testType}`
        const scriptCommand = testScripts[scriptName]
        
        // This test FAILS if essential test scripts are missing
        expect(scriptCommand).toBeDefined()
        expect(typeof scriptCommand).toBe('string')
        
        if (typeof scriptCommand === 'string') {
          // Check for consistent configuration usage
          const hasConfig = scriptCommand.includes('--config')
          const configPath = scriptCommand.match(/--config\s+(\S+)/)?.[1]
          
          if (configPath) {
            const fullConfigPath = require('path').join(rootDir, 'tools/tests', configPath)
            const exists = require('fs').existsSync(fullConfigPath)
            
            // This test FAILS if config files are missing
            expect(exists).toBe(true)
          }
        }
      })
    })

    it('should have valid test category configurations', () => {
      const testCategories = [
        'categories/backend/unit',
        'categories/backend/integration',
        'categories/backend/api',
        'categories/backend/middleware',
        'categories/frontend/react',
        'categories/frontend/e2e',
        'categories/frontend/accessibility',
        'categories/database/security',
        'categories/database/compliance',
        'categories/database/rls',
        'categories/quality/coverage',
        'categories/quality/performance',
        'categories/quality/audit'
      ]
      
      testCategories.forEach(category => {
        const categoryPath = require('path').join(rootDir, 'tools/tests', category)
        const exists = require('fs').existsSync(categoryPath)
        
        // This test FAILS if test category directories are missing
        expect(exists).toBe(true)
        
        if (exists) {
          // Check if category has test files
          const files = require('fs').readdirSync(categoryPath)
          const hasTestFiles = files.some(file => file.endsWith('.test.ts'))
          
          // This test FAILS if categories are empty
          expect(hasTestFiles).toBe(true)
        }
      })
    })
  })

  describe('Build and Quality Pipeline', () => {
    it('should have working build system integration', () => {
      const buildScripts = Object.entries(rootPackageJson.scripts || {})
        .filter(([key]) => key.startsWith('build'))
      
      // This test FAILS if build scripts are missing
      expect(buildScripts.length).toBeGreaterThan(0)
      
      buildScripts.forEach(([scriptName, scriptCommand]) => {
        if (typeof scriptCommand === 'string') {
          // Check for consistent package manager usage
          const hasPackageManagerConflict = 
            (scriptCommand.includes('bun run') && rootPackageJson.packageManager?.includes('pnpm')) ||
            (scriptCommand.includes('pnpm run') && rootPackageJson.packageManager?.includes('bun'))
          
          // This test FAILS if there are package manager conflicts
          expect(hasPackageManagerConflict).toBe(false)
        }
      })
    })

    it('should have valid quality gate scripts', () => {
      const qualityScripts = ['lint', 'format', 'type-check']
      
      qualityScripts.forEach(scriptName => {
        const scriptCommand = rootPackageJson.scripts?.[scriptName]
        
        // This test FAILS if quality scripts are missing
        expect(scriptCommand).toBeDefined()
        expect(typeof scriptCommand).toBe('string')
        
        if (typeof scriptCommand === 'string') {
          // Check for proper tool usage
          const validCommands = {
            lint: ['oxlint', 'eslint'],
            format: ['dprint', 'prettier'],
            'type-check': ['tsc', 'turbo']
          }
          
          const hasValidCommand = validCommands[scriptName as keyof typeof validCommands]
            .some(cmd => scriptCommand.includes(cmd))
          
          // This test FAILS if quality scripts use wrong tools
          expect(hasValidCommand).toBe(true)
        }
      })
    })

    it('should have working test coverage configuration', () => {
      const coverageScript = testPackageJson.scripts?.['test:coverage:all']
      
      // This test FAILS if coverage script is missing
      expect(coverageScript).toBeDefined()
      expect(typeof coverageScript).toBe('string')
      
      if (typeof coverageScript === 'string') {
        // Check for coverage configuration
        const hasCoverageConfig = coverageScript.includes('--coverage')
        
        // This test FAILS if coverage is not configured
        expect(hasCoverageConfig).toBe(true)
      }
    })
  })

  describe('Development Workflow Integration', () => {
    it('should have consistent development scripts', () => {
      const devScripts = Object.entries(rootPackageJson.scripts || {})
        .filter(([key]) => key.startsWith('dev'))
      
      // This test FAILS if development scripts are missing
      expect(devScripts.length).toBeGreaterThan(0)
      
      devScripts.forEach(([scriptName, scriptCommand]) => {
        if (typeof scriptCommand === 'string') {
          // Check for turbo usage (monorepo consistency)
          const usesTurbo = scriptCommand.includes('turbo')
          
          // This test FAILS if dev scripts don't use turbo for monorepo
          expect(usesTurbo).toBe(true)
        }
      })
    })

    it('should have working local development setup', () => {
      // Check if all required configuration files exist
      const configFiles = [
        'tsconfig.json',
        'turbo.json',
        'package.json',
        '.github/workflows/ci-enhanced.yml'
      ]
      
      configFiles.forEach(configFile => {
        const configPath = require('path').join(rootDir, configFile)
        const exists = require('fs').existsSync(configPath)
        
        // This test FAILS if required config files are missing
        expect(exists).toBe(true)
      })
    })

    it('should have valid package.json structure across all packages', () => {
      const workspacePackages = getAllWorkspacePackages(rootDir)
      
      workspacePackages.forEach(pkgPath => {
        const packageJsonPath = require('path').join(pkgPath, 'package.json')
        const exists = require('fs').existsSync(packageJsonPath)
        
        // This test FAILS if package.json is missing
        expect(exists).toBe(true)
        
        if (exists) {
          try {
            const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'))
            
            // This test FAILS if package.json is malformed
            expect(packageJson.name).toBeDefined()
            expect(packageJson.version).toBeDefined()
            expect(typeof packageJson.scripts).toBe('object')
          } catch (error) {
            // This test FAILS if package.json cannot be parsed
            expect(false).toBe(true)
          }
        }
      })
    })
  })

  describe('CI/CD Pipeline Integration', () => {
    it('should have valid CI workflow structure', () => {
      // Check for required workflow sections
      const hasOnSection = ciWorkflowContent.includes('on:')
      const hasJobsSection = ciWorkflowContent.includes('jobs:')
      const hasEnvSection = ciWorkflowContent.includes('env:')
      
      // This test FAILS if workflow structure is incomplete
      expect(hasOnSection).toBe(true)
      expect(hasJobsSection).toBe(true)
      expect(hasEnvSection).toBe(true)
    })

    it('should have valid deployment configuration', () => {
      const deploymentSection = ciWorkflowContent.match(/deployment:[\s\S]*?(?=^  \w+:|$)/gs)?.[0] || ''
      
      // This test FAILS if deployment configuration is missing
      expect(deploymentSection).toBeDefined()
      expect(deploymentSection.length).toBeGreaterThan(0)
      
      // Check for deployment dependencies
      const hasDeploymentDependencies = deploymentSection.includes('needs:')
      
      // This test FAILS if deployment doesn't depend on other jobs
      expect(hasDeploymentDependencies).toBe(true)
    })

    it('should have valid security and compliance checks', () => {
      const securityJobs = ciWorkflowContent.match(/^  (\w+):$/gm) || []
      const hasSecurityScan = securityJobs.some(job => job.includes('security'))
      const hasQualityCheck = securityJobs.some(job => job.includes('quality'))
      
      // This test FAILS if security and quality checks are missing
      expect(hasSecurityScan).toBe(true)
      expect(hasQualityCheck).toBe(true)
    })
  })

  describe('Final Pipeline Validation', () => {
    it('should have no configuration conflicts across the entire system', () => {
      const conflicts = []
      
      // Check for package manager conflicts
      const usesPnpm = rootPackageJson.packageManager?.includes('pnpm')
      const usesBunInCI = ciWorkflowContent.includes('bun install')
      
      if (usesPnpm && usesBunInCI) {
        conflicts.push('Package manager conflict: pnpm in package.json but bun in CI')
      }
      
      // Check for path conflicts
      const testDirectory = rootPackageJson.directories?.test
      if (testDirectory && testDirectory.includes('tests-consolidated')) {
        conflicts.push('Test directory conflict: references non-existent tests-consolidated')
      }
      
      // Check for cache conflicts
      const hasBunCache = ciWorkflowContent.includes("cache: 'bun'")
      if (hasBunCache) {
        conflicts.push('Cache conflict: uses unsupported bun caching')
      }
      
      // This test FAILS if there are any configuration conflicts
      expect(conflicts.length).toBe(0)
    })

    it('should have complete and working development pipeline', () => {
      // Test that all essential scripts work together
      const essentialScripts = [
        'dev',
        'build',
        'test',
        'lint',
        'type-check'
      ]
      
      const missingScripts = essentialScripts.filter(script => 
        !rootPackageJson.scripts?.[script]
      )
      
      // This test FAILS if essential scripts are missing
      expect(missingScripts.length).toBe(0)
    })

    it('should be ready for production deployment', () => {
      // Check for production readiness indicators
      const hasProductionScripts = rootPackageJson.scripts?.['deploy'] ||
                                rootPackageJson.scripts?.['deploy:prod']
      
      const hasSecurityConfig = ciWorkflowContent.includes('security-scan')
      const hasPerformanceConfig = ciWorkflowContent.includes('performance-analysis')
      
      // This test FAILS if production readiness is incomplete
      expect(hasSecurityConfig).toBe(true)
      expect(hasPerformanceConfig).toBe(true)
    })
  })

  // Helper function to get all workspace packages
  function getAllWorkspacePackages(rootDir: string): string[] {
    const packages: string[] = []
    
    // Check packages directory
    const packagesDir = require('path').join(rootDir, 'packages')
    if (require('fs').existsSync(packagesDir)) {
      const packageDirs = require('fs').readdirSync(packagesDir)
        .filter(item => {
          const itemPath = require('path').join(packagesDir, item)
          return require('fs').statSync(itemPath).isDirectory()
        })
      
      packages.push(...packageDirs.map(dir => require('path').join(packagesDir, dir)))
    }
    
    // Check apps directory
    const appsDir = require('path').join(rootDir, 'apps')
    if (require('fs').existsSync(appsDir)) {
      const appDirs = require('fs').readdirSync(appsDir)
        .filter(item => {
          const itemPath = require('path').join(appsDir, item)
          return require('fs').statSync(itemPath).isDirectory()
        })
      
      packages.push(...appDirs.map(dir => require('path').join(appsDir, dir)))
    }
    
    // Check tools/tests directory
    const testsDir = require('path').join(rootDir, 'tools/tests')
    if (require('fs').existsSync(testsDir)) {
      packages.push(testsDir)
    }
    
    return packages
  }
})