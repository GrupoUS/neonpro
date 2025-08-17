const fs = require('node:fs');
const _path = require('node:path');

console.log('=== CURRENT NEONPRO STRUCTURE ANALYSIS ===\n');

// Check middleware
const middlewarePath = './middleware.ts';
if (fs.existsSync(middlewarePath)) {
  console.log('✅ Middleware exists');
  console.log('--- MIDDLEWARE CONTENT ---');
  console.log(fs.readFileSync(middlewarePath, 'utf8'));
  console.log('--- END MIDDLEWARE ---\n');
} else {
  console.log('❌ Middleware missing\n');
}

// Check package.json
const packagePath = './package.json';
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ Package.json analysis:');
  console.log('Next.js:', pkg.dependencies?.next || 'Missing');
  console.log('React:', pkg.dependencies?.react || 'Missing');

  console.log('\nSupabase packages:');
  Object.keys(pkg.dependencies || {})
    .filter((dep) => dep.includes('supabase'))
    .forEach((dep) => { console.log(`  ${dep}: ${pkg.dependencies[dep]}`); });

  console.log('\nAuth packages:');
  Object.keys(pkg.dependencies || {})
    .filter((dep) => dep.includes('auth') || dep.includes('clerk'))
    .forEach((dep) => { console.log(`  ${dep}: ${pkg.dependencies[dep]}`); });
  console.log('');
}

// Check layout
const layoutPath = './app/layout.tsx';
if (fs.existsSync(layoutPath)) {
  console.log('✅ Layout exists');
  console.log('--- LAYOUT CONTENT ---');
  console.log(fs.readFileSync(layoutPath, 'utf8'));
  console.log('--- END LAYOUT ---\n');
} else {
  console.log('❌ Layout missing\n');
}

console.log('=== ANALYSIS COMPLETE ===');
