const { execSync } = require('child_process');

console.log('🔍 Running Biome check on security package...\n');

try {
  // Check current state
  const checkResult = execSync('npx @biomejs/biome check packages/security/src --verbose', { 
    encoding: 'utf8',
    cwd: __dirname 
  });
  console.log('Current Biome check result:');
  console.log(checkResult);
} catch (error) {
  console.log('Current errors found:');
  console.log(error.stdout);
}

console.log('\n🛠️  Applying Biome auto-fixes...\n');

try {
  // Apply fixes
  const fixResult = execSync('npx @biomejs/biome check packages/security/src --apply', { 
    encoding: 'utf8',
    cwd: __dirname 
  });
  console.log('Biome fix result:');
  console.log(fixResult);
} catch (error) {
  console.log('Fix results:');
  console.log(error.stdout);
}

console.log('\n✅ Final check after fixes...\n');

try {
  // Final check
  const finalResult = execSync('npx @biomejs/biome check packages/security/src --verbose', { 
    encoding: 'utf8',
    cwd: __dirname 
  });
  console.log('Final check result:');
  console.log(finalResult);
} catch (error) {
  console.log('Remaining issues:');
  console.log(error.stdout);
}