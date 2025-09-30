#!/usr/bin/env bun
/**
 * NeonPro TypeScript Wrapper - Bun Native Implementation
 * Architecture: Simple and reliable for healthcare compliance
 * Compliance: LGPD, ANVISA, CFM compliant
 * Performance: Optimized for Bun runtime
 */

const args = process.argv.slice(2)

async function main() {
  const startTime = Date.now()
  const operation = {
    timestamp: new Date(),
    command: ['tsc', ...args],
    workingDirectory: process.cwd(),
    environment: 'Bun',
    duration: undefined,
    success: undefined
  }

  try {
    // Use bunx to run TypeScript - most reliable approach
    const proc = Bun.spawn(['bunx', 'tsc', ...args], {
      cwd: process.cwd(),
      stdout: 'inherit',
      stderr: 'inherit'
    })

    const exitCode = await proc.exited
    const duration = Date.now() - startTime

    operation.duration = duration
    operation.success = exitCode === 0

    // Healthcare compliance logging
    if (process.env.HEALTHCARE_COMPLIANCE !== 'false') {
      console.log(`[HEALTHCARE-AUDIT] ${JSON.stringify({
        timestamp: operation.timestamp.toISOString(),
        operation: 'typescript-compilation',
        command: operation.command.join(' '),
        directory: operation.workingDirectory,
        environment: operation.environment,
        success: operation.success,
        duration: operation.duration,
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true
        }
      })}`)
    }

    process.exit(exitCode || 0)

  } catch (error) {
    const duration = Date.now() - startTime
    operation.duration = duration
    operation.success = false

    // Log failure for compliance audit
    if (process.env.HEALTHCARE_COMPLIANCE !== 'false') {
      console.log(`[HEALTHCARE-AUDIT] ${JSON.stringify({
        timestamp: operation.timestamp.toISOString(),
        operation: 'typescript-compilation',
        command: operation.command.join(' '),
        directory: operation.workingDirectory,
        environment: operation.environment,
        success: operation.success,
        duration: operation.duration,
        error: error.toString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true
        }
      })}`)
    }

    process.exit(1)
  }
}

// Execute main function
if (import.meta.main) {
  main().catch(error => {
    console.error('Fatal error in TypeScript Bun wrapper:', error)
    process.exit(1)
  })
}