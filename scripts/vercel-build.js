#!/usr/bin/env node

/**
 * 🚀 Vercel Build Script for NeonPro Healthcare
 * 
 * This script handles the build process for Vercel deployment,
 * managing Prisma generation and build optimization.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 NeonPro Healthcare - Vercel Build Starting...');

// Check if we're in Vercel environment
const isVercel = process.env.VERCEL === '1';
const skipPrisma = process.env.SKIP_PRISMA_GENERATE_ON_VERCEL === 'true';

console.log(`Environment: ${isVercel ? 'Vercel' : 'Local'}`);
console.log(`Skip Prisma: ${skipPrisma}`);

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  if (isVercel) {
    execSync('npm ci', { stdio: 'inherit' });
  }

  // Step 2: Generate Prisma Client (conditionally)
  if (!skipPrisma) {
    console.log('🔄 Generating Prisma client...');
    try {
      // Check if schema exists
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully');
      } else {
        console.log('⚠️  Prisma schema not found, skipping generation');
      }
    } catch (error) {
      console.warn('⚠️  Prisma generation failed, continuing build:', error.message);
    }
  } else {
    console.log('⏭️  Skipping Prisma generation (SKIP_PRISMA_GENERATE_ON_VERCEL=true)');
  }

  // Step 3: Build the application
  console.log('🏗️  Building application...');
  execSync('turbo build', { stdio: 'inherit' });

  console.log('🎉 Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}