import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <div className='min-h-screen bg-gray-50'>
      <Outlet />
      <Toaster />
    </div>
  ),
})

function RootComponent() {
  console.log('🎯 [ROOT DEBUG] Root component rendering!')
  console.log('🎯 [ROOT DEBUG] About to render Outlet')

  return (
    <div className='min-h-screen bg-gray-50'>
      <div style={{ background: 'orange', padding: '10px', margin: '5px' }}>
        🔧 ROOT DEBUG: Root component loaded
      </div>
      <Outlet />
      <Toaster />
    </div>
  )
}
