const fs = require('fs');

// Read ANVISA index
try {
  const anvisaIndex = fs.readFileSync('./packages/compliance/src/anvisa/index.ts', 'utf8');
  console.log('=== ANVISA INDEX ===');
  console.log(anvisaIndex);
} catch (e) {
  console.log('ANVISA index error:', e.message);
}

// Read main compliance index
try {
  const mainIndex = fs.readFileSync('./packages/compliance/src/index.ts', 'utf8');
  console.log('\n=== MAIN COMPLIANCE INDEX ===');
  console.log(mainIndex);
} catch (e) {
  console.log('Main index error:', e.message);
}