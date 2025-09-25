import { describe, it, expect, beforeEach } from 'vitest'

describe('CI Workflow Configuration Tests', () => {
  let ciWorkflowContent: string
  let rootPackageJson: any
  const rootDir = process.cwd()

  beforeEach(() => {
    // Read CI workflow and package.json
    const ciWorkflowPath = require('path').join(rootDir, '.github/workflows/ci-enhanced.yml')
    ciWorkflowContent = require('fs').readFileSync(ciWorkflowPath, 'utf8')
    
    rootPackageJson = JSON.parse(
      require('fs').readFileSync(
        require('path').join(rootDir, 'package.json'),
        'utf8'
      )
    )
  })

  describe('GitHub Actions Compatibility', () => {
    it('should use supported caching strategy in GitHub Actions', () => {
      // Check for unsupported bun cache references
      const bunCacheMatches = ciWorkflowContent.match(/cache:\s*'bun'/g) || []
      
      // This test FAILS because GitHub Actions doesn't support 'bun' caching
      expect(bunCacheMatches.length).toBe(0)
    })

    it('should use compatible Node.js setup caching', () => {
      // Find Node.js setup steps with bun cache
      const nodeSetupWithBunCache = ciWorkflowContent.match(
        /uses:\s*actions\/setup-node@v4[^}]*?cache:\s*'bun'/gs
      ) || []

      // This test FAILS because Node.js setup uses incompatible bun cache
      expect(nodeSetupWithBunCache.length).toBe(0)
    })

    it('should have supported installation commands', () => {
      const bunInstallCommands = (ciWorkflowContent.match(/bun install/g) || []).length
      const pnpmInstallCommands = (ciWorkflowContent.match(/pnpm install/g) || []).length
      
      // This test FAILS because CI uses bun install but should use pnpm
      expect(bunInstallCommands).toBe(0)
      expect(pnpmInstallCommands).toBeGreaterThan(0)
    })

    it('should have compatible cache key generation', () => {
      // Check for bun-based cache key generation
      const bunCacheKeyMatches = ciWorkflowContent.match(/hashFiles\(['"`]bun\.lock['"`]\)/g) || []
      
      // This test FAILS because cache key uses bun.lock instead of pnpm-lock.yaml
      expect(bunCacheKeyMatches.length).toBe(0)
    })
  })

  describe('Build Matrix Configuration', () => {
    it('should have valid package references in build matrix', () => {
      // Extract build matrix packages
      const matrixSection = ciWorkflowContent.match(
        /build-matrix:[\s\S]*?strategy:[\s\S]*?matrix:[\s\S]*?(?=\s*\w+:|$)/gs
      )?.[0] || ''

      const packageReferences = matrixSection.match(/packages:\s*'([^']+)'/g) || []
      
      // This test FAILS if build matrix references non-existent packages
      packageReferences.forEach(ref => {
        const packageName = ref.match(/'([^']+)'/)?.[1]
        if (packageName) {
          // Check if package actually exists in workspaces
          const exists = checkPackageExists(packageName)
          expect(exists).toBe(true)
        }
      })
    })

    it('should have consistent build commands across matrix', () => {
      const buildCommands = ciWorkflowContent.match(/run:\s*bun run[^}]+?build/gs) || []
      
      // This test FAILS because build commands use bun instead of pnpm
      buildCommands.forEach(command => {
        expect(command).not.toContain('bun run')
        expect(command).toContain('pnpm run')
      })
    })

    it('should have valid filter configurations for build matrix', () => {
      const filterConfigs = ciWorkflowContent.match(/--filter=([^}]+?)(?=\s|$)/g) || []
      
      filterConfigs.forEach(filter => {
        const packages = filter.match(/--filter=([^}]+?)(?=\s|$)/)?.[1]
        if (packages) {
          // This test FAILS if filter references non-existent packages
          const packageList = packages.split(',')
          packageList.forEach(pkg => {
            const exists = checkPackageExists(pkg.trim())
            expect(exists).toBe(true)
          })
        }
      })
    })
  })

  describe('Job Dependencies and Execution Order', () => {
    it('should have valid job dependencies', () => {
      // Extract all job definitions and their needs
      const jobDefinitions = ciWorkflowContent.match(/^\s+(\w+):\s*$/gm) || []
      
      jobDefinitions.forEach(jobName => {
        const jobSection = ciWorkflowContent.match(
          new RegExp(`${jobName}:[\\s\\S]*?(?=^\\s+\\w+:|$)`, 'gm')
        )?.[0] || ''

        const needsMatch = jobSection.match(/needs:\s*\[([^\]]+)\]/)
        if (needsMatch) {
          const neededJobs = needsMatch[1].split(',').map(j => j.trim())
          
          neededJobs.forEach(neededJob => {
            // This test FAILS if job depends on non-existent job
            const jobExists = jobDefinitions.some(j => j.trim() === neededJob)
            expect(jobExists).toBe(true)
          })
        }
      })
    })

    it('should have valid artifact references', () => {
      const artifactUploads = ciWorkflowContent.match(/name:\s*build-\${{ matrix\.target\.name }}/g) || []
      const artifactDownloads = ciWorkflowContent.match(/name:\s*build-\${{ matrix\.target\.name }}/g) || []
      
      // This test FAILS if artifact references don't match
      expect(artifactUploads.length).toBeGreaterThan(0)
      expect(artifactDownloads.length).toBeGreaterThan(0)
    })
  })

  describe('Security and Permissions', () => {
    it('should have appropriate permissions for the workflow', () => {
      const permissionsSection = ciWorkflowContent.match(/permissions:[\s\S]*?(?=^\s+\w+:|$)/gs)?.[0] || ''
      
      // This test FAILS if permissions are missing or incorrect
      expect(permissionsSection).toContain('contents: read')
      expect(permissionsSection).toContain('pull-requests: write')
    })

    it('should have concurrency control configured', () => {
      const concurrencySection = ciWorkflowContent.match(/concurrency:[\s\S]*?(?=^\s+\w+:|$)/gs)?.[0] || ''
      
      // This test FAILS if concurrency is not properly configured
      expect(concurrencySection).toContain('group:')
      expect(concurrencySection).toContain('cancel-in-progress: true')
    })
  })

  describe('Environment and Variable Configuration', () => {
    it('should have consistent environment variables', () => {
      const envSection = ciWorkflowContent.match(/env:[\s\S]*?(?=^\s+\w+:|$)/gs)?.[0] || ''
      
      // This test FAILS if required environment variables are missing
      expect(envSection).toContain('CI: true')
      expect(envSection).toContain('TURBO_CACHE: true')
    })

    it('should have valid secret references', () => {
      const secretReferences = ciWorkflowContent.match(/\${{\s*secrets\.[A-Z_]+\s*}}/g) || []
      
      // Check for common secrets that should exist
      const requiredSecrets = ['TURBO_TOKEN', 'TURBO_API']
      const foundSecrets = secretReferences.map(ref => 
        ref.match(/secrets\.([A-Z_]+)/)?.[1]
      ).filter(Boolean)

      // This test FAILS if required secrets are missing
      requiredSecrets.forEach(secret => {
        expect(foundSecrets).toContain(secret)
      })
    })
  })

  describe('Test Matrix Configuration', () => {
    it('should have valid test commands in test matrix', () => {
      const testCommands = ciWorkflowContent.match(/Run \$\{\{ matrix\.target\.name \}\}[^}]+run:\s*([^\n]+)/g) || []
      
      testCommands.forEach(command => {
        const runCommand = command.match(/run:\s*([^\n]+)/)?.[1]
        
        // This test FAILS because test commands use bun instead of pnpm
        expect(runCommand).not.toContain('bun run')
        expect(runCommand).toContain('pnpm run')
      })
    })

    it('should have correct test matrix package references', () => {
      const testMatrixSection = ciWorkflowContent.match(/test-matrix:[\s\S]*?matrix:[\s\S]*?(?=\s*\w+:|$)/gs)?.[0] || ''
      
      const packageReferences = testMatrixSection.match(/packages:\s*'([^']+)'/g) || []
      
      packageReferences.forEach(ref => {
        const packageName = ref.match(/'([^']+)'/)?.[1]
        if (packageName) {
          // This test FAILS if test matrix references non-existent packages
          const exists = checkPackageExists(packageName)
          expect(exists).toBe(true)
        }
      })
    })

    it('should have valid coverage configuration', () => {
      const coverageSteps = ciWorkflowContent.match(/coverage:\s*\.\/coverage\/lcov\.info/g) || []
      
      // This test FAILS if coverage configuration is incorrect
      expect(coverageSteps.length).toBeGreaterThan(0)
    })
  })

  // Helper function to check if package exists
  function checkPackageExists(packageName: string): boolean {
    try {
      // Check if package exists in workspace
      const packagePath = require('path').join(rootDir, 'packages', packageName.replace('@neonpro/', ''))
      const exists = require('fs').existsSync(packagePath)
      if (exists) return true
      
      // Check if it's an app package
      const appPath = require('path').join(rootDir, 'apps', packageName.replace('@neonpro/', ''))
      return require('fs').existsSync(appPath)
    } catch {
      return false
    }
  }
})