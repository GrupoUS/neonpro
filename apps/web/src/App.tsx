import React from 'react'
import { supabase } from './integrations/supabase/client'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              NeonPro Healthcare Platform
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Modern healthcare management system for Brazilian aesthetic clinics
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">
                ✅ Build system configuration completed successfully
              </p>
              <p className="text-green-700 text-sm mt-2">
                Next steps: Implement authentication, patient management, and appointment scheduling
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App