import { describe, it, expect, beforeEach } from 'vitest'

describe('Package Manager Consistency Tests', () => {
  let rootPackageJson: any
  let testPackageJson: any

  beforeEach(() => {
    // Read package.json files
    rootPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(__dirname, '../../../../../package.json'),
        'utf8'
      )
    )
    testPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(__dirname, '../../../../package.json'),
        'utf8'
      )
    )
  })

  describe('Root Package Configuration', () => {
    it('should use consistent package manager throughout the project', () => {
      const rootPackageManager = rootPackageJson.packageManager
      const testPackageManager = testPackageJson.packageManager

      // This test FAILS because of package manager inconsistency
      expect(rootPackageManager).toBe(testPackageManager)
    })

    it('should have consistent script commands with declared package manager', () => {
      const rootPackageManager = rootPackageJson.packageManager
      const testScripts = Object.values(testPackageJson.scripts as Record<string, string>)
      
      // Check if any scripts use bun run when packageManager is pnpm
      const bunRunScripts = testScripts.filter(script => 
        typeof script === 'string' && script.startsWith('bun run')
      )

      // This test FAILS because test package uses bun run with pnpm packageManager
      if (rootPackageManager?.includes('pnpm')) {
        expect(bunRunScripts.length).toBe(0)
      }
    })

    it('should have CI-compatible caching configuration', () => {
      // Read CI workflow file
      const ciWorkflowPath = require('path').join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
      
      // Check for unsupported bun caching
      const hasBunCache = ciWorkflowContent.includes("cache: 'bun'")
      
      // This test FAILS because GitHub Actions doesn't support bun caching
      expect(hasBunCache).toBe(false)
    })

    it('should have consistent test directory references', () => {
      const testDirectory = rootPackageJson.directories?.test
      
      // This test FAILS because it references non-existent tools/tests-consolidated
      expect(testDirectory).toBeDefined()
      expect(require('fs').existsSync(
        require('path').join(__dirname, '../../../../../', testDirectory)
      )).toBe(true)
    })
  })

  describe('CI Workflow Compatibility', () => {
    it('should use supported caching strategy in GitHub Actions', () => {
      const ciWorkflowPath = require('path').join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
      
      // Check for multiple unsupported bun cache references
      const bunCacheCount = (ciWorkflowContent.match(/cache:\s*'bun'/g) || []).length
      
      // This test FAILS because multiple jobs use unsupported bun caching
      expect(bunCacheCount).toBe(0)
    })

    it('should have consistent installation commands across CI jobs', () => {
      const ciWorkflowPath = require('path').join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
      
      // Check for bun install commands
      const bunInstallCount = (ciWorkflowContent.match(/bun install/g) || []).length
      
      // This test FAILS because CI uses bun install but packageManager is pnpm
      expect(bunInstallCount).toBe(0)
    })

    it('should use consistent Node.js caching strategy', () => {
      const ciWorkflowPath = require('path').join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
      
      // Check for Node.js cache configurations with bun
      const nodeCacheBunMatches = ciWorkflowContent.match(/cache:\s*'bun'\s*# Node.js setup/gs) || []
      
      // This test FAILS because Node.js setup uses incompatible bun cache
      expect(nodeCacheBunMatches.length).toBe(0)
    })
  })

  describe('Workspace Configuration Consistency', () => {
    it('should not have conflicting workspace configuration files', () => {
      const rootDir = require('path').join(__dirname, '../../../../../')
      const pnpmWorkspaceExists = require('fs').existsSync(
        require('path').join(rootDir, 'pnpm-workspace.yaml')
      )
      const bunWorkspaceExists = require('fs').existsSync(
        require('path').join(rootDir, 'bun-workspace.json')
      )

      // This test FAILS if both workspace files exist (conflict)
      expect(pnpmWorkspaceExists && bunWorkspaceExists).toBe(false)
    })

    it('should have workspace configuration matching package manager', () => {
      const rootPackageJson = JSON.parse(
        require('fs').readFileSync(
          require('path').join(__dirname, '../../../../../package.json'),
          'utf8'
        )
      )
      const usesPnpm = rootPackageJson.packageManager?.includes('pnpm')
      
      const rootDir = require('path').join(__dirname, '../../../../../')
      const pnpmWorkspaceExists = require('fs').existsSync(
        require('path').join(rootDir, 'pnpm-workspace.yaml')
      )
      const bunWorkspaceExists = require('fs').existsSync(
        require('path').join(rootDir, 'bun-workspace.json')
      )

      // This test FAILS if workspace config doesn't match package manager
      if (usesPnpm) {
        expect(pnpmWorkspaceExists).toBe(true)
        expect(bunWorkspaceExists).toBe(false)
      } else {
        expect(bunWorkspaceExists).toBe(true)
        expect(pnpmWorkspaceExists).toBe(false)
      }
    })
  })

  describe('Build System Integration', () => {
    it('should have consistent build system commands', () => {
      const rootPackageJson = JSON.parse(
        require('fs').readFileSync(
          require('path').join(__dirname, '../../../../../package.json'),
          'utf8'
        )
      )
      
      // Check build system scripts for consistency
      const buildScripts = Object.entries(rootPackageJson.scripts || {})
        .filter(([key]) => key.startsWith('build:'))
        .map(([_, value]) => value as string)

      // Look for mixed package manager usage in build scripts
      const hasMixedBuildManagers = buildScripts.some(script => 
        script.includes('bun run') || script.includes('pnpm run')
      )

      // This test FAILS if build scripts use different package managers
      expect(hasMixedBuildManagers).toBe(false)
    })

    it('should have consistent test command execution', () => {
      const testPackageJson = JSON.parse(
        require('fs').readFileSync(
          require('path').join(__dirname, '../../../../package.json'),
          'utf8'
        )
      )
      
      const testScripts = Object.values(testPackageJson.scripts || {})
        .filter(script => typeof script === 'string' && script.includes('test'))

      // Check for mixed test execution commands
      const mixedTestCommands = testScripts.some(script => 
        script.startsWith('bun run') && testPackageJson.packageManager?.includes('pnpm')
      )

      // This test FAILS because test scripts use bun but packageManager is pnpm
      expect(mixedTestCommands).toBe(false)
    })
  })
})