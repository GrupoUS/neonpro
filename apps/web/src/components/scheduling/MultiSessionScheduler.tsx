/**
 * Session data interface for multi-session scheduling
 * 
 * Defines the structure for individual treatment session information
 * in Brazilian aesthetic clinic scheduling systems.
 * 
 * @interface SessionData
 * 
 * @property {string} id - Unique session identifier
 *   Used for tracking and managing individual treatment sessions
 *   Must be unique across all sessions in the system
 * @property {Date} date - Scheduled date and time for the session
 *   Must be in clinic operating hours and professional availability
 *   Timezone should be Brazilian local time (BRT/BRST)
 * @property {number} duration - Session duration in minutes
 *   Must align with treatment protocol requirements
 *   Typical aesthetic treatments: 30, 60, 90, or 120 minutes
 * @property {string} professionalId - Healthcare professional identifier
 *   Must be a licensed professional with appropriate certifications
 *   Should match professional availability and specialization
 * @property {string} patientId - Patient identifier for the session
 *   Must be a registered patient with completed medical history
 *   Should have required consents and pre-treatment assessments
 * @property {'scheduled' | 'completed' | 'cancelled'} status - Session status
 *   - 'scheduled': Confirmed upcoming session
 *   - 'completed': Successfully performed treatment
 *   - 'cancelled': Cancelled by patient or clinic
 *   Status changes trigger appropriate notifications and record updates
 * 
 * @example
 * const session: SessionData = {
 *   id: 'session-123',
 *   date: new Date('2024-01-15T14:00:00'),
 *   duration: 60,
 *   professionalId: 'prof-456',
 *   patientId: 'patient-789',
 *   status: 'scheduled'
 * };
 * 
 * @compliance
 * Session data must comply with Brazilian healthcare scheduling regulations
 * and maintain proper audit trails for CFM compliance.
 */
interface SessionData {
  id: string
  date: Date
  duration: number
  professionalId: string
  patientId: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

/**
 * Props interface for MultiSessionScheduler component
 * 
 * Defines the configuration and callback handlers for managing multiple
 * treatment sessions in Brazilian aesthetic clinic scheduling systems.
 * 
 * @interface MultiSessionSchedulerProps
 * 
 * @property {SessionData[]} sessions - Array of session data to be managed
 *   Chronologically ordered sessions for scheduling optimization
 *   Should include all sessions within the management timeframe
 * @property {Function} onSessionChange - Callback for session modifications
 *   @param {SessionData[]} sessions - Updated array of session data
 *   @returns {void}
 *   Called when sessions are created, modified, or cancelled
 *   Should trigger backend updates and notifications
 * 
 * @example
 * const props: MultiSessionSchedulerProps = {
 *   sessions: currentSessions,
 *   onSessionChange: (updatedSessions) => {
 *     schedulingService.updateSessions(updatedSessions);
 *     notificationService.notifyChanges(updatedSessions);
 *   }
 * };
 * 
 * @compliance
 * Session management must comply with Brazilian healthcare scheduling
 * regulations and maintain proper audit trails for CFM compliance.
 * All changes must be logged and communicated to relevant parties.
 * 
 * @accessibility
 * Session management interface must be accessible to healthcare
 * professionals with varying abilities and assistive technology needs.
 */
interface MultiSessionSchedulerProps {
  sessions: SessionData[]
  onSessionChange: (sessions: SessionData[]) => void
  // ... other props if needed
}

function MultiSessionScheduler({ sessions, onSessionChange, ...props }: MultiSessionSchedulerProps) {
  // ... existing code ...
  // Use sessions.map(s => s.date) etc.
}

export { MultiSessionScheduler }
