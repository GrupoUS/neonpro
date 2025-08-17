const fs = require('fs');

// Read the compliance automation hook
const hookPath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';

console.log('📄 useComplianceAutomation.ts Content:');
console.log('='.repeat(60));

if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');
  console.log(content);
} else {
  console.log('❌ File not found');
}

console.log('\n📁 Service Files:');
const servicesDir = 'E:\\neonpro\\src\\services';
if (fs.existsSync(servicesDir)) {
  const files = fs.readdirSync(servicesDir);
  files.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('❌ Services directory not found');
}