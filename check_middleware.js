// Quick check of middleware file
const fs = require('fs');
const path = require('path');

try {
  const middlewarePath = path.resolve(__dirname, 'apps', 'web', 'middleware.ts');
  console.log('Reading middleware from:', middlewarePath);
  
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    console.log('Middleware content length:', content.length);
    console.log('First 500 chars:');
    console.log(content.substring(0, 500));
    console.log('\n--- FULL CONTENT ---');
    console.log(content);
  } else {
    console.log('Middleware file does not exist');
  }
} catch (error) {
  console.error('Error:', error.message);
}