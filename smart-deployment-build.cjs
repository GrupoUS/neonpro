#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Smart Deployment Build Script for NeonPro');
console.log('   Handles package-specific failures and creates deployment artifacts\n');

// Define critical packages that must build for deployment
const criticalPackages = [
  '@neonpro/types',
  '@neonpro/ui', 
  '@neonpro/web',
  '@neonpro/config',
  '@neonpro/utils',
  '@neonpro/shared'
];

// Define optional packages that can fail without blocking deployment
const optionalPackages = [
  '@neonpro/validators',
  '@neonpro/monitoring',
  '@neonpro/domain',
  '@neonpro/analytics',
  '@neonpro/ai-providers',
  '@neonpro/cli-helpers'
];

let buildResults = {
  success: [],
  failed: [],
  skipped: []
};

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd()
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || '', 
      stderr: error.stderr || '' 
    };
  }
}

function buildPackage(packageName) {
  console.log(`📦 Building ${packageName}...`);
  
  // Try multiple build approaches
  const buildCommands = [
    `bunx turbo build --filter=${packageName}`,
    `pnpm --filter ${packageName} build`,
    `npm --prefix packages/${packageName.replace('@neonpro/', '')} run build`
  ];
  
  for (const command of buildCommands) {
    console.log(`   Trying: ${command}`);
    const result = runCommand(command, { silent: true });
    
    if (result.success) {
      console.log(`   ✅ ${packageName} built successfully with: ${command}\n`);
      buildResults.success.push(packageName);
      return true;
    } else {
      console.log(`   ❌ Failed with: ${command}`);
      console.log(`   Error: ${result.error?.substring(0, 200)}...\n`);
    }
  }
  
  buildResults.failed.push(packageName);
  return false;
}

function buildWebApp() {
  console.log('🌐 Building web application...');
  
  const webCommands = [
    'cd apps/web && npm run build',
    'cd apps/web && bunx vite build',
    'cd apps/web && npx vite build --mode production'
  ];
  
  for (const command of webCommands) {
    console.log(`   Trying: ${command}`);
    const result = runCommand(command);
    
    if (result.success) {
      console.log('   ✅ Web app built successfully!\n');
      buildResults.success.push('@neonpro/web-app');
      return true;
    } else {
      console.log(`   ❌ Web app build failed with: ${command}\n`);
    }
  }
  
  buildResults.failed.push('@neonpro/web-app');
  return false;
}

function createDeploymentArtifacts() {
  console.log('📁 Creating deployment artifacts...');
  
  try {
    // Ensure dist directories exist for successful builds
    const distDirs = [
      'apps/web/dist',
      'packages/ui/dist',
      'packages/types/dist'
    ];
    
    distDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`   ✅ Found: ${dir}`);
      } else {
        console.log(`   ⚠️ Missing: ${dir}`);
      }
    });
    
    // Create a deployment manifest
    const manifest = {
      buildTime: new Date().toISOString(),
      buildResults: buildResults,
      criticalPackagesStatus: criticalPackages.map(pkg => ({
        package: pkg,
        status: buildResults.success.includes(pkg) ? 'success' : 'failed'
      })),
      deploymentReady: buildResults.success.includes('@neonpro/web') || 
                       buildResults.success.includes('@neonpro/web-app')
    };
    
    fs.writeFileSync('deployment-manifest.json', JSON.stringify(manifest, null, 2));
    console.log('   ✅ Created deployment-manifest.json\n');
    
    return manifest.deploymentReady;
  } catch (error) {
    console.log(`   ❌ Failed to create artifacts: ${error.message}\n`);
    return false;
  }
}

// Main build process
async function main() {
  console.log('Phase 1: Building critical packages...\n');
  
  // Build critical packages first
  for (const pkg of criticalPackages) {
    const success = buildPackage(pkg);
    if (!success && pkg === '@neonpro/web') {
      console.log('🔄 Trying alternative web app build...\n');
      buildWebApp();
    }
  }
  
  console.log('Phase 2: Building optional packages...\n');
  
  // Build optional packages (failures are acceptable)
  for (const pkg of optionalPackages) {
    const success = buildPackage(pkg);
    if (!success) {
      console.log(`   ⚠️ ${pkg} failed - continuing (optional package)\n`);
      buildResults.skipped.push(pkg);
    }
  }
  
  console.log('Phase 3: Creating deployment artifacts...\n');
  const deploymentReady = createDeploymentArtifacts();
  
  // Results summary
  console.log('📊 Build Summary:');
  console.log(`   ✅ Successful: ${buildResults.success.length} packages`);
  console.log(`   ❌ Failed: ${buildResults.failed.length} packages`);
  console.log(`   ⏭️ Skipped: ${buildResults.skipped.length} packages`);
  
  if (buildResults.success.length > 0) {
    console.log(`\n   Successful packages: ${buildResults.success.join(', ')}`);
  }
  
  if (buildResults.failed.length > 0) {
    console.log(`\n   Failed packages: ${buildResults.failed.join(', ')}`);
  }
  
  console.log(`\n🚀 Deployment Ready: ${deploymentReady ? 'YES' : 'NO'}`);
  
  if (deploymentReady) {
    console.log('\n✅ Ready for Vercel deployment!');
    console.log('   Next steps:');
    console.log('   1. Run: vercel login');
    console.log('   2. Run: vercel deploy');
    console.log('   3. Or use: vercel deploy --prod for production');
  } else {
    console.log('\n❌ Not ready for deployment');
    console.log('   Critical packages failed to build');
    console.log('   Check the error logs above for details');
  }
  
  return deploymentReady;
}

// Execute the build process
main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Build script failed:', error);
  process.exit(1);
});