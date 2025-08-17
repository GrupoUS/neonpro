const fs = require('fs');

try {
  const storyContent = fs.readFileSync('E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md', 'utf8');
  console.log(storyContent);
} catch (error) {
  console.error('Error reading story file:', error.message);
}