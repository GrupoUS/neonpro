// Temporary file to examine TypeScript configuration
const fs = require('fs');
const path = require('path');

// Read root tsconfig.json
try {
  const rootTsConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8')
  );
  console.log('=== ROOT TSCONFIG.JSON ===');
  console.log(JSON.stringify(rootTsConfig, null, 2));
  console.log();
} catch (error) {
  console.error('Error reading root tsconfig.json:', error.message);
}

// Read web app tsconfig.json
try {
  const webTsConfig = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'apps', 'web', 'tsconfig.json'),
      'utf8'
    )
  );
  console.log('=== WEB APP TSCONFIG.JSON ===');
  console.log(JSON.stringify(webTsConfig, null, 2));
  console.log();
} catch (error) {
  console.error('Error reading web tsconfig.json:', error.message);
}
