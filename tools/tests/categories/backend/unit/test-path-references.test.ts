import { describe, it, expect, beforeEach } from 'vitest'

describe('Test Path Validation Tests', () => {
  let rootPackageJson: any
  let testPackageJson: any
  const rootDir = process.cwd()

  beforeEach(() => {
    // Read package.json files
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
  })

  describe('Root Package Test Directory Configuration', () => {
    it('should reference existing test directory in root package.json', () => {
      const testDirectory = rootPackageJson.directories?.test
      
      // This test FAILS because it references non-existent tools/tests-consolidated
      expect(testDirectory).toBeDefined()
      expect(testDirectory).not.toBe('tools/tests-consolidated')
      
      // Verify the directory actually exists
      const actualTestPath = require('path').join(rootDir, testDirectory)
      const exists = require('fs').existsSync(actualTestPath)
      expect(exists).toBe(true)
    })

    it('should have consistent test directory references across all configs', () => {
      const testDirectory = rootPackageJson.directories?.test
      const scripts = rootPackageJson.scripts || {}
      
      // Check if any test scripts reference old path
      const scriptPaths = Object.values(scripts)
        .filter(script => typeof script === 'string')
        .map(script => {
          const match = script.match(/tools\/tests[^\/]*/g)
          return match ? match[0] : null
        })
        .filter(Boolean)

      // This test FAILS if scripts reference inconsistent test paths
      scriptPaths.forEach(path => {
        expect(path).toBe(testDirectory)
      })
    })

    it('should have working directory references for all test commands', () => {
      const testCommands = Object.entries(rootPackageJson.scripts || {})
        .filter(([key, value]) => 
          key.startsWith('test') && typeof value === 'string'
        )

      testCommands.forEach(([commandName, command]) => {
        // Extract path references from command
        const pathMatches = (command as string).match(/tools\/tests[^\/\s]*/g)
        if (pathMatches) {
          pathMatches.forEach(pathRef => {
            const fullPath = require('path').join(rootDir, pathRef)
            const exists = require('fs').existsSync(fullPath)
            
            // This test FAILS if any referenced path doesn't exist
            expect(exists).toBe(true)
          })
        }
      })
    })
  })

  describe('Test Package Path References', () => {
    it('should have correct import paths for test configurations', () => {
      const testDir = require('path').join(rootDir, 'tools/tests')
      
      // Check if vitest config exists
      const vitestConfigPath = require('path').join(testDir, 'configs/vitest.config.ts')
      const vitestConfigExists = require('fs').existsSync(vitestConfigPath)
      
      // This test FAILS if test configuration files are missing
      expect(vitestConfigExists).toBe(true)
    })

    it('should have accessible test category directories', () => {
      const testDir = require('path').join(rootDir, 'tools/tests')
      const categories = ['backend', 'frontend', 'database', 'quality']
      
      categories.forEach(category => {
        const categoryPath = require('path').join(testDir, 'categories', category)
        const exists = require('fs').existsSync(categoryPath)
        
        // This test FAILS if any category directory is missing
        expect(exists).toBe(true)
      })
    })

    it('should have correct test file references in scripts', () => {
      const testScripts = testPackageJson.scripts || {}
      const scriptPaths = Object.values(testScripts)
        .filter(script => typeof script === 'string')
        .filter(script => script.includes('categories/'))

      scriptPaths.forEach(script => {
        const pathMatches = script.match(/categories\/[^\/]+/g)
        if (pathMatches) {
          pathMatches.forEach(pathMatch => {
            const categoryDir = require('path').join(
              rootDir, 
              'tools/tests', 
              pathMatch
            )
            const exists = require('fs').existsSync(categoryDir)
            
            // This test FAILS if referenced category directory doesn't exist
            expect(exists).toBe(true)
          })
        }
      })
    })
  })

  describe('Workspace Path Configuration', () => {
    it('should include test package in workspace configuration', () => {
      let workspaceConfig: any
      
      // Check for pnpm workspace
      const pnpmWorkspacePath = require('path').join(rootDir, 'pnpm-workspace.yaml')
      if (require('fs').existsSync(pnpmWorkspacePath)) {
        const pnpmWorkspaceContent = require('fs').readFileSync(pnpmWorkspacePath, 'utf8')
        workspaceConfig = { packages: pnpmWorkspaceContent.match(/packages:\s*\n([\s\S]*?)(?=\n\w|\n*$)/)?.[1] || '' }
      }
      
      // Check for bun workspace
      const bunWorkspacePath = require('path').join(rootDir, 'bun-workspace.json')
      if (require('fs').existsSync(bunWorkspacePath)) {
        workspaceConfig = JSON.parse(require('fs').readFileSync(bunWorkspacePath, 'utf8'))
      }

      if (workspaceConfig) {
        const packages = Array.isArray(workspaceConfig.packages) 
          ? workspaceConfig.packages 
          : typeof workspaceConfig.packages === 'string'
          ? [workspaceConfig.packages]
          : []

        // This test FAILS if test package is not included in workspace
        const includesTestPackage = packages.some((pkg: string) => 
          pkg.includes('tools/tests') || pkg.includes('tests')
        )
        expect(includesTestPackage).toBe(true)
      }
    })

    it('should have correct test package import paths', () => {
      // Try to import test package from root
      try {
        const testPackagePath = require('path').join(rootDir, 'tools/tests/package.json')
        const testPackage = JSON.parse(require('fs').readFileSync(testPackagePath, 'utf8'))
        
        // This test FAILS if test package cannot be loaded
        expect(testPackage.name).toBeDefined()
        expect(testPackage.name).toBe('@neonpro/tests')
      } catch (error) {
        // Test FAILS if package.json is malformed or missing
        expect(false).toBe(true)
      }
    })
  })

  describe('Test Execution Path Resolution', () => {
    it('should resolve all test configuration files', () => {
      const testDir = require('path').join(rootDir, 'tools/tests')
      const configFiles = [
        'configs/vitest.config.ts',
        'configs/playwright.config.ts',
        'configs/.oxlintrc.json'
      ]

      configFiles.forEach(configFile => {
        const configPath = require('path').join(testDir, configFile)
        const exists = require('fs').existsSync(configPath)
        
        // This test FAILS if any configuration file is missing
        expect(exists).toBe(true)
      })
    })

    it('should have correct test execution paths for all categories', () => {
      const testDir = require('path').join(rootDir, 'tools/tests')
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
        const categoryPath = require('path').join(testDir, category)
        const exists = require('fs').existsSync(categoryPath)
        
        // This test FAILS if any test category directory is missing
        expect(exists).toBe(true)
      })
    })

    it('should have consistent path separators across all configurations', () => {
      const rootPackageJson = JSON.parse(
        require('fs').readFileSync(
          require('path').join(rootDir, 'package.json'),
          'utf8'
        )
      )
      
      const testScripts = Object.values(rootPackageJson.scripts || {})
        .filter(script => typeof script === 'string')
        .filter(script => script.includes('tools/tests'))

      // Check for mixed path separators (Windows vs Unix)
      const hasMixedSeparators = testScripts.some(script => 
        script.includes('\\') && script.includes('/')
      )

      // This test FAILS if there are mixed path separators
      expect(hasMixedSeparators).toBe(false)
    })
  })
})