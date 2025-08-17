const fs = require('fs');

// Direct read attempt
const storyPath = 'E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md';

console.log('Attempting to read:', storyPath);
console.log('Exists:', fs.existsSync(storyPath));

if (fs.existsSync(storyPath)) {
  const content = fs.readFileSync(storyPath, 'utf8');
  console.log('Content length:', content.length);
  console.log('='.repeat(50));
  console.log(content);
} else {
  console.log('File not found. Listing directory contents:');
  const dir = 'E:\\neonpro\\docs\\shards\\stories';
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => console.log(' -', file));
  }
}