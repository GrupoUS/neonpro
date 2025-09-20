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

export { SchedulingUIPreview } from './SchedulingUIPreview';
export { WaitingRoomPreview } from './WaitingRoomPreview';

// Re-export the main components for convenience
export { SchedulingUI } from '../SchedulingUI';
export { WaitingRoom } from '../WaitingRoom';

// Export component types for developers
export type { Patient, Professional, TelemedicineAppointment } from '../SchedulingUI';
