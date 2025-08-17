const fs = require('fs');

// Read the source file
const sourcePath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';
const content = fs.readFileSync(sourcePath, 'utf8');

console.log('📄 SOURCE FILE CONTENT:');
console.log('='.repeat(60));
console.log(content);
console.log('='.repeat(60));

// Copy to target location
const targetPath = 'E:\\neonpro\\apps\\web\\hooks\\useComplianceAutomation.ts';
fs.writeFileSync(targetPath, content, 'utf8');

console.log('✅ MIGRATED to:', targetPath);
console.log('File size:', content.length, 'characters');