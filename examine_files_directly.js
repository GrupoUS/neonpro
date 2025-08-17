const fs = require('fs');
const path = require('path');

console.log('=== EXAMINING CURRENT PROJECT STRUCTURE ===\n');

// Read middleware.ts
const middlewarePath = path.join(__dirname, 'apps', 'web', 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('=== CURRENT MIDDLEWARE.TS ===');
  console.log(fs.readFileSync(middlewarePath, 'utf8'));
  console.log('=== END MIDDLEWARE.TS ===\n');
}

// Read layout.tsx  
const layoutPath = path.join(__dirname, 'apps', 'web', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  console.log('=== CURRENT LAYOUT.TSX ===');
  console.log(fs.readFileSync(layoutPath, 'utf8'));
  console.log('=== END LAYOUT.TSX ===\n');
}

// Read package.json
const packagePath = path.join(__dirname, 'apps', 'web', 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('=== KEY DEPENDENCIES ===');
  console.log('Next.js:', pkg.dependencies?.['next'] || 'Not found');
  console.log('React:', pkg.dependencies?.['react'] || 'Not found');
  
  const supabaseDeps = Object.keys(pkg.dependencies || {}).filter(dep => dep.includes('supabase'));
  console.log('Supabase deps:', supabaseDeps.map(dep => `${dep}: ${pkg.dependencies[dep]}`).join(', '));
  
  const authDeps = Object.keys(pkg.dependencies || {}).filter(dep => dep.includes('auth') || dep.includes('clerk'));
  console.log('Auth deps:', authDeps.map(dep => `${dep}: ${pkg.dependencies[dep]}`).join(', '));
  console.log('=== END DEPENDENCIES ===\n');
}