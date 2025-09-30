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
