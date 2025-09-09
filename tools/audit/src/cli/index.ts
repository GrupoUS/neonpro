#!/usr/bin/env node

/**
 * NeonPro Audit CLI Entry Point
 *
 * Simple entry point that imports and runs the main CLI application.
 * This file serves as the executable entry point for the npm package.
 */

import { AuditCLI, } from './audit-cli'

async function main() {
  const cli = new AuditCLI()
  await cli.run()
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise,) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason,)
  process.exit(1,)
},)

// Handle uncaught exceptions
process.on('uncaughtException', (error,) => {
  console.error('Uncaught Exception thrown:', error,)
  process.exit(1,)
},)

// Run the CLI
main().catch((error,) => {
  console.error('Fatal error:', error,)
  process.exit(1,)
},)
