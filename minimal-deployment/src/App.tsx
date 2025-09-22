import * as React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            NeonPro Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600">
            Modern healthcare platform for Brazilian aesthetic clinics
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Deployment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your NeonPro application has been successfully deployed to Vercel.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Features</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Patient Management</li>
                  <li>• Appointment Scheduling</li>
                  <li>• Medical Records</li>
                  <li>• Billing System</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Technology</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App