const fs = require('fs');
const path = require('path');

// Read current middleware
const middlewarePath = path.join(__dirname, 'apps', 'web', 'middleware.ts');
try {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  console.log('=== CURRENT MIDDLEWARE.TS ===');
  console.log(middlewareContent);
  console.log('\n');
} catch (error) {
  console.log('Error reading middleware:', error.message);
}

// Read current layout
const layoutPath = path.join(__dirname, 'apps', 'web', 'app', 'layout.tsx');
try {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  console.log('=== CURRENT LAYOUT.TSX ===');
  console.log(layoutContent);
  console.log('\n');
} catch (error) {
  console.log('Error reading layout:', error.message);
}

// Read current page
const pagePath = path.join(__dirname, 'apps', 'web', 'app', 'page.tsx');
try {
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  console.log('=== CURRENT PAGE.TSX ===');
  console.log(pageContent);
  console.log('\n');
} catch (error) {
  console.log('Error reading page:', error.message);
}

// Check package.json for current dependencies
const packagePath = path.join(__dirname, 'apps', 'web', 'package.json');
try {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  console.log('=== CURRENT DEPENDENCIES ===');
  console.log('Next.js version:', packageJson.dependencies['next'] || 'Not found');
  console.log('React version:', packageJson.dependencies['react'] || 'Not found');
  console.log('Supabase dependencies:');
  Object.keys(packageJson.dependencies || {}).filter(dep => dep.includes('supabase')).forEach(dep => {
    console.log(`  ${dep}: ${packageJson.dependencies[dep]}`);
  });
  console.log('\n');
} catch (error) {
  console.log('Error reading package.json:', error.message);
}