const fs = require('fs');
const path = require('path');

console.log('🚀 NEONPRO SOURCE CONSOLIDATION - EXAMINATION & MIGRATION');

// 1. Read useComplianceAutomation.ts
console.log('\n📄 EXAMINING: src/hooks/useComplianceAutomation.ts');
const hookPath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';
if (fs.existsSync(hookPath)) {
  const hookContent = fs.readFileSync(hookPath, 'utf8');
  console.log('Content:');
  console.log(hookContent);
  
  // Check target directory
  const targetHooksDir = 'E:\\neonpro\\apps\\web\\hooks';
  console.log('\n🎯 Target directory exists:', fs.existsSync(targetHooksDir));
  if (fs.existsSync(targetHooksDir)) {
    const existing = fs.readdirSync(targetHooksDir);
    console.log('Existing files:', existing);
  }
} else {
  console.log('❌ Hook file not found');
}

// 2. Examine service files
console.log('\n📁 EXAMINING: src/services/');
const servicesPath = 'E:\\neonpro\\src\\services';
if (fs.existsSync(servicesPath)) {
  const serviceFiles = fs.readdirSync(servicesPath);
  console.log('Service files to migrate:', serviceFiles);
  
  // Check first service file as example
  if (serviceFiles.length > 0) {
    const firstService = path.join(servicesPath, serviceFiles[0]);
    const serviceContent = fs.readFileSync(firstService, 'utf8');
    console.log(`\nExample service (${serviceFiles[0]}):`);
    console.log(serviceContent.substring(0, 500) + '...');
  }
}