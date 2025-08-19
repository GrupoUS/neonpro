const fs = require('node:fs');

// Test copying api-gateway.ts
const sourcePath = 'E:\\neonpro\\src\\services\\api-gateway.ts';
const targetPath = 'E:\\neonpro\\apps\\web\\lib\\services\\api-gateway.ts';

try {
  const content = fs.readFileSync(sourcePath, 'utf8');
  fs.writeFileSync(targetPath, content, 'utf8');
} catch (_error) {}
