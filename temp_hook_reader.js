const fs = require('fs');
const content = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
console.log('=== ACTUAL CONTENT ===');
console.log(content);
fs.writeFileSync('E:\\neonpro\\apps\\web\\hooks\\useComplianceAutomation.ts', content);
console.log('✅ MIGRATED!');