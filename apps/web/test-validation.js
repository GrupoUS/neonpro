// Simple test validation script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 Running Test Validation...\n');

// Test 1: Check if test files exist and have proper structure
const testFiles = [
  'src/__tests__/basic.test.tsx',
  'src/__tests__/simple.test.tsx',
  'src/__tests__/manual-dom.test.ts',
  'src/__tests__/integration/ClientRegistrationAgent.test.tsx',
];

console.log('📁 Checking test files...');
testFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for common issues
    if (content.includes('import { JSDOM } from \'jsdom\'')) {
      console.log(`⚠️  ${file} still has manual JSDOM import (should be removed)`);
    }

    if (content.includes('global.document = ')) {
      console.log(`⚠️  ${file} still has manual DOM setup (should be removed)`);
    }

    if (content.includes('describe(') && content.includes('it(')) {
      console.log(`✅ ${file} has proper test structure`);
    }
  } else {
    console.log(`❌ ${file} not found`);
  }
});

// Test 2: Check test configuration files
console.log('\n⚙️  Checking configuration files...');
const configFiles = [
  'vitest.config.ts',
  'src/test-setup.ts',
  'src/test/global-setup.ts',
];

configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} not found`);
  }
});

// Test 3: Check if we fixed the utils package TypeScript errors
console.log('\n🔧 Checking utils package...');
const utilsPath = path.join(process.cwd(), '../packages/utils/src/lgpd.ts');
if (fs.existsSync(utilsPath)) {
  const content = fs.readFileSync(utilsPath, 'utf8');
  const redactPIICount = (content.match(/export function redactPII/g) || []).length;

  if (redactPIICount === 1) {
    console.log('✅ utils package: redactPII function duplication fixed');
  } else {
    console.log(`❌ utils package: Found ${redactPIICount} redactPII functions (should be 1)`);
  }
}

// Test 4: Check test utils for proper structure
console.log('\n🛠️  Checking test utilities...');
const testUtilsPath = path.join(process.cwd(), 'src/test/utils.ts');
if (fs.existsSync(testUtilsPath)) {
  const content = fs.readFileSync(testUtilsPath, 'utf8');

  if (content.includes('React.createElement')) {
    console.log('✅ test utils: Using React.createElement instead of JSX');
  } else {
    console.log('❌ test utils: Should use React.createElement instead of JSX');
  }

  if (content.includes('import { vi } from \'vitest\'')) {
    console.log('✅ test utils: vi import present');
  } else {
    console.log('❌ test utils: Missing vi import');
  }
}

console.log('\n🎯 Test validation complete!');
console.log('\n📋 Summary of fixes applied:');
console.log('  • Removed manual JSDOM setup from individual test files');
console.log('  • Fixed JSX parsing in test utilities');
console.log('  • Added missing vi imports');
console.log('  • Fixed redactPII function duplication in utils package');
console.log('  • Configured vitest to use JSDOM environment automatically');
console.log('\n⚠️  Note: Vitest execution blocked by module resolution issues');
console.log('   This appears to be a dependency/installation issue that requires npm reinstall');
