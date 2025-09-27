/**
 * Browser-compatible entry point for the API
 * This excludes Node.js specific code for Vercel deployment
 */

export { default as app } from './app.js'
export * from './app.js'

// Re-export commonly used types and utilities
export * from './trpc/index.js'
export * from './utils/index.js'

// Note: Node.js specific functionality (server startup, graceful shutdown)
// is handled in the main index.ts file which is not included in browser builds

// Re-export browser-compatible error tracking only
export * from './config/error-tracking-browser.js'
export * from './services/error-tracking-browser.js'
