const fs = require('fs');
const path = require('path');

console.log('=== READING STORY 2.5 ===');
try {
  const storyPath = 'E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md';
  const content = fs.readFileSync(storyPath, 'utf8');
  console.log(content);
} catch (error) {
  console.error('Error reading story file:', error);
  console.log('\nListing stories directory:');
  try {
    const files = fs.readdirSync('E:\\neonpro\\docs\\shards\\stories');
    files.forEach(file => console.log('  ', file));
  } catch (dirError) {
    console.error('Error listing directory:', dirError);
  }
}

console.log('\n=== CURRENT ROOT SRC ANALYSIS ===');
function analyzeDirectory(dirPath, prefix = '') {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    items.forEach(item => {
      if (item.isDirectory()) {
        console.log(`${prefix}📁 ${item.name}/`);
        if (prefix.length < 6) { // Limit recursion depth
          analyzeDirectory(path.join(dirPath, item.name), prefix + '  ');
        }
      } else {
        console.log(`${prefix}📄 ${item.name}`);
      }
    });
  } catch (error) {
    console.log(`${prefix}❌ Error reading ${dirPath}: ${error.message}`);
  }
}

analyzeDirectory('E:\\neonpro\\src');