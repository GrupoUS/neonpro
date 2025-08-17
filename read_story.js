const fs = require('fs');

console.log('Reading story file...');
try {
  const content = fs.readFileSync('E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md', 'utf8');
  console.log(content);
} catch (error) {
  console.error('Error:', error.message);
}