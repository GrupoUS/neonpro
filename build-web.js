#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')

console.warn('🚀 Starting NeonPro Web Build for Vercel...')

try {
  // Change to web app directory
  const webAppDir = './apps/web'
  console.warn(`📁 Web app directory: ${webAppDir}`)

  if (!fs.existsSync(webAppDir)) {
    console.warn('📁 Directory structure:')
    console.warn(fs.readdirSync('.'))
    throw new Error(`Web app directory not found: ${webAppDir}`)
  }

  process.chdir(webAppDir)

  // Install dependencies
  console.warn('📦 Installing dependencies...')
  execSync('bun install', { stdio: 'inherit' })

  // Build the application
  console.warn('🔨 Building application...')
  execSync('bun run build:vercel', { stdio: 'inherit' })

  console.warn('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', String(_error))
  process.exit(1)
}
