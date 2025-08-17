const fs = require('fs');

console.log('🚀 STARTING SOURCE CODE CONSOLIDATION');
console.log('Healthcare Quality Target: ≥9.9/10');
console.log('='.repeat(60));

// 1. Examine useComplianceAutomation.ts
console.log('📄 EXAMINING: useComplianceAutomation.ts');
const hookPath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';

if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  console.log('✅ Found hook file:');
  console.log(hookContent);
  console.log(`\nFile size: ${hookContent.length} characters`);
} else {
  console.log('❌ Hook file not found');
}

// 2. List service files
console.log('\n📁 SERVICE FILES TO MIGRATE:');
const servicesDir = 'E:\\neonpro\\src\\services';
if (fs.existsSync(servicesDir)) {
  const serviceFiles = fs.readdirSync(servicesDir);
  serviceFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  console.log(`\nTotal: ${serviceFiles.length} service files`);
} else {
  console.log('❌ Services directory not found');
}

// 3. Check target directories
console.log('\n🎯 CHECKING TARGET DIRECTORIES:');
const targets = [
  'E:\\neonpro\\apps\\web\\hooks',
  'E:\\neonpro\\apps\\web\\lib',
  'E:\\neonpro\\apps\\web\\__tests__'
];

targets.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}`);
});

console.log('\n📋 Ready to start migration process...');