const fs = require('fs');

console.log('🔍 EXAMINING FILES FOR MIGRATION');

// 1. Check useComplianceAutomation.ts
console.log('\n📄 src/hooks/useComplianceAutomation.ts:');
try {
  const hookContent = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
  console.log('Content preview:');
  console.log(hookContent.substring(0, 300) + '...');
  console.log('Full length:', hookContent.length, 'characters');
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 2. List all service files
console.log('\n📁 src/services/ files:');
try {
  const serviceFiles = fs.readdirSync('E:\\neonpro\\src\\services');
  serviceFiles.forEach(file => {
    const filePath = `E:\\neonpro\\src\\services\\${file}`;
    const stats = fs.statSync(filePath);
    console.log(`  📄 ${file} (${Math.round(stats.size/1024)}KB)`);
  });
} catch (error) {
  console.log('❌ Error:', error.message);
}

// 3. Check target directories
console.log('\n🎯 TARGET DIRECTORIES:');
const targets = [
  'E:\\neonpro\\apps\\web\\hooks',
  'E:\\neonpro\\apps\\web\\lib',
  'E:\\neonpro\\apps\\web\\lib\\services',
  'E:\\neonpro\\apps\\web\\__tests__'
];

targets.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (exists) {
    try {
      const files = fs.readdirSync(dir);
      console.log(`     Contains ${files.length} items`);
    } catch (e) {
      console.log('     Cannot read contents');
    }
  }
});