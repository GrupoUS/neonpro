const fs = require('fs');
const path = require('path');

// Function to safely read files
function safeReadFile(filePath, label) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`\n=== ${label} ===`);
      console.log(content);
      console.log(`=== END ${label} ===\n`);
      return content;
    } else {
      console.log(`\n${label}: File does not exist at ${filePath}\n`);
      return null;
    }
  } catch (error) {
    console.log(`\nError reading ${label}: ${error.message}\n`);
    return null;
  }
}

// Read current files
const basePath = __dirname;
const webPath = path.join(basePath, 'apps', 'web');

// Read middleware
safeReadFile(path.join(webPath, 'middleware.ts'), 'CURRENT MIDDLEWARE.TS');

// Read layout
safeReadFile(path.join(webPath, 'app', 'layout.tsx'), 'CURRENT LAYOUT.TSX');

// Read page
safeReadFile(path.join(webPath, 'app', 'page.tsx'), 'CURRENT PAGE.TSX');

// Read package.json for dependencies
const packagePath = path.join(webPath, 'package.json');
try {
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  console.log('\n=== CURRENT DEPENDENCIES ===');
  console.log('Next.js version:', packageJson.dependencies?.['next'] || 'Not found');
  console.log('React version:', packageJson.dependencies?.['react'] || 'Not found');
  console.log('\nSupabase dependencies:');
  Object.keys(packageJson.dependencies || {})
    .filter(dep => dep.includes('supabase'))
    .forEach(dep => {
      console.log(`  ${dep}: ${packageJson.dependencies[dep]}`);
    });
    
  console.log('\nAuth-related dependencies:');
  Object.keys(packageJson.dependencies || {})
    .filter(dep => dep.includes('auth') || dep.includes('clerk'))
    .forEach(dep => {
      console.log(`  ${dep}: ${packageJson.dependencies[dep]}`);
    });
  console.log('=== END DEPENDENCIES ===\n');
} catch (error) {
  console.log('Error reading package.json:', error.message);
}