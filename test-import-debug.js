// Test if the function is properly exported and imported
const { validateAppointmentSlot } = require('./components/financial/index.ts');

console.log('Function type:', typeof validateAppointmentSlot);
console.log('Function value:', validateAppointmentSlot);

if (typeof validateAppointmentSlot === 'function') {
  console.log('Function is available, testing...');
  
  // Test with future date
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  console.log('Future date:', futureDate);
  
  const result = validateAppointmentSlot(futureDate, 60);
  console.log('Result for future date:', result);
} else {
  console.log('Function not found in exports');
}