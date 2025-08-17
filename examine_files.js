const fs = require('fs');

// Read story file
console.log('=== STORY CONTENT ===');
try {
  const story = fs.readFileSync('E:\\neonpro\\docs\\shards\\stories\\2.5.source-code-consolidation.md', 'utf8');
  console.log(story);
  console.log('\n' + '='.repeat(80) + '\n');
} catch (error) {
  console.error('Error reading story:', error.message);
}

// Examine key files from root src/
console.log('=== ROOT SRC FILES ===');

// Check hooks
try {
  const hookFile = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
  console.log('useComplianceAutomation.ts:');
  console.log(hookFile.substring(0, 500) + '...\n');
} catch (error) {
  console.error('Error reading hook file:', error.message);
}

// Check services
const servicesDir = 'E:\\neonpro\\src\\services';
try {
  const services = fs.readdirSync(servicesDir);
  console.log('Services files:', services);
  
  // Read first service file as example
  if (services.length > 0) {
    const firstService = fs.readFileSync(`${servicesDir}\\${services[0]}`, 'utf8');
    console.log(`\nExample service (${services[0]}):`);
    console.log(firstService.substring(0, 500) + '...\n');
  }
} catch (error) {
  console.error('Error reading services:', error.message);
}

// Check apps/web structure
console.log('=== APPS/WEB EXISTING STRUCTURE ===');
try {
  const webDirs = fs.readdirSync('E:\\neonpro\\apps\\web', { withFileTypes: true });
  webDirs.forEach(item => {
    if (item.isDirectory()) {
      console.log(`[DIR] ${item.name}/`);
    }
  });
} catch (error) {
  console.error('Error reading apps/web:', error.message);
}