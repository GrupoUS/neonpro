// Postinstall script to ensure process polyfill is correctly configured
const fs = require('fs');
const path = require('path');

console.log('Running postinstall configuration...');

// Check if process module exists
try {
  require.resolve('process/browser');
  console.log('✅ process/browser module found');
} catch (e) {
  console.error('❌ process/browser module not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install process --save', { stdio: 'inherit' });
}

// Check if buffer module exists
try {
  require.resolve('buffer');
  console.log('✅ buffer module found');
} catch (e) {
  console.error('❌ buffer module not found. Installing...');
  const { execSync } = require('child_process');
  execSync('npm install buffer --save', { stdio: 'inherit' });
}

console.log('✅ Postinstall configuration complete');