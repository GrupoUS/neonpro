const fs = require('fs');

// Try to find the story file
const possiblePaths = [
  'E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md',
  'docs/shards/stories/2.5.source-code-consolidation.md',
  './docs/shards/stories/2.5.source-code-consolidation.md'
];

for (const storyPath of possiblePaths) {
  try {
    console.log(`Trying: ${storyPath}`);
    const content = fs.readFileSync(storyPath, 'utf8');
    console.log('✅ Found story file!');
    console.log('='.repeat(80));
    console.log(content);
    break;
  } catch (error) {
    console.log(`❌ Not found: ${error.message}`);
  }
}