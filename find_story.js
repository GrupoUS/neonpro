const fs = require('fs');
const path = require('path');

// Find all files with 2.5 in the stories directory
const storiesDir = 'E:\\neonpro\\docs\\shards\\stories';
console.log('Looking for Story 2.5 files...');

if (fs.existsSync(storiesDir)) {
  const files = fs.readdirSync(storiesDir);
  const story25Files = files.filter(f => f.includes('2.5'));
  
  console.log('Found files:', story25Files);
  
  story25Files.forEach(file => {
    const fullPath = path.join(storiesDir, file);
    console.log(`\n=== ${file} ===`);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      console.log(content.substring(0, 1000));
      if (content.length > 1000) console.log('...(truncated)');
    } catch (error) {
      console.log('Error reading:', error.message);
    }
  });
} else {
  console.log('Stories directory not found');
}