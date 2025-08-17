const fs = require('fs');

// Test copying api-gateway.ts
const sourcePath = 'E:\\neonpro\\src\\services\\api-gateway.ts';
const targetPath = 'E:\\neonpro\\apps\\web\\lib\\services\\api-gateway.ts';

try {
  console.log('Reading api-gateway.ts...');
  const content = fs.readFileSync(sourcePath, 'utf8');

  console.log('Content preview:');
  console.log(content.substring(0, 200) + '...');

  console.log('Copying to target...');
  fs.writeFileSync(targetPath, content, 'utf8');

  console.log('✅ api-gateway.ts migrated successfully!');
  console.log('Target file size:', fs.statSync(targetPath).size, 'bytes');
} catch (error) {
  console.error('❌ Error:', error.message);
}
