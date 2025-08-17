const fs = require('fs');

// Read story file first
console.log('=== STORY 2.5 CONTENT ===');
try {
  const story = fs.readFileSync('E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md', 'utf8');
  console.log(story);
} catch (error) {
  console.log('Story file not found, checking directory...');
  try {
    const files = fs.readdirSync('E:\\neonpro\\docs\\shards\\stories');
    console.log('Available story files:', files.filter(f => f.includes('2.5')));
  } catch (e) {
    console.log('Cannot access stories directory');
  }
}

console.log('\n=== ROOT SRC ANALYSIS ===');
function quickList(dir, label) {
  try {
    console.log(`\n${label}:`);
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
      console.log(`  ${item.isDirectory() ? '📁' : '📄'} ${item.name}`);
    });
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

quickList('E:\\neonpro\\src', 'Root src/');
quickList('E:\\neonpro\\src\\hooks', 'Root src/hooks/');
quickList('E:\\neonpro\\src\\services', 'Root src/services/');
quickList('E:\\neonpro\\apps\\web', 'Target apps/web/');
quickList('E:\\neonpro\\apps\\web\\hooks', 'Target apps/web/hooks/');
quickList('E:\\neonpro\\apps\\web\\lib', 'Target apps/web/lib/');