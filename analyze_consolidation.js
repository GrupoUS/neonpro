const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO SOURCE CODE CONSOLIDATION ANALYSIS');
console.log('='.repeat(80));

// 1. Read Story File
console.log('\n📋 STORY 2.5 REQUIREMENTS:');
const storyPath = 'E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md';
try {
  if (fs.existsSync(storyPath)) {
    const storyContent = fs.readFileSync(storyPath, 'utf8');
    console.log(storyContent);
  } else {
    console.log('❌ Story file not found. Available stories:');
    const storiesDir = path.dirname(storyPath);
    const files = fs.readdirSync(storiesDir);
    files.filter(f => f.includes('2.5')).forEach(file => console.log(`  - ${file}`));
  }
} catch (error) {
  console.error('Error reading story:', error.message);
}

// 2. Analyze Root src/ Structure
console.log('\n📁 ROOT SRC/ STRUCTURE ANALYSIS:');
function analyzeStructure(dirPath, prefix = '') {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        console.log(`${prefix}📁 ${item.name}/`);
        if (prefix.length < 8) {
          analyzeStructure(fullPath, prefix + '  ');
        }
      } else {
        const stats = fs.statSync(fullPath);
        console.log(`${prefix}📄 ${item.name} (${Math.round(stats.size/1024)}KB)`);
      }
    });
  } catch (error) {
    console.log(`${prefix}❌ Error: ${error.message}`);
  }
}

analyzeStructure('E:\\neonpro\\src');

// 3. Analyze apps/web Structure 
console.log('\n🎯 APPS/WEB TARGET STRUCTURE:');
analyzeStructure('E:\\neonpro\\apps\\web', '');

// 4. Create Migration Plan
console.log('\n📋 MIGRATION PLAN:');
console.log('1. src/hooks/ → apps/web/hooks/');
console.log('2. src/services/ → apps/web/lib/services/'); 
console.log('3. src/__tests__/ → apps/web/__tests__/');
console.log('4. src/app/ → merge with apps/web/app/');
console.log('5. Update import paths');
console.log('6. Validate TypeScript compilation');