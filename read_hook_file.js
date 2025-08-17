const fs = require('fs');

// Read the compliance hook file
const hookPath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';

console.log('📄 Reading useComplianceAutomation.ts:');
console.log('='.repeat(50));

if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');
  console.log(content);
  console.log('='.repeat(50));
  console.log('File size:', content.length, 'characters');
} else {
  console.log('❌ File not found at:', hookPath);
}