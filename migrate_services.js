const fs = require('fs');

// Service files to migrate
const serviceFiles = [
  'api-gateway.ts',
  'auth.ts', 
  'compliance.ts',
  'configuration.ts',
  'financial.ts',
  'monitoring.ts',
  'notification.ts',
  'patient.ts'
];

console.log('🚀 MIGRATING SERVICE FILES');
console.log('='.repeat(50));

serviceFiles.forEach((file, index) => {
  const sourcePath = `E:\\neonpro\\src\\services\\${file}`;
  const targetPath = `E:\\neonpro\\apps\\web\\lib\\services\\${file}`;
  
  try {
    console.log(`\n📄 ${index + 1}. Migrating ${file}...`);
    
    // Read source file
    const content = fs.readFileSync(sourcePath, 'utf8');
    console.log(`   ✅ Read source (${content.length} chars)`);
    
    // Write to target (backup existing if present)
    if (fs.existsSync(targetPath)) {
      const backupPath = targetPath + '.old-backup';
      fs.writeFileSync(backupPath, fs.readFileSync(targetPath, 'utf8'));
      console.log(`   📦 Backed up existing file`);
    }
    
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`   ✅ Written to target`);
    
    // Verify
    const verifyContent = fs.readFileSync(targetPath, 'utf8');
    if (verifyContent === content) {
      console.log(`   ✅ Migration verified for ${file}`);
    } else {
      console.log(`   ❌ Migration failed for ${file}`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error migrating ${file}:`, error.message);
  }
});

console.log('\n🎯 Service migration complete!');