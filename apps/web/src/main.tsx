import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CopilotKitProvider } from './providers/CopilotKitProvider'
import { RealtimeQueryProvider } from './providers/RealtimeQueryProvider'
import { AuthProvider } from './contexts/AuthContext'
import { routeTree } from './routeTree.gen'
import './styles/globals.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <RealtimeQueryProvider>
      <CopilotKitProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </CopilotKitProvider>
    </RealtimeQueryProvider>
  </StrictMode>,
)
