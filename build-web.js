#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🚀 Starting NeonPro Web Build for Vercel...')

try {
  // Change to web app directory
  const webAppDir = './apps/web'
  console.log(`📁 Web app directory: ${webAppDir}`)

  if (!fs.existsSync(webAppDir)) {
    console.log('📁 Directory structure:')
    console.log(fs.readdirSync('.'))
    throw new Error(`Web app directory not found: ${webAppDir}`)
  }

  process.chdir(webAppDir)

  // Install dependencies
  console.log('📦 Installing dependencies...')
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' })

  // Build the application
  console.log('🔨 Building application...')
  execSync('npm run build:vercel', { stdio: 'inherit' })

  console.log('✅ Build completed successfully!')
} catch (_error) {
  console.error('❌ Build failed:', _error.message)
  process.exit(1)
}
