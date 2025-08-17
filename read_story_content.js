const fs = require('fs');

const storyPath = 'E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md';

console.log('Reading story file...');
try {
  if (fs.existsSync(storyPath)) {
    const content = fs.readFileSync(storyPath, 'utf8');
    console.log('✅ Story file found and read successfully!');
    console.log('='.repeat(80));
    console.log(content);
    console.log('='.repeat(80));
  } else {
    console.log('❌ Story file not found at:', storyPath);
    
    // List the actual files in the directory
    console.log('\nActual files in stories directory:');
    const storiesDir = 'E:\\neonpro\\docs\\shards\\stories';
    if (fs.existsSync(storiesDir)) {
      const files = fs.readdirSync(storiesDir);
      files.forEach(file => {
        console.log(' -', file);
      });
    }
  }
} catch (error) {
  console.error('Error reading file:', error.message);
}