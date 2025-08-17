const fs = require('fs');

// Examine existing ANVISA service for pattern
try {
  const adverseEvent = fs.readFileSync('./packages/compliance/src/anvisa/adverse-event-service.ts', 'utf8');
  console.log('=== ADVERSE EVENT SERVICE COMPLETE ===');
  console.log(adverseEvent);
  
  console.log('\n=== ANVISA INDEX ===');
  const anvisaIndex = fs.readFileSync('./packages/compliance/src/anvisa/index.ts', 'utf8');
  console.log(anvisaIndex);
} catch (e) {
  console.error('Error:', e.message);
}