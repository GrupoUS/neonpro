/**
 * Waitlist Manager - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export class WaitlistManager {
  async addToWaitlist(
    _appointmentSlot: {
      date: Date;
      time: string;
      serviceId: string;
      professionalId: string;
    },
    _patientId: string
  ): Promise<{
    success: boolean;
    waitlistPosition?: number;
    estimatedWaitTime?: string;
  }> {
    // Mock implementation
    return {
      success: true,
      waitlistPosition: 3,
      estimatedWaitTime: '2-3 days',
    };
  }

  async notifyWaitlistAvailability(_slotId: string): Promise<void> {
    // Mock implementation
  }
}
