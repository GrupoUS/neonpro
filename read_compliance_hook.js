const fs = require('fs');
const content = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
console.log('=== useComplianceAutomation.ts ===');
console.log(content);
console.log('='.repeat(50));
console.log('File exists:', fs.existsSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts'));
console.log('File size:', content.length, 'characters');