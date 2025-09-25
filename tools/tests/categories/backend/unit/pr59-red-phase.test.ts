import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('PR 59 TDD Tests - Package Manager Issues', () => {
  describe('Root Package.json Issues', () => {
    it('should detect incorrect test directory reference', () => {
      const rootPackagePath = join(__dirname, '../../../../../package.json')
      const rootPackageJson = JSON.parse(readFileSync(rootPackagePath, 'utf8'))
      
      const testDir = rootPackageJson.directories?.test
      
      // This test FAILS because test directory points to non-existent path
      expect(testDir).toBeDefined()
      expect(existsSync(join(__dirname, '../../../../../', testDir))).toBe(true)
    })

    it('should detect package manager consistency', () => {
      const rootPackagePath = join(__dirname, '../../../../../package.json')
      const testPackagePath = '/home/vibecode/neonpro/tools/tests/package.json'
      
      const rootPackageJson = JSON.parse(readFileSync(rootPackagePath, 'utf8'))
      const testPackageJson = JSON.parse(readFileSync(testPackagePath, 'utf8'))
      
      const rootPackageManager = rootPackageJson.packageManager
      const testPackageManager = testPackageJson.packageManager
      
      // This test FAILS because package managers are inconsistent
      expect(rootPackageManager).toBe(testPackageManager)
    })
  })

  describe('CI Workflow Issues', () => {
    it('should detect unsupported bun caching in GitHub Actions', () => {
      const ciWorkflowPath = join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = readFileSync(ciWorkflowPath, 'utf8')
      
      // This test FAILS because GitHub Actions doesn't support bun caching
      const hasBunCache = ciWorkflowContent.includes("cache: 'bun'")
      expect(hasBunCache).toBe(false)
    })

    it('should detect bun install commands in CI', () => {
      const ciWorkflowPath = join(__dirname, '../../../../../.github/workflows/ci-enhanced.yml')
      const ciWorkflowContent = readFileSync(ciWorkflowPath, 'utf8')
      
      // This test FAILS because CI uses bun install but should use pnpm
      const bunInstallCount = (ciWorkflowContent.match(/bun install/g) || []).length
      expect(bunInstallCount).toBe(0)
    })
  })

  describe('Test Package Issues', () => {
    it('should detect mixed package manager usage in test scripts', () => {
      const testPackagePath = '/home/vibecode/neonpro/tools/tests/package.json'
      const testPackageJson = JSON.parse(readFileSync(testPackagePath, 'utf8'))
      
      const testScripts = Object.values(testPackageJson.scripts || {})
        .filter(script => typeof script === 'string' && script.includes('test'))
      
      const hasBunRun = testScripts.some(script => script.startsWith('bun run'))
      
      // This test FAILS because test scripts use bun run but packageManager is pnpm
      expect(hasBunRun).toBe(false)
    })
  })
})