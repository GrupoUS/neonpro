const fs = require('fs');

try {
  const content = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
  console.log(content);
} catch (error) {
  console.error('Error:', error.message);
}