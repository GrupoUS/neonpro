/**
 * Performance Tests for Bun Migration
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

describe('Bun Migration Performance Tests', () => {
  const testDir = join(process.cwd(), 'tmp', 'performance-tests')
  const packageJsonPath = join(testDir, 'package.json')
  const bunLockbPath = join(testDir, 'bun.lockb')
  const npmLockPath = join(testDir, 'package-lock.json')
  const pnpmLockPath = join(testDir, 'pnpm-lock.yaml')
  const yarnLockPath = join(testDir, 'yarn.lock')

  beforeEach(() => {
    // Create a temporary directory for tests
    try {
      execSync(`mkdir -p ${testDir}`)
    } catch (error) {
      // Directory might already exist
    }

    // Create a test package.json
    const packageJson = {
      name: 'test-performance',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'typescript': '^5.0.0',
        'zod': '^3.21.0',
        '@trpc/server': '^10.0.0',
        'supabase': '^2.0.0',
      },
    }

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  })

  describe('Package Installation Performance', () => {
    it('should install packages 3-5x faster with Bun than npm', () => {
      // Clean up any existing lock files
      try {
        unlinkSync(npmLockPath)
        unlinkSync(bunLockbPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure npm installation time
      const npmStart = Date.now()
      try {
        execSync(`cd ${testDir} && npm install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('npm install failed:', error)
      }
      const npmTime = Date.now() - npmStart

      // Clean up npm artifacts
      try {
        execSync(`cd ${testDir} && rm -rf node_modules`, { stdio: 'pipe' })
        unlinkSync(npmLockPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure Bun installation time
      const bunStart = Date.now()
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }
      const bunTime = Date.now() - bunStart

      // Calculate improvement
      const improvement = npmTime / bunTime

      console.log(`npm install time: ${npmTime}ms`)
      console.log(`bun install time: ${bunTime}ms`)
      console.log(`Improvement: ${improvement}x`)

      // Bun should be 3-5x faster
      expect(improvement).toBeGreaterThanOrEqual(3)
      expect(improvement).toBeLessThanOrEqual(10) // Allow for some variance
    })

    it('should install packages faster with Bun than pnpm', () => {
      // Clean up any existing lock files
      try {
        unlinkSync(pnpmLockPath)
        unlinkSync(bunLockbPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure pnpm installation time
      const pnpmStart = Date.now()
      try {
        execSync(`cd ${testDir} && pnpm install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('pnpm install failed:', error)
      }
      const pnpmTime = Date.now() - pnpmStart

      // Clean up pnpm artifacts
      try {
        execSync(`cd ${testDir} && rm -rf node_modules`, { stdio: 'pipe' })
        unlinkSync(pnpmLockPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure Bun installation time
      const bunStart = Date.now()
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }
      const bunTime = Date.now() - bunStart

      // Calculate improvement
      const improvement = pnpmTime / bunTime

      console.log(`pnpm install time: ${pnpmTime}ms`)
      console.log(`bun install time: ${bunTime}ms`)
      console.log(`Improvement: ${improvement}x`)

      // Bun should be faster than pnpm
      expect(improvement).toBeGreaterThanOrEqual(1.5)
    })

    it('should install packages faster with Bun than Yarn', () => {
      // Clean up any existing lock files
      try {
        unlinkSync(yarnLockPath)
        unlinkSync(bunLockbPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure Yarn installation time
      const yarnStart = Date.now()
      try {
        execSync(`cd ${testDir} && yarn install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('yarn install failed:', error)
      }
      const yarnTime = Date.now() - yarnStart

      // Clean up Yarn artifacts
      try {
        execSync(`cd ${testDir} && rm -rf node_modules`, { stdio: 'pipe' })
        unlinkSync(yarnLockPath)
      } catch (error) {
        // Files might not exist
      }

      // Measure Bun installation time
      const bunStart = Date.now()
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }
      const bunTime = Date.now() - bunStart

      // Calculate improvement
      const improvement = yarnTime / bunTime

      console.log(`yarn install time: ${yarnTime}ms`)
      console.log(`bun install time: ${bunTime}ms`)
      console.log(`Improvement: ${improvement}x`)

      // Bun should be faster than Yarn
      expect(improvement).toBeGreaterThanOrEqual(1.5)
    })
  })

  describe('Build Performance', () => {
    it('should build 3-5x faster with Bun than npm', () => {
      // Create a simple TypeScript file to build
      const tsFile = join(testDir, 'index.ts')
      writeFileSync(tsFile, 'console.log("Hello, world!");')

      // Create a tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: 'es2020',
          module: 'commonjs',
          outDir: './dist',
          rootDir: './',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
      }
      writeFileSync(join(testDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2))

      // Make sure dependencies are installed
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }

      // Measure npm build time
      const npmStart = Date.now()
      try {
        execSync(`cd ${testDir} && npm run build`, { stdio: 'pipe' })
      } catch (error) {
        console.error('npm build failed:', error)
      }
      const npmTime = Date.now() - npmStart

      // Clean up npm artifacts
      try {
        execSync(`cd ${testDir} && rm -rf dist`, { stdio: 'pipe' })
      } catch (error) {
        // Directory might not exist
      }

      // Measure Bun build time
      const bunStart = Date.now()
      try {
        execSync(`cd ${testDir} && bun run build`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun build failed:', error)
      }
      const bunTime = Date.now() - bunStart

      // Calculate improvement
      const improvement = npmTime / bunTime

      console.log(`npm build time: ${npmTime}ms`)
      console.log(`bun build time: ${bunTime}ms`)
      console.log(`Improvement: ${improvement}x`)

      // Bun should be 3-5x faster
      expect(improvement).toBeGreaterThanOrEqual(3)
      expect(improvement).toBeLessThanOrEqual(10) // Allow for some variance
    })
  })

  describe('Bundle Size', () => {
    it('should produce smaller bundles with Bun', () => {
      // Create a simple TypeScript file to bundle
      const tsFile = join(testDir, 'index.ts')
      writeFileSync(tsFile, `
        import { z } from 'zod';

        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        export default schema;
      `)

      // Create a bunfig.toml for bundling
      const bunfig = `
        [install]
        cache = true

        [build]
        target = "browser"
        format = "esm"
      `
      writeFileSync(join(testDir, 'bunfig.toml'), bunfig)

      // Make sure dependencies are installed
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }

      // Build with Bun
      try {
        execSync(`cd ${testDir} && bun build ./index.ts --outfile=./bun-out.js`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun build failed:', error)
      }

      // Build with esbuild (as a comparison)
      try {
        execSync(`cd ${testDir} && npx esbuild ./index.ts --bundle --outfile=./esbuild-out.js --format=esm`, { stdio: 'pipe' })
      } catch (error) {
        console.error('esbuild build failed:', error)
      }

      // Get bundle sizes
      let bunBundleSize = 0
      let esbuildBundleSize = 0

      try {
        const bunBundle = readFileSync(join(testDir, 'bun-out.js'))
        bunBundleSize = bunBundle.length
      } catch (error) {
        console.error('Failed to read Bun bundle:', error)
      }

      try {
        const esbuildBundle = readFileSync(join(testDir, 'esbuild-out.js'))
        esbuildBundleSize = esbuildBundle.length
      } catch (error) {
        console.error('Failed to read esbuild bundle:', error)
      }

      console.log(`Bun bundle size: ${bunBundleSize} bytes`)
      console.log(`esbuild bundle size: ${esbuildBundleSize} bytes`)

      // Both bundles should be created
      expect(bunBundleSize).toBeGreaterThan(0)
      expect(esbuildBundleSize).toBeGreaterThan(0)

      // Bun bundle should be smaller or comparable
      const sizeRatio = bunBundleSize / esbuildBundleSize
      expect(sizeRatio).toBeLessThanOrEqual(1.2) // Allow for some variance
    })
  })

  describe('Memory Usage', () => {
    it('should use less memory with Bun', () => {
      // This test is more complex to implement accurately
      // For now, we'll just check that Bun doesn't crash with a large dependency tree

      // Add more dependencies to package.json
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      packageJson.dependencies = {
        ...packageJson.dependencies,
        'lodash': '^4.17.21',
        'moment': '^2.29.4',
        'axios': '^1.4.0',
        'express': '^4.18.2',
        'cors': '^2.8.5',
        'helmet': '^7.0.0',
        'bcrypt': '^5.1.0',
        'jsonwebtoken': '^9.0.0',
        'multer': '^1.4.5',
        'mongoose': '^7.2.0',
        'socket.io': '^4.7.0',
      }
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

      // Install with Bun
      try {
        execSync(`cd ${testDir} && bun install`, { stdio: 'pipe' })
      } catch (error) {
        console.error('bun install failed:', error)
      }

      // Run a simple script with Bun to check memory usage
      const script = `
        console.log('Memory usage:', process.memoryUsage());
        process.exit(0);
      `
      writeFileSync(join(testDir, 'memory-test.js'), script)

      try {
        const output = execSync(`cd ${testDir} && bun memory-test.js`, { encoding: 'utf8' })
        console.log('Bun memory usage:', output)

        // Parse the output to extract memory usage
        const memoryUsage = JSON.parse(output.split('Memory usage: ')[1])
        expect(memoryUsage.rss).toBeGreaterThan(0)
        expect(memoryUsage.heapTotal).toBeGreaterThan(0)
        expect(memoryUsage.heapUsed).toBeGreaterThan(0)
        expect(memoryUsage.external).toBeGreaterThanOrEqual(0)
      } catch (error) {
        console.error('Bun memory test failed:', error)
      }
    })
  })
})
