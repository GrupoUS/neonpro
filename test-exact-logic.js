// Test exact implementation of validateAppointmentSlot
function validateAppointmentSlot(datetime, durationMinutes) {
  try {
    console.log('Input datetime:', datetime);
    console.log('Input duration:', durationMinutes);
    
    // Check if datetime is in the future
    const appointmentDate = new Date(datetime);
    const now = new Date();
    console.log('Appointment date:', appointmentDate);
    console.log('Current date:', now);
    console.log('Is future?', appointmentDate > now);
    
    if (appointmentDate <= now) {
      console.log('FAILED: Not in future');
      return false;
    }
    
    // Check duration is valid (between 15 and 480 minutes, and multiple of 15)
    console.log('Duration >= 15?', durationMinutes >= 15);
    console.log('Duration <= 480?', durationMinutes <= 480);
    console.log('Duration % 15 === 0?', durationMinutes % 15 === 0);
    
    if (durationMinutes < 15 || durationMinutes > 480) {
      console.log('FAILED: Duration not in range');
      return false;
    }
    if (durationMinutes % 15 !== 0) {
      console.log('FAILED: Duration not multiple of 15');
      return false;
    }
    
    console.log('SUCCESS: All validations passed');
    return true;
  } catch (error) {
    console.log('ERROR:', error.message);
    return false;
  }
}

// Test cases from our Jest test
console.log('=== Test Case 1: Future date, duration 60 ===');
const result1 = validateAppointmentSlot('2025-12-31T14:00:00.000Z', 60);
console.log('Result:', result1);
console.log('Expected: true');
console.log('');

console.log('=== Test Case 2: Past date, duration 60 ===');
const result2 = validateAppointmentSlot('2024-01-01T14:00:00.000Z', 60);
console.log('Result:', result2);
console.log('Expected: false');
console.log('');

console.log('=== Test Case 3: Future date, duration 0 ===');
const result3 = validateAppointmentSlot('2025-12-31T14:00:00.000Z', 0);
console.log('Result:', result3);
console.log('Expected: false');
console.log('');

console.log('=== Test Case 4: Future date, duration 500 ===');
const result4 = validateAppointmentSlot('2025-12-31T14:00:00.000Z', 500);
console.log('Result:', result4);
console.log('Expected: false');
console.log('');

console.log('=== Test Case 5: Future date, duration 45 ===');
const result5 = validateAppointmentSlot('2025-12-31T14:00:00.000Z', 45);
console.log('Result:', result5);
console.log('Expected: true');
console.log('');

console.log('=== Test Case 6: Future date, duration 37 ===');
const result6 = validateAppointmentSlot('2025-12-31T14:00:00.000Z', 37);
console.log('Result:', result6);
console.log('Expected: false');