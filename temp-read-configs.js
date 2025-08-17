const fs = require('fs');
const path = require('path');

console.log('=== EXAMINING NEONPRO HEALTHCARE CONFIGURATION ===\n');

// Read next.config.mjs
try {
  const nextConfig = fs.readFileSync('./apps/web/next.config.mjs', 'utf8');
  console.log('📄 NEXT.CONFIG.MJS (CHECKING FOR DANGEROUS SETTINGS):');
  console.log(nextConfig);
  console.log('\n' + '='.repeat(60) + '\n');
} catch (error) {
  console.error('❌ Error reading next.config.mjs:', error.message);
}

// Read web app package.json
try {
  const webPkg = JSON.parse(fs.readFileSync('./apps/web/package.json', 'utf8'));
  console.log('📦 WEB APP PACKAGE.JSON - REACT VERSION:');
  console.log('React:', webPkg.dependencies?.react || 'NOT FOUND');
  console.log('React-DOM:', webPkg.dependencies?.['react-dom'] || 'NOT FOUND');
  console.log('Next:', webPkg.dependencies?.next || 'NOT FOUND');
  console.log('\n' + '='.repeat(60) + '\n');
} catch (error) {
  console.error('❌ Error reading web package.json:', error.message);
}

// Read web app tsconfig.json
try {
  const webTsConfig = JSON.parse(
    fs.readFileSync('./apps/web/tsconfig.json', 'utf8')
  );
  console.log('⚙️ WEB APP TSCONFIG.JSON - STRICT MODE:');
  console.log('Strict:', webTsConfig.compilerOptions?.strict);
  console.log('NoImplicitAny:', webTsConfig.compilerOptions?.noImplicitAny);
  console.log(
    'StrictNullChecks:',
    webTsConfig.compilerOptions?.strictNullChecks
  );
  console.log('\n' + '='.repeat(60) + '\n');
} catch (error) {
  console.error('❌ Error reading web tsconfig.json:', error.message);
}

console.log('🏥 ANALYSIS COMPLETE - READY FOR HEALTHCARE FIXES');
