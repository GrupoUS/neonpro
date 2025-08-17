const fs = require('fs');

console.log('🔍 EXAMINING ROOT SRC FILES FOR CONSOLIDATION');

// Read the compliance hook
console.log('\n📄 useComplianceAutomation.ts:');
try {
  const hookContent = fs.readFileSync('E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts', 'utf8');
  console.log(hookContent);
} catch (error) {
  console.error('Error reading hook:', error.message);
}

// Examine service files
console.log('\n📁 SERVICE FILES:');
const servicesDir = 'E:\\neonpro\\src\\services';
try {
  const serviceFiles = fs.readdirSync(servicesDir);
  serviceFiles.forEach(file => {
    console.log(`\n--- ${file} ---`);
    const content = fs.readFileSync(`${servicesDir}\\${file}`, 'utf8');
    // Show first 20 lines and imports
    const lines = content.split('\n');
    console.log(lines.slice(0, 20).join('\n'));
    if (lines.length > 20) {
      console.log('\n... (truncated)');
    }
  });
} catch (error) {
  console.error('Error reading services:', error.message);
}