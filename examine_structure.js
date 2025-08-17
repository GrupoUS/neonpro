const fs = require('fs');
const path = require('path');

console.log('=== PHASE 5 COMPLETION - STRUCTURE EXAMINATION ===\n');

// Read existing ANVISA services to understand patterns
const anvisaDir = './packages/compliance/src/anvisa';
try {
  const files = fs.readdirSync(anvisaDir);
  console.log('ANVISA existing files:', files);
  
  // Read one service to understand pattern
  if (files.includes('adverse-event-service.ts')) {
    const service = fs.readFileSync(path.join(anvisaDir, 'adverse-event-service.ts'), 'utf8');
    console.log('\nADVERSE EVENT SERVICE structure (first 800 chars):');
    console.log(service.substring(0, 800));
  }
  
  // Check index exports
  if (files.includes('index.ts')) {
    const index = fs.readFileSync(path.join(anvisaDir, 'index.ts'), 'utf8');
    console.log('\nANVISA INDEX exports:');
    console.log(index);
  }
} catch (e) {
  console.error('ANVISA error:', e.message);
}

// Check if CFM directory exists
const cfmDir = './packages/compliance/src/cfm';
const cfmExists = fs.existsSync(cfmDir);
console.log('\nCFM directory exists:', cfmExists);

// Check if Enterprise directory exists  
const enterpriseDir = './packages/compliance/src/enterprise';
const enterpriseExists = fs.existsSync(enterpriseDir);
console.log('Enterprise directory exists:', enterpriseExists);