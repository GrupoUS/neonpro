/**
 * Inline function test - define the function right in the test
 */

describe('Inline Function Test', () => {
  const validateAppointmentSlotInline = (datetime: string, durationMinutes: number): boolean => {
    try {
      // Check if datetime is in the future
      const appointmentDate = new Date(datetime);
      const now = new Date();
      
      if (appointmentDate <= now) {
        return false;
      }
      
      // Check duration is valid (between 15 and 480 minutes, and multiple of 15)
      if (durationMinutes < 15 || durationMinutes > 480) {
        return false;
      }
      
      if (durationMinutes % 15 !== 0) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  it('should validate with inline function', () => {
    const futureDate = new Date('2026-12-31T14:00:00.000Z').toISOString();
    const result = validateAppointmentSlotInline(futureDate, 60);
    
    expect(result).toBe(true);
    expect(validateAppointmentSlotInline(futureDate, 45)).toBe(true);
    expect(validateAppointmentSlotInline(futureDate, 37)).toBe(false); // Not divisible by 15
  });
});