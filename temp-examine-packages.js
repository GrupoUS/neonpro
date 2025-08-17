// Temporary file to examine package.json files
const fs = require('fs');
const path = require('path');

// Read main package.json
try {
  const mainPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
  );
  console.log('=== ROOT PACKAGE.JSON DEPENDENCIES ===');
  console.log('Dependencies:', mainPkg.dependencies);
  console.log('DevDependencies:', mainPkg.devDependencies);
  console.log();
} catch (error) {
  console.error('Error reading main package.json:', error.message);
}

// Read web app package.json
try {
  const webPkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'apps', 'web', 'package.json'), 'utf8')
  );
  console.log('=== WEB APP PACKAGE.JSON ===');
  console.log('Dependencies:', webPkg.dependencies);
  console.log('DevDependencies:', webPkg.devDependencies);
  console.log('Scripts:', webPkg.scripts);
  console.log();
} catch (error) {
  console.error('Error reading web package.json:', error.message);
}

// Read next.config.mjs content
try {
  const nextConfig = fs.readFileSync(
    path.join(__dirname, 'apps', 'web', 'next.config.mjs'),
    'utf8'
  );
  console.log('=== NEXT.CONFIG.MJS CONTENT ===');
  console.log(nextConfig);
  console.log('=== END NEXT CONFIG ===');
} catch (error) {
  console.error('Error reading next.config.mjs:', error.message);
}
