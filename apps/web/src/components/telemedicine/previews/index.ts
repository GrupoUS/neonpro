/**
 * Telemedicine Component Previews
 * 
 * This module exports preview components for all telemedicine components.
 * These previews are useful for development, testing, and demonstration purposes.
 * 
 * Usage:
 * 1. Import the preview component you want to test
 * 2. Add it to a route in your development environment
 * 3. Use it to test different scenarios and states
 * 
 * Example:
 * ```tsx
 * import { WaitingRoomPreview } from '@/components/telemedicine/previews';
 * 
 * // In your development route:
 * <WaitingRoomPreview />
 * ```
 */

export { WaitingRoomPreview } from './WaitingRoomPreview';
export { SchedulingUIPreview } from './SchedulingUIPreview';

// Re-export the main components for convenience
export { WaitingRoom } from '../WaitingRoom';
export { SchedulingUI } from '../SchedulingUI';

// Export component types for developers
export type {
  TelemedicineAppointment,
  Patient,
  Professional,
} from '../SchedulingUI';