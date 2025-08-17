const fs = require('fs');

try {
  // Read an existing ANVISA service to understand the pattern
  const adverseEvent = fs.readFileSync('./packages/compliance/src/anvisa/adverse-event-service.ts', 'utf8');
  console.log('=== ADVERSE EVENT SERVICE (First 500 chars) ===');
  console.log(adverseEvent.substring(0, 500));
  
  console.log('\n=== ADVERSE EVENT SERVICE (Next 500 chars) ===');
  console.log(adverseEvent.substring(500, 1000));
} catch (e) {
  console.log('Error reading adverse event service:', e.message);
}