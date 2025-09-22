const fs = require('fs');
const path = require('path');

// Fix remaining syntax errors
const testFiles = [
  'apps/api/src/__tests__/audit/typescript-compilation-errors.test.ts',
  'apps/api/src/__tests__/audit/security-validation-tests.test.ts'
];

for (const filePath of testFiles) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix all remaining _('text') patterns
    content = content.replace(/_\('([^']*)'\)/g, "'$1'");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

console.log('Syntax fixes completed!');