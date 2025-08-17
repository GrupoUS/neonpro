const fs = require('fs');

const src = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';
const dest = 'E:\\neonpro\\apps\\web\\hooks\\useComplianceAutomation.ts';

console.log('Reading source file...');
const content = fs.readFileSync(src, 'utf8');
console.log('Writing to destination...');
fs.writeFileSync(dest, content);
console.log('✅ Hook migrated successfully!');