// Debug: Test the validateAppointmentSlot function
const fs = require('fs');
const path = require('path');

// Function to read the actual function from the index.ts file
const indexPath = path.join(__dirname, 'components', 'financial', 'index.ts');
console.log('Reading file from:', indexPath);

const content = fs.readFileSync(indexPath, 'utf8');

// Find the validateAppointmentSlot function
const functionMatch = content.match(/export const validateAppointmentSlot.*?(?=export|$)/s);
if (functionMatch) {
  console.log('Function found:');
  console.log(functionMatch[0]);
} else {
  console.log('Function not found in file');
}

// Simulate the validation logic manually
function simulateValidation(dateTime, duration) {
  // Check if date is a valid ISO string
  console.log('\n--- Validation Debug ---');
  console.log('DateTime:', dateTime);
  console.log('Duration:', duration);
  
  const now = new Date();
  console.log('Current time:', now.toISOString());
  
  const appointmentDate = new Date(dateTime);
  console.log('Appointment date parsed:', appointmentDate);
  console.log('Is valid date:', !isNaN(appointmentDate.getTime()));
  
  const isInFuture = appointmentDate > now;
  console.log('Is in future:', isInFuture);
  
  const isDurationValid = duration > 0 && duration <= 480;
  console.log('Duration valid (0 < duration <= 480):', isDurationValid);
  
  const result = !isNaN(appointmentDate.getTime()) && isInFuture && isDurationValid;
  console.log('Final result:', result);
  
  return result;
}

// Test with the same dates from our test
const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
const pastDate = new Date('2024-01-01T14:00:00.000Z').toISOString();

console.log('\n=== Test Cases ===');
console.log('1. Future date with valid duration (should be true):');
simulateValidation(futureDate, 60);

console.log('\n2. Past date with valid duration (should be false):');
simulateValidation(pastDate, 60);

console.log('\n3. Future date with invalid duration (should be false):');
simulateValidation(futureDate, 0);

console.log('\n4. Future date with too long duration (should be false):');
simulateValidation(futureDate, 500);