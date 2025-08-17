// Temporary file to examine next.config.mjs content
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'apps', 'web', 'next.config.mjs');
try {
  const content = fs.readFileSync(configPath, 'utf8');
  console.log('=== CURRENT next.config.mjs CONTENT ===');
  console.log(content);
  console.log('=== END CONTENT ===');
} catch (error) {
  console.error('Error reading file:', error.message);
}
