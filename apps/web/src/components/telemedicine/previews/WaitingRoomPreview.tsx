import React from 'react';
import { WaitingRoom } from '../WaitingRoom';

/**
 * WaitingRoom Component Preview
 *
 * This preview component demonstrates the WaitingRoom functionality
 * with different mock data scenarios for development and testing.
 */

// Mock data scenarios
const mockScenarios = {
  standard: {
    description: 'Standard waiting room with multiple patients',
    // Uses default mock data from component
  },
  urgent: {
    description: 'Emergency scenario with urgent patients',
    // You can add props here to override mock data if needed
  },
  lowActivity: {
    description: 'Quiet period with few patients',
    // You can add props here to override mock data if needed
  },
};

export function WaitingRoomPreview() {
  const [currentScenario, setCurrentScenario] = React.useState<keyof typeof mockScenarios>(
    'standard',
  );

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      {/* Preview Controls */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h1 className='text-2xl font-bold mb-4'>
            WaitingRoom Component Preview
          </h1>
          <p className='text-gray-600 mb-6'>
            Interactive preview of the telemedicine waiting room interface. Switch between different
            scenarios to test various states.
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
        </div>
      </div>

      {/* Component Preview */}
      <div className='max-w-7xl mx-auto'>
        <WaitingRoom />
      </div>
    </div>
  );
}
