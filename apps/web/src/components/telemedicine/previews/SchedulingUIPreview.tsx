import React from 'react';
import { SchedulingUI } from '../SchedulingUI';

/**
 * SchedulingUI Component Preview
 *
 * This preview component demonstrates the SchedulingUI functionality
 * with different mock data scenarios for development and testing.
 */

// Mock data scenarios
const mockScenarios = {
  busy: {
    description: 'Busy clinic with many appointments',
    // Uses default mock data from component
  },
  empty: {
    description: 'New clinic with minimal appointments',
    appointmentsOverride: [],
  },
  filtered: {
    description: 'Filtered view showing specific appointment types',
    // Could add filter props here
  },
};

export function SchedulingUIPreview() {
  const [currentScenario, setCurrentScenario] = React.useState<keyof typeof mockScenarios>('busy');

  // Demo event handlers
  const handleAppointmentCreate = (appointment: any) => {
    console.log('Creating appointment:', appointment);
    alert(`New appointment created for ${appointment.patientName}`);
  };

  const handleAppointmentUpdate = (appointment: any) => {
    console.log('Updating appointment:', appointment);
    alert(`Appointment updated for ${appointment.patientName}`);
  };

  const handleAppointmentCancel = (appointmentId: string) => {
    console.log('Cancelling appointment:', appointmentId);
    alert(`Appointment ${appointmentId} cancelled`);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      {/* Preview Controls */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h1 className='text-2xl font-bold mb-4'>SchedulingUI Component Preview</h1>
          <p className='text-gray-600 mb-6'>
            Interactive preview of the telemedicine scheduling interface. Test appointment creation,
            editing, and management features.
          </p>

          <div className='flex gap-4'>
            {Object.entries(mockScenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setCurrentScenario(key as keyof typeof mockScenarios)}
                className={`px-4 py-2 rounded-md border transition-colors ${
                  currentScenario === key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className='mt-4 p-4 bg-gray-50 rounded-md'>
            <p className='text-sm text-gray-600'>
              <strong>Current scenario:</strong> {mockScenarios[currentScenario].description}
            </p>
          </div>

          <div className='mt-4 p-4 bg-blue-50 rounded-md'>
            <p className='text-sm text-blue-700'>
              <strong>Interaction Demo:</strong>{' '}
              Click buttons in the component below to see console logs and alerts demonstrating the
              callback functions.
            </p>
          </div>
        </div>
      </div>

      {/* Component Preview */}
      <div className='max-w-7xl mx-auto'>
        <SchedulingUI
          appointments={currentScenario === 'empty' ? [] : undefined}
          onAppointmentCreate={handleAppointmentCreate}
          onAppointmentUpdate={handleAppointmentUpdate}
          onAppointmentCancel={handleAppointmentCancel}
        />
      </div>
    </div>
  );
}
