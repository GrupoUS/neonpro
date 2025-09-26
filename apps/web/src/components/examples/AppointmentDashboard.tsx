/**
 * Real-time Appointment Dashboard Example
 * Demonstrates integration of Supabase Realtime + TanStack Query + tRPC
 */

import { useState } from 'react'
import { 
  useRealtimeAppointments, 
  useCreateAppointment, 
  useUpdateAppointment,
  useRealtimeProvider 
} from '../../hooks/realtime'

interface AppointmentDashboardProps {
  clinicId?: string
}

export function AppointmentDashboard({ clinicId }: AppointmentDashboardProps) {
  const [filter, setFilter] = useState<string>('scheduled')
  
  // Real-time connection status
  const { isConnected, connectionStatus } = useRealtimeProvider()
  
  // Real-time appointments query with automatic updates
  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useRealtimeAppointments({
    status: filter,
    limit: 50
  })
  
  // Real-time mutations with automatic query invalidation
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    await updateAppointment.mutateAsync({
      id: appointmentId,
      data: { status: newStatus }
    })
  }

  const handleCreateAppointment = async () => {
    await createAppointment.mutateAsync({
      clientId: 'example-client-id',
      procedureId: 'example-procedure-id',
      scheduledAt: new Date().toISOString(),
      notes: 'Created via real-time dashboard'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading appointments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading appointments: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2>Real-time Appointment Dashboard</h2>
      <p>Connection Status: {connectionStatus} ({isConnected ? 'Connected' : 'Disconnected'})</p>
      
      <div>
        <h3>Filter by Status:</h3>
        {['scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{ 
              margin: '0 4px', 
              padding: '4px 8px',
              backgroundColor: filter === status ? '#007bff' : '#f8f9fa',
              color: filter === status ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <button 
        onClick={handleCreateAppointment} 
        disabled={createAppointment.isPending}
        style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {createAppointment.isPending ? 'Creating...' : 'Create Test Appointment'}
      </button>

      <div>
        <h3>Appointments ({appointments?.length || 0})</h3>
        {appointments?.map((appointment: any) => (
          <div key={appointment.id} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '12px', 
            margin: '8px 0',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>{appointment.client?.name || 'Unknown Client'}</h4>
            <p>Status: <strong>{appointment.status}</strong></p>
            <p>Date: {new Date(appointment.scheduledAt).toLocaleString()}</p>
            {appointment.notes && <p>Notes: {appointment.notes}</p>}
            
            <div style={{ marginTop: '8px' }}>
              {appointment.status === 'scheduled' && (
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                  disabled={updateAppointment.isPending}
                  style={{ 
                    marginRight: '8px', 
                    padding: '4px 8px', 
                    backgroundColor: '#17a2b8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px' 
                  }}
                >
                  Confirm
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                  disabled={updateAppointment.isPending}
                  style={{ 
                    marginRight: '8px', 
                    padding: '4px 8px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px' 
                  }}
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                disabled={updateAppointment.isPending}
                style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {isConnected && (
        <div style={{ 
          position: 'fixed', 
          bottom: '16px', 
          right: '16px',
          width: '12px',
          height: '12px',
          backgroundColor: '#28a745',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}></div>
      )}
    </div>
  )
}