const fs = require('fs');

try {
  // Check if file exists
  const exists = fs.existsSync('./packages/compliance/src/anvisa/adverse-event-service.ts');
  console.log('File exists:', exists);
  
  if (exists) {
    const content = fs.readFileSync('./packages/compliance/src/anvisa/adverse-event-service.ts', 'utf8');
    console.log('=== FIRST 1000 CHARS ===');
    console.log(content.substring(0, 1000));
  }
} catch (e) {
  console.error('Error:', e.message);
}