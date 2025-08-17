const fs = require('fs');

const source = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';
const target = 'E:\\neonpro\\apps\\web\\hooks\\useComplianceAutomation.ts';

try {
  const content = fs.readFileSync(source, 'utf8');
  fs.writeFileSync(target, content, 'utf8');
  console.log('✅ Hook migrated successfully');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
}