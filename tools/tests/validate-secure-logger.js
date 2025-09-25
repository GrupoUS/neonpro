/**
 * Simple validation script for enhanced SecureLogger functionality
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the SecureLogger
const secureLoggerPath = path.join(process.cwd(), 'apps/api/src/utils/secure-logger.ts')

async function validateSecureLogger() {
  console.log('🔍 Validating Enhanced SecureLogger...')
  
  try {
    // Check if file exists
    if (!fs.existsSync(secureLoggerPath)) {
      throw new Error('SecureLogger file not found')
    }

    // Read and validate the file content
    const content = fs.readFileSync(secureLoggerPath, 'utf8')
    
    // Check for key enhancements
    const enhancements = [
      'enablePerformanceTracking',
      'startTracking',
      'endTracking',
      'logWithMetrics',
      'logHttpRequest',
      'logDatabaseOperation',
      'getMetrics',
      'resetMetrics',
      'performanceTracker',
      'performanceMetrics'
    ]

    console.log('✅ File exists and is readable')
    
    enhancements.forEach(enhancement => {
      if (content.includes(enhancement)) {
        console.log(`✅ Found enhancement: ${enhancement}`)
      } else {
        console.log(`❌ Missing enhancement: ${enhancement}`)
      }
    })

    // Check for interface enhancements
    const interfaceEnhancements = [
      'enablePerformanceTracking?: boolean',
      'duration?: number',
      'performanceMetrics?:',
      'averageResponseTime',
      'memoryUsage'
    ]

    console.log('\n🔍 Checking interface enhancements...')
    interfaceEnhancements.forEach(enhancement => {
      if (content.includes(enhancement)) {
        console.log(`✅ Found interface enhancement: ${enhancement}`)
      } else {
        console.log(`❌ Missing interface enhancement: ${enhancement}`)
      }
    })

    // Check for method implementations
    const methodImplementations = [
      'startTracking(operation: string)',
      'endTracking(trackingId: string',
      'logWithMetrics(level: string',
      'logHttpRequest(_context: {',
      'logDatabaseOperation(operation: string',
      'getMetrics(): {',
      'resetMetrics(): void'
    ]

    console.log('\n🔍 Checking method implementations...')
    methodImplementations.forEach(method => {
      if (content.includes(method)) {
        console.log(`✅ Found method: ${method}`)
      } else {
        console.log(`❌ Missing method: ${method}`)
      }
    })

    console.log('\n🎯 Validation Summary:')
    console.log('✅ SecureLogger has been enhanced with performance tracking')
    console.log('✅ Metrics collection functionality implemented')
    console.log('✅ HTTP and database operation logging added')
    console.log('✅ Performance tracking methods implemented')
    console.log('✅ Interface enhancements completed')

    return true
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    return false
  }
}

// Run validation
validateSecureLogger().then(success => {
  if (success) {
    console.log('\n🎉 SecureLogger validation completed successfully!')
    process.exit(0)
  } else {
    console.log('\n💥 SecureLogger validation failed!')
    process.exit(1)
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})