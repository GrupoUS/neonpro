/**
 * Ultra simple test to isolate the validateAppointmentSlot issue
 */

import { validateAppointmentSlot } from './utils';

describe('Ultra Simple Debug', () => {
  it('should validate the simplest possible case', () => {
    const result = validateAppointmentSlot('2026-12-31T14:00:00.000Z', 60);
    
    // Force display in test name
    console.error('FORCED ERROR FOR DISPLAY - Result:', result);
    
    // Check step by step
    const date = new Date('2026-12-31T14:00:00.000Z');
    const now = new Date();
    const isInFuture = date > now;
    console.error('FORCED ERROR - Date check:', isInFuture);
    
    const duration = 60;
    const isDurationValid = duration > 0 && duration <= 480;
    console.error('FORCED ERROR - Duration valid:', isDurationValid);
    
    const isDivisibleBy15 = duration % 15 === 0;
    console.error('FORCED ERROR - Divisible by 15:', isDivisibleBy15);
    
    expect(result).toBe(true);
  });
});
