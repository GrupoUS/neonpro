const fs = require('fs');
const path = require('path');

const complianceDir = path.join(__dirname, 'packages/compliance/src');

console.log('=== EXAMINING ANVISA STRUCTURE ===');

// Check ANVISA directory
const anvisaDir = path.join(complianceDir, 'anvisa');
try {
  const files = fs.readdirSync(anvisaDir);
  console.log('ANVISA files:', files);
  
  // Read index.ts
  const indexPath = path.join(anvisaDir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log('\n=== ANVISA INDEX.TS ===');
    console.log(indexContent);
  }
} catch (error) {
  console.error('Error reading ANVISA directory:', error.message);
}

// Check CFM directory
const cfmDir = path.join(complianceDir, 'cfm');
try {
  const cfmExists = fs.existsSync(cfmDir);
  console.log('\n=== CFM DIRECTORY ===');
  console.log('CFM exists:', cfmExists);
  if (cfmExists) {
    const cfmFiles = fs.readdirSync(cfmDir);
    console.log('CFM files:', cfmFiles);
  }
} catch (error) {
  console.error('Error checking CFM directory:', error.message);
}

// Check Enterprise directory
const enterpriseDir = path.join(complianceDir, 'enterprise');
try {
  const enterpriseExists = fs.existsSync(enterpriseDir);
  console.log('\n=== ENTERPRISE DIRECTORY ===');
  console.log('Enterprise exists:', enterpriseExists);
  if (enterpriseExists) {
    const enterpriseFiles = fs.readdirSync(enterpriseDir);
    console.log('Enterprise files:', enterpriseFiles);
  }
} catch (error) {
  console.error('Error checking Enterprise directory:', error.message);
}