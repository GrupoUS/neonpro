const fs = require('fs');
const path = require('path');

console.log('🚀 MIGRATING useComplianceAutomation.ts');
console.log('='.repeat(50));

// Source and target paths
const sourcePath = 'E:\\neonpro\\src\\hooks\\useComplianceAutomation.ts';
const targetPath = 'E:\\neonpro\\apps\\web\\hooks\\useComplianceAutomation.ts';

try {
  // Read source file
  console.log('📖 Reading source file...');
  const content = fs.readFileSync(sourcePath, 'utf8');
  console.log('✅ Source file read successfully');
  console.log('Content preview:');
  console.log(content.substring(0, 200) + '...');
  
  // Check if target already exists
  if (fs.existsSync(targetPath)) {
    console.log('⚠️  Target file already exists, will backup first');
    const backupPath = targetPath + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    fs.renameSync(targetPath, backupPath);
    console.log('✅ Existing file backed up');
  }
  
  // Write to target
  console.log('📝 Writing to target location...');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('✅ File successfully migrated to:', targetPath);
  
  // Verify migration
  const verifyContent = fs.readFileSync(targetPath, 'utf8');
  if (verifyContent === content) {
    console.log('✅ Migration verified - content matches');
  } else {
    console.log('❌ Migration failed - content mismatch');
  }
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
}