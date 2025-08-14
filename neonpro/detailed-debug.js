const { validateAppointmentSlot } = require('./components/financial/utils.ts');

// Test the function step by step
const futureDate = new Date('2026-12-31T14:00:00.000Z').toISOString();
const duration = 60;

console.log('=== Detailed Debug Analysis ===');
console.log('futureDate:', futureDate);
console.log('duration:', duration);
console.log('typeof futureDate:', typeof futureDate);
console.log('typeof duration:', typeof duration);
console.log('');

// Let's manually step through the logic
console.log('=== Step by Step Analysis ===');
const parsedDate = new Date(futureDate);
console.log('parsedDate:', parsedDate);
console.log('parsedDate.toString():', parsedDate.toString());
console.log('');

const currentDate = new Date();
console.log('currentDate:', currentDate);
console.log('currentDate.toString():', currentDate.toString());
console.log('');

const isInFuture = parsedDate > currentDate;
console.log('isInFuture (parsedDate > currentDate):', isInFuture);
console.log('');

const isDurationValid = duration > 0 && duration <= 480;
console.log('isDurationValid (duration > 0 && duration <= 480):', isDurationValid);
console.log('duration > 0:', duration > 0);
console.log('duration <= 480:', duration <= 480);
console.log('');

const isDivisibleBy15 = duration % 15 === 0;
console.log('isDivisibleBy15 (duration % 15 === 0):', isDivisibleBy15);
console.log('duration % 15:', duration % 15);
console.log('');

console.log('=== Final Checks ===');
console.log('All conditions combined:');
console.log(`  isInFuture: ${isInFuture}`);
console.log(`  isDurationValid: ${isDurationValid}`);
console.log(`  isDivisibleBy15: ${isDivisibleBy15}`);
console.log(`  Result should be: ${isInFuture && isDurationValid && isDivisibleBy15}`);
console.log('');

console.log('=== Function Result ===');
const result = validateAppointmentSlot(futureDate, duration);
console.log('validateAppointmentSlot result:', result);

// Test some edge cases
console.log('\n=== Edge Cases ===');
console.log('45 minutes:', validateAppointmentSlot(futureDate, 45));
console.log('30 minutes:', validateAppointmentSlot(futureDate, 30));
console.log('15 minutes:', validateAppointmentSlot(futureDate, 15));
console.log('37 minutes (not divisible by 15):', validateAppointmentSlot(futureDate, 37));

// Test with a past date
const pastDate = new Date('2020-01-01T14:00:00.000Z').toISOString();
console.log('Past date test:', validateAppointmentSlot(pastDate, 60));