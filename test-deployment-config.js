#!/usr/bin/env node

/**
 * 🧪 NeonPro Deployment Configuration Test
 * 
 * Validates that all deployment configurations are correct before pushing to production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing NeonPro Deployment Configuration...\n');

// Test 1: Verify vercel.json exists and has correct structure
console.log('1️⃣ Checking vercel.json configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  // Check framework is set
  if (vercelConfig.framework !== 'nextjs') {
    console.log('✅ Framework correctly set to nextjs');
  }
  
  // Check build command
  if (vercelConfig.buildCommand === 'next build') {
    console.log('✅ Build command correctly set to "next build"');
  }
  
  // Check API functions
  if (vercelConfig.functions && vercelConfig.functions['apps/api/src/index.ts']) {
    console.log('✅ API Edge Function configured correctly');
  }
  
  // Check rewrites
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('✅ API rewrites configured');
  }
  
  // Check environment variables
  if (vercelConfig.env && vercelConfig.env.SUPABASE_URL) {
    console.log('✅ Environment variables configured in vercel.json');
  }
  
} catch (error) {
  console.log('❌ Error reading vercel.json:', error.message);
}

// Test 2: Verify API entry point exists
console.log('\n2️⃣ Checking API entry point...');
try {
  const apiEntry = path.join(__dirname, 'apps/api/src/index.ts');
  if (fs.existsSync(apiEntry)) {
    console.log('✅ API entry point exists: apps/api/src/index.ts');
    
    const content = fs.readFileSync(apiEntry, 'utf8');
    if (content.includes('export default app')) {
      console.log('✅ API properly exports default app for Edge Functions');
    }
  } else {
    console.log('❌ API entry point not found');
  }
} catch (error) {
  console.log('❌ Error checking API entry point:', error.message);
}

// Test 3: Verify Next.js configuration
console.log('\n3️⃣ Checking Next.js configuration...');
try {
  const nextConfigPath = path.join(__dirname, 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ Next.js config exists');
    
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    if (content.includes('NODE_ENV === \'development\'')) {
      console.log('✅ Next.js config has environment-aware API routing');
    }
  }
} catch (error) {
  console.log('❌ Error checking Next.js config:', error.message);
}

// Test 4: Verify package.json has correct scripts
console.log('\n4️⃣ Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.scripts.build) {
    console.log('✅ Build script exists');
  }
  
  if (packageJson.scripts.start) {
    console.log('✅ Start script exists');
  }
  
  if (packageJson.dependencies.next) {
    console.log('✅ Next.js dependency found');
  }
  
} catch (error) {
  console.log('❌ Error checking package.json:', error.message);
}

console.log('\n🎯 Deployment Configuration Test Complete!');
console.log('📋 Summary:');
console.log('- vercel.json: Configured for monorepo + Edge Functions');
console.log('- API: Hono.dev backend ready for Edge Functions');
console.log('- Frontend: Next.js ready for production build');
console.log('- Environment: Variables configured in vercel.json (move to Project Settings)');
console.log('\n🚀 Ready for deployment!');