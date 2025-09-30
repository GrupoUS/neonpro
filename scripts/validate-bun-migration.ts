#!/usr/bin/env bun
/**
 * Validate Bun Migration Success Criteria
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

// Define success criteria
const successCriteria = {
  packageInstallation: {
    npmImprovement: 3, // 3x faster than npm
    pnpmImprovement: 1.5, // 1.5x faster than pnpm
    yarnImprovement: 1.5, // 1.5x faster than yarn
  },
  buildPerformance: {
    npmImprovement: 3, // 3x faster than npm
  },
  bundleSize: {
    reduction: 0.2, // 20% reduction
  },
  edgePerformance: {
    ttfb: 150, // ≤ 150ms
    cacheHitRate: 80, // ≥ 80%
    coldStartFrequency: 5, // ≤ 5%
  },
  realtimePerformance: {
    uiPatchTime: 1500, // ≤ 1.5s
    connectionLatency: 200, // ≤ 200ms
    messageDeliveryTime: 100, // ≤ 100ms
  },
  aiPerformance: {
    copilotToolRoundtrip: 2000, // ≤ 2s
    modelInferenceTime: 1000, // ≤ 1s
    responseGenerationTime: 500, // ≤ 500ms
  },
  systemPerformance: {
    uptime: 99.9, // ≥ 99.9%
    memoryUsage: 80, // ≤ 80%
    cpuUsage: 70, // ≤ 70%
    diskUsage: 80, // ≤ 80%
  },
  healthcareCompliance: {
    lgpd: 100, // 100% compliant
    anvisa: 100, // 100% compliant
    cfm: 100, // 100% compliant
    wcag: 100, // 100% compliant
  },
}

// Test results
const testResults = {
  packageInstallation: {
    npmImprovement: 0,
    pnpmImprovement: 0,
    yarnImprovement: 0,
  },
  buildPerformance: {
    npmImprovement: 0,
  },
  bundleSize: {
    reduction: 0,
  },
  edgePerformance: {
    ttfb: 0,
    cacheHitRate: 0,
    coldStartFrequency: 0,
  },
  realtimePerformance: {
    uiPatchTime: 0,
    connectionLatency: 0,
    messageDeliveryTime: 0,
  },
  aiPerformance: {
    copilotToolRoundtrip: 0,
    modelInferenceTime: 0,
    responseGenerationTime: 0,
  },
  systemPerformance: {
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
  },
  healthcareCompliance: {
    lgpd: 0,
    anvisa: 0,
    cfm: 0,
    wcag: 0,
  },
}

// Validation functions
async function validatePackageInstallation() {
  console.log('Validating package installation performance...')

  const testDir = join(process.cwd(), 'tmp', 'validation-tests')
  const packageJsonPath = join(testDir, 'package.json')
  const bunLockbPath = join(testDir, 'bun.lockb')
  const npmLockPath = join(testDir, 'package-lock.json')
  const pnpmLockPath = join(testDir, 'pnpm-lock.yaml')
  const yarnLockPath = join(testDir, 'yarn.lock')

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

  // Test npm vs Bun
  try {
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
    testResults.packageInstallation.npmImprovement = improvement

    console.log(`npm install time: ${npmTime}ms`)
    console.log(`bun install time: ${bunTime}ms`)
    console.log(`Improvement: ${improvement}x`)
  } catch (error) {
    console.error('Package installation validation failed:', error)
  }

  // Test pnpm vs Bun
  try {
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
    testResults.packageInstallation.pnpmImprovement = improvement

    console.log(`pnpm install time: ${pnpmTime}ms`)
    console.log(`bun install time: ${bunTime}ms`)
    console.log(`Improvement: ${improvement}x`)
  } catch (error) {
    console.error('Package installation validation failed:', error)
  }

  // Test Yarn vs Bun
  try {
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
    testResults.packageInstallation.yarnImprovement = improvement

    console.log(`yarn install time: ${yarnTime}ms`)
    console.log(`bun install time: ${bunTime}ms`)
    console.log(`Improvement: ${improvement}x`)
  } catch (error) {
    console.error('Package installation validation failed:', error)
  }
}

async function validateBuildPerformance() {
  console.log('Validating build performance...')

  const testDir = join(process.cwd(), 'tmp', 'validation-tests')
  const tsFile = join(testDir, 'index.ts')

  // Create a simple TypeScript file to build
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

  try {
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
    testResults.buildPerformance.npmImprovement = improvement

    console.log(`npm build time: ${npmTime}ms`)
    console.log(`bun build time: ${bunTime}ms`)
    console.log(`Improvement: ${improvement}x`)
  } catch (error) {
    console.error('Build performance validation failed:', error)
  }
}

async function validateBundleSize() {
  console.log('Validating bundle size...')

  const testDir = join(process.cwd(), 'tmp', 'validation-tests')
  const tsFile = join(testDir, 'index.ts')

  // Create a simple TypeScript file to bundle
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

  try {
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

    // Calculate reduction
    if (esbuildBundleSize > 0) {
      const reduction = (esbuildBundleSize - bunBundleSize) / esbuildBundleSize
      testResults.bundleSize.reduction = reduction
      console.log(`Bundle size reduction: ${(reduction * 100).toFixed(2)}%`)
    }
  } catch (error) {
    console.error('Bundle size validation failed:', error)
  }
}

async function validateEdgePerformance() {
  console.log('Validating edge performance...')

  try {
    // Get edge performance metrics from the API
    const response = await fetch('http://localhost:3000/api/trpc/performanceMetrics.getState')
    const data = await response.json()

    if (data && data.result && data.result.data) {
      const metrics = data.result.data

      testResults.edgePerformance.ttfb = metrics.edgePerformance.ttfb
      testResults.edgePerformance.cacheHitRate = metrics.edgePerformance.cacheHitRate
      testResults.edgePerformance.coldStartFrequency = metrics.edgePerformance.coldStartFrequency

      console.log(`Edge TTFB: ${metrics.edgePerformance.ttfb}ms`)
      console.log(`Cache Hit Rate: ${metrics.edgePerformance.cacheHitRate}%`)
      console.log(`Cold Start Frequency: ${metrics.edgePerformance.coldStartFrequency}%`)
    } else {
      console.error('Failed to get edge performance metrics from API')
    }
  } catch (error) {
    console.error('Edge performance validation failed:', error)
  }
}

async function validateRealtimePerformance() {
  console.log('Validating real-time performance...')

  try {
    // Get real-time performance metrics from the API
    const response = await fetch('http://localhost:3000/api/trpc/performanceMetrics.getState')
    const data = await response.json()

    if (data && data.result && data.result.data) {
      const metrics = data.result.data

      testResults.realtimePerformance.uiPatchTime = metrics.realtimePerformance.uiPatchTime
      testResults.realtimePerformance.connectionLatency = metrics.realtimePerformance.connectionLatency
      testResults.realtimePerformance.messageDeliveryTime = metrics.realtimePerformance.messageDeliveryTime

      console.log(`UI Patch Time: ${metrics.realtimePerformance.uiPatchTime}ms`)
      console.log(`Connection Latency: ${metrics.realtimePerformance.connectionLatency}ms`)
      console.log(`Message Delivery Time: ${metrics.realtimePerformance.messageDeliveryTime}ms`)
    } else {
      console.error('Failed to get real-time performance metrics from API')
    }
  } catch (error) {
    console.error('Real-time performance validation failed:', error)
  }
}

async function validateAIPerformance() {
  console.log('Validating AI performance...')

  try {
    // Get AI performance metrics from the API
    const response = await fetch('http://localhost:3000/api/trpc/performanceMetrics.getState')
    const data = await response.json()

    if (data && data.result && data.result.data) {
      const metrics = data.result.data

      testResults.aiPerformance.copilotToolRoundtrip = metrics.aiPerformance.copilotToolRoundtrip
      testResults.aiPerformance.modelInferenceTime = metrics.aiPerformance.modelInferenceTime
      testResults.aiPerformance.responseGenerationTime = metrics.aiPerformance.responseGenerationTime

      console.log(`Copilot Tool Roundtrip: ${metrics.aiPerformance.copilotToolRoundtrip}ms`)
      console.log(`Model Inference Time: ${metrics.aiPerformance.modelInferenceTime}ms`)
      console.log(`Response Generation Time: ${metrics.aiPerformance.responseGenerationTime}ms`)
    } else {
      console.error('Failed to get AI performance metrics from API')
    }
  } catch (error) {
    console.error('AI performance validation failed:', error)
  }
}

async function validateSystemPerformance() {
  console.log('Validating system performance...')

  try {
    // Get system performance metrics from the API
    const response = await fetch('http://localhost:3000/api/trpc/performanceMetrics.getState')
    const data = await response.json()

    if (data && data.result && data.result.data) {
      const metrics = data.result.data

      testResults.systemPerformance.uptime = metrics.systemPerformance.uptime
      testResults.systemPerformance.memoryUsage = metrics.systemPerformance.memoryUsage
      testResults.systemPerformance.cpuUsage = metrics.systemPerformance.cpuUsage
      testResults.systemPerformance.diskUsage = metrics.systemPerformance.diskUsage

      console.log(`Uptime: ${metrics.systemPerformance.uptime}%`)
      console.log(`Memory Usage: ${metrics.systemPerformance.memoryUsage}%`)
      console.log(`CPU Usage: ${metrics.systemPerformance.cpuUsage}%`)
      console.log(`Disk Usage: ${metrics.systemPerformance.diskUsage}%`)
    } else {
      console.error('Failed to get system performance metrics from API')
    }
  } catch (error) {
    console.error('System performance validation failed:', error)
  }
}

async function validateHealthcareCompliance() {
  console.log('Validating healthcare compliance...')

  try {
    // Get compliance status from the API
    const response = await fetch('http://localhost:3000/api/trpc/complianceStatus.getState')
    const data = await response.json()

    if (data && data.result && data.result.data) {
      const compliance = data.result.data

      testResults.healthcareCompliance.lgpd = compliance.lgpd.compliant ? 100 : 0
      testResults.healthcareCompliance.anvisa = compliance.anvisa.compliant ? 100 : 0
      testResults.healthcareCompliance.cfm = compliance.cfm.compliant ? 100 : 0
      testResults.healthcareCompliance.wcag = compliance.wcag.compliant ? 100 : 0

      console.log(`LGPD Compliance: ${compliance.lgpd.compliant ? '100%' : '0%'}`)
      console.log(`ANVISA Compliance: ${compliance.anvisa.compliant ? '100%' : '0%'}`)
      console.log(`CFM Compliance: ${compliance.cfm.compliant ? '100%' : '0%'}`)
      console.log(`WCAG Compliance: ${compliance.wcag.compliant ? '100%' : '0%'}`)
    } else {
      console.error('Failed to get compliance status from API')
    }
  } catch (error) {
    console.error('Healthcare compliance validation failed:', error)
  }
}

// Validate all success criteria
async function validateAll() {
  console.log('Starting Bun migration validation...\n')

  await validatePackageInstallation()
  console.log('')

  await validateBuildPerformance()
  console.log('')

  await validateBundleSize()
  console.log('')

  await validateEdgePerformance()
  console.log('')

  await validateRealtimePerformance()
  console.log('')

  await validateAIPerformance()
  console.log('')

  await validateSystemPerformance()
  console.log('')

  await validateHealthcareCompliance()
  console.log('')

  // Check if all success criteria are met
  let allCriteriaMet = true

  // Check package installation performance
  if (testResults.packageInstallation.npmImprovement < successCriteria.packageInstallation.npmImprovement) {
    console.log(`❌ Package installation (npm) improvement: ${testResults.packageInstallation.npmImprovement}x < ${successCriteria.packageInstallation.npmImprovement}x`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Package installation (npm) improvement: ${testResults.packageInstallation.npmImprovement}x >= ${successCriteria.packageInstallation.npmImprovement}x`)
  }

  if (testResults.packageInstallation.pnpmImprovement < successCriteria.packageInstallation.pnpmImprovement) {
    console.log(`❌ Package installation (pnpm) improvement: ${testResults.packageInstallation.pnpmImprovement}x < ${successCriteria.packageInstallation.pnpmImprovement}x`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Package installation (pnpm) improvement: ${testResults.packageInstallation.pnpmImprovement}x >= ${successCriteria.packageInstallation.pnpmImprovement}x`)
  }

  if (testResults.packageInstallation.yarnImprovement < successCriteria.packageInstallation.yarnImprovement) {
    console.log(`❌ Package installation (yarn) improvement: ${testResults.packageInstallation.yarnImprovement}x < ${successCriteria.packageInstallation.yarnImprovement}x`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Package installation (yarn) improvement: ${testResults.packageInstallation.yarnImprovement}x >= ${successCriteria.packageInstallation.yarnImprovement}x`)
  }

  // Check build performance
  if (testResults.buildPerformance.npmImprovement < successCriteria.buildPerformance.npmImprovement) {
    console.log(`❌ Build performance (npm) improvement: ${testResults.buildPerformance.npmImprovement}x < ${successCriteria.buildPerformance.npmImprovement}x`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Build performance (npm) improvement: ${testResults.buildPerformance.npmImprovement}x >= ${successCriteria.buildPerformance.npmImprovement}x`)
  }

  // Check bundle size
  if (testResults.bundleSize.reduction < successCriteria.bundleSize.reduction) {
    console.log(`❌ Bundle size reduction: ${(testResults.bundleSize.reduction * 100).toFixed(2)}% < ${(successCriteria.bundleSize.reduction * 100).toFixed(2)}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Bundle size reduction: ${(testResults.bundleSize.reduction * 100).toFixed(2)}% >= ${(successCriteria.bundleSize.reduction * 100).toFixed(2)}%`)
  }

  // Check edge performance
  if (testResults.edgePerformance.ttfb > successCriteria.edgePerformance.ttfb) {
    console.log(`❌ Edge TTFB: ${testResults.edgePerformance.ttfb}ms > ${successCriteria.edgePerformance.ttfb}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Edge TTFB: ${testResults.edgePerformance.ttfb}ms <= ${successCriteria.edgePerformance.ttfb}ms`)
  }

  if (testResults.edgePerformance.cacheHitRate < successCriteria.edgePerformance.cacheHitRate) {
    console.log(`❌ Cache Hit Rate: ${testResults.edgePerformance.cacheHitRate}% < ${successCriteria.edgePerformance.cacheHitRate}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Cache Hit Rate: ${testResults.edgePerformance.cacheHitRate}% >= ${successCriteria.edgePerformance.cacheHitRate}%`)
  }

  if (testResults.edgePerformance.coldStartFrequency > successCriteria.edgePerformance.coldStartFrequency) {
    console.log(`❌ Cold Start Frequency: ${testResults.edgePerformance.coldStartFrequency}% > ${successCriteria.edgePerformance.coldStartFrequency}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Cold Start Frequency: ${testResults.edgePerformance.coldStartFrequency}% <= ${successCriteria.edgePerformance.coldStartFrequency}%`)
  }

  // Check real-time performance
  if (testResults.realtimePerformance.uiPatchTime > successCriteria.realtimePerformance.uiPatchTime) {
    console.log(`❌ UI Patch Time: ${testResults.realtimePerformance.uiPatchTime}ms > ${successCriteria.realtimePerformance.uiPatchTime}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ UI Patch Time: ${testResults.realtimePerformance.uiPatchTime}ms <= ${successCriteria.realtimePerformance.uiPatchTime}ms`)
  }

  if (testResults.realtimePerformance.connectionLatency > successCriteria.realtimePerformance.connectionLatency) {
    console.log(`❌ Connection Latency: ${testResults.realtimePerformance.connectionLatency}ms > ${successCriteria.realtimePerformance.connectionLatency}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Connection Latency: ${testResults.realtimePerformance.connectionLatency}ms <= ${successCriteria.realtimePerformance.connectionLatency}ms`)
  }

  if (testResults.realtimePerformance.messageDeliveryTime > successCriteria.realtimePerformance.messageDeliveryTime) {
    console.log(`❌ Message Delivery Time: ${testResults.realtimePerformance.messageDeliveryTime}ms > ${successCriteria.realtimePerformance.messageDeliveryTime}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Message Delivery Time: ${testResults.realtimePerformance.messageDeliveryTime}ms <= ${successCriteria.realtimePerformance.messageDeliveryTime}ms`)
  }

  // Check AI performance
  if (testResults.aiPerformance.copilotToolRoundtrip > successCriteria.aiPerformance.copilotToolRoundtrip) {
    console.log(`❌ Copilot Tool Roundtrip: ${testResults.aiPerformance.copilotToolRoundtrip}ms > ${successCriteria.aiPerformance.copilotToolRoundtrip}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Copilot Tool Roundtrip: ${testResults.aiPerformance.copilotToolRoundtrip}ms <= ${successCriteria.aiPerformance.copilotToolRoundtrip}ms`)
  }

  if (testResults.aiPerformance.modelInferenceTime > successCriteria.aiPerformance.modelInferenceTime) {
    console.log(`❌ Model Inference Time: ${testResults.aiPerformance.modelInferenceTime}ms > ${successCriteria.aiPerformance.modelInferenceTime}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Model Inference Time: ${testResults.aiPerformance.modelInferenceTime}ms <= ${successCriteria.aiPerformance.modelInferenceTime}ms`)
  }

  if (testResults.aiPerformance.responseGenerationTime > successCriteria.aiPerformance.responseGenerationTime) {
    console.log(`❌ Response Generation Time: ${testResults.aiPerformance.responseGenerationTime}ms > ${successCriteria.aiPerformance.responseGenerationTime}ms`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Response Generation Time: ${testResults.aiPerformance.responseGenerationTime}ms <= ${successCriteria.aiPerformance.responseGenerationTime}ms`)
  }

  // Check system performance
  if (testResults.systemPerformance.uptime < successCriteria.systemPerformance.uptime) {
    console.log(`❌ Uptime: ${testResults.systemPerformance.uptime}% < ${successCriteria.systemPerformance.uptime}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Uptime: ${testResults.systemPerformance.uptime}% >= ${successCriteria.systemPerformance.uptime}%`)
  }

  if (testResults.systemPerformance.memoryUsage > successCriteria.systemPerformance.memoryUsage) {
    console.log(`❌ Memory Usage: ${testResults.systemPerformance.memoryUsage}% > ${successCriteria.systemPerformance.memoryUsage}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Memory Usage: ${testResults.systemPerformance.memoryUsage}% <= ${successCriteria.systemPerformance.memoryUsage}%`)
  }

  if (testResults.systemPerformance.cpuUsage > successCriteria.systemPerformance.cpuUsage) {
    console.log(`❌ CPU Usage: ${testResults.systemPerformance.cpuUsage}% > ${successCriteria.systemPerformance.cpuUsage}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ CPU Usage: ${testResults.systemPerformance.cpuUsage}% <= ${successCriteria.systemPerformance.cpuUsage}%`)
  }

  if (testResults.systemPerformance.diskUsage > successCriteria.systemPerformance.diskUsage) {
    console.log(`❌ Disk Usage: ${testResults.systemPerformance.diskUsage}% > ${successCriteria.systemPerformance.diskUsage}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ Disk Usage: ${testResults.systemPerformance.diskUsage}% <= ${successCriteria.systemPerformance.diskUsage}%`)
  }

  // Check healthcare compliance
  if (testResults.healthcareCompliance.lgpd < successCriteria.healthcareCompliance.lgpd) {
    console.log(`❌ LGPD Compliance: ${testResults.healthcareCompliance.lgpd}% < ${successCriteria.healthcareCompliance.lgpd}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ LGPD Compliance: ${testResults.healthcareCompliance.lgpd}% >= ${successCriteria.healthcareCompliance.lgpd}%`)
  }

  if (testResults.healthcareCompliance.anvisa < successCriteria.healthcareCompliance.anvisa) {
    console.log(`❌ ANVISA Compliance: ${testResults.healthcareCompliance.anvisa}% < ${successCriteria.healthcareCompliance.anvisa}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ ANVISA Compliance: ${testResults.healthcareCompliance.anvisa}% >= ${successCriteria.healthcareCompliance.anvisa}%`)
  }

  if (testResults.healthcareCompliance.cfm < successCriteria.healthcareCompliance.cfm) {
    console.log(`❌ CFM Compliance: ${testResults.healthcareCompliance.cfm}% < ${successCriteria.healthcareCompliance.cfm}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ CFM Compliance: ${testResults.healthcareCompliance.cfm}% >= ${successCriteria.healthcareCompliance.cfm}%`)
  }

  if (testResults.healthcareCompliance.wcag < successCriteria.healthcareCompliance.wcag) {
    console.log(`❌ WCAG Compliance: ${testResults.healthcareCompliance.wcag}% < ${successCriteria.healthcareCompliance.wcag}%`)
    allCriteriaMet = false
  } else {
    console.log(`✅ WCAG Compliance: ${testResults.healthcareCompliance.wcag}% >= ${successCriteria.healthcareCompliance.wcag}%`)
  }

  // Final result
  console.log('')
  if (allCriteriaMet) {
    console.log('🎉 All success criteria are met! Bun migration is successful.')
  } else {
    console.log('❌ Some success criteria are not met. Bun migration needs improvement.')
  }

  // Save test results to a file
  writeFileSync(
    join(process.cwd(), 'bun-migration-validation-results.json'),
    JSON.stringify({
      successCriteria,
      testResults,
      allCriteriaMet,
      timestamp: new Date().toISOString(),
    }, null, 2)
  )

  return allCriteriaMet
}

// Run the validation
validateAll().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('Validation failed:', error)
  process.exit(1)
})
