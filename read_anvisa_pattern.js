const fs = require('fs');

// Read existing ANVISA service to understand pattern
const anvisaService = fs.readFileSync('./packages/compliance/src/anvisa/adverse-event-service.ts', 'utf8');
console.log('=== ANVISA SERVICE PATTERN ===');
console.log(anvisaService.substring(0, 1500)); // First part

console.log('\n=== ANVISA INDEX EXPORTS ===');
const anvisaIndex = fs.readFileSync('./packages/compliance/src/anvisa/index.ts', 'utf8');
console.log(anvisaIndex);