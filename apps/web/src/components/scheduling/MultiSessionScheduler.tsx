interface SessionData {
  id: string
  date: Date
  duration: number
  professionalId: string
  patientId: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

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
