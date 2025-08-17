const fs = require('fs');
const path = require('path');

try {
  const anvisaIndexPath = path.join(__dirname, 'packages/compliance/src/anvisa/index.ts');
  const content = fs.readFileSync(anvisaIndexPath, 'utf8');
  console.log('=== ANVISA INDEX CONTENT ===');
  console.log(content);
} catch (error) {
  console.error('Error reading file:', error.message);
}