/**
 * Browser-compatible entry point for the API
 * This excludes Node.js specific code for Vercel deployment
 */

export { default as app } from './app'
export * from './app'

// Re-export commonly used types and utilities
export * from './trpc'
export * from './utils'
export * from './services'

// Note: Node.js specific functionality (server startup, graceful shutdown)
// is handled in the main index.ts file which is not included in browser builds