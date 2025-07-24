// Test validateAppointmentSlot function directly

// Copy the function here for testing
const validateAppointmentSlot = (datetime, durationMinutes) => {
  try {
    // Check if datetime is in the future
    const appointmentDate = new Date(datetime);
    const now = new Date();
    
    console.log('Appointment date:', appointmentDate);
    console.log('Current date:', now);
    console.log('Is appointment after now?', appointmentDate > now);
    
    if (appointmentDate <= now) {
      console.log('FAILED: Appointment is not in the future');
      return false;
    }
    
    // Check duration is valid (between 15 and 480 minutes, and multiple of 15)
    console.log('Duration:', durationMinutes);
    console.log('Duration >= 15?', durationMinutes >= 15);
    console.log('Duration <= 480?', durationMinutes <= 480);
    console.log('Duration % 15 === 0?', durationMinutes % 15 === 0);
    
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
};

// Test the function directly
const futureDate = new Date('2025-12-31T14:00:00.000Z').toISOString();
const pastDate = new Date('2024-01-01T14:00:00.000Z').toISOString();

console.log('=== Testing futureDate with 60 minutes ===');
console.log('Result:', validateAppointmentSlot(futureDate, 60));

console.log('\n=== Testing pastDate with 60 minutes ===');
console.log('Result:', validateAppointmentSlot(pastDate, 60));