// Debug the specific test case dates
console.log('=== Date Testing Debug ===');

// Simulate the validateAppointmentSlot function 
function validateAppointmentSlot(datetime, durationMinutes) {
  try {
    console.log('Input datetime:', datetime);
    console.log('Input duration:', durationMinutes);
    
    // Check if datetime is in the future
    const appointmentDate = new Date(datetime);
    const now = new Date();
    
    console.log('Appointment date object:', appointmentDate);
    console.log('Current date object:', now);
    console.log('Appointment date > now?', appointmentDate > now);
    
    if (appointmentDate <= now) {
      console.log('FAILED: Appointment is not in the future');
      return false;
    }
    
    // Check duration is valid (between 15 and 480 minutes, and multiple of 15)
    if (durationMinutes < 15 || durationMinutes > 480) {
      console.log('FAILED: Duration out of range');
      return false;
    }
    
    if (durationMinutes % 15 !== 0) {
      console.log('FAILED: Duration not multiple of 15');
      return false;
    }
    
    console.log('SUCCESS: All validations passed');
    return true;
  } catch (error) {
    console.log('ERROR:', error);
    return false;
  }
}

// Test with exact same date creation as the test
const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
console.log('\n=== Testing Future Date ===');
const result = validateAppointmentSlot(futureDate, 60);
console.log('Final result:', result);

// Test with past date
const pastDate = new Date('2024-01-01T14:00:00.000Z').toISOString();
console.log('\n=== Testing Past Date ===');
const result2 = validateAppointmentSlot(pastDate, 60);
console.log('Final result:', result2);