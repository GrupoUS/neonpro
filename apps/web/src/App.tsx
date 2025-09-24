import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import * as React from 'react'
import { PWAInstallPrompt } from './components/stubs/PWAInstallPrompt'
import { PWAOfflineIndicator } from './components/stubs/PWAOfflineIndicator'
import { router } from './router'

// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const handleLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    window.addEventListener('load', handleLoad) // Store for cleanup
    ;(window as any).__appCleanup = {
      ...((window as any).__appCleanup || {}),
      loadHandler: handleLoad,
    }
  }
}

// PWA Install Handlers
export function setupPWAInstallHandlers() {
  let deferredPrompt: any

  const handleBeforeInstall = (e: any) => {
    e.preventDefault()
    deferredPrompt = e
    window.dispatchEvent(
      new CustomEvent('pwa-install-available', {
        detail: deferredPrompt,
      }),
    )
  }

  const handleAppInstalled = () => {
    console.log('PWA was installed')
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', handleAppInstalled) // Store for cleanup
  ;(window as any).__appCleanup = {
    ...((window as any).__appCleanup || {}),
    beforeInstallHandler: handleBeforeInstall,
    appInstalledHandler: handleAppInstalled,
  }
}

// Cleanup function for development
export function cleanupAppEventListeners() {
  const cleanup = (window as any).__appCleanup
  if (cleanup) {
    if (cleanup.loadHandler) {
      window.removeEventListener('load', cleanup.loadHandler)
    }
    if (cleanup.beforeInstallHandler) {
      window.removeEventListener('beforeinstallprompt', cleanup.beforeInstallHandler)
    }
    if (cleanup.appInstalledHandler) {
      window.removeEventListener('appinstalled', cleanup.appInstalledHandler)
    }
    if (cleanup.handleOnline) {
      window.removeEventListener('online', cleanup.handleOnline)
    }
    if (cleanup.handleOffline) {
      window.removeEventListener('offline', cleanup.handleOffline)
    }
  }
}

function App() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  React.useEffect(() => {
    // Register Service Worker
    registerServiceWorker()

    // Setup PWA Install Handlers
    setupPWAInstallHandlers()

    // Set up online/offline event listeners
    const handleOnline = () => {
      console.log('App is online')
      window.dispatchEvent(new CustomEvent('app-online'))
    }

    const handleOffline = () => {
      console.log('App is offline')
      window.dispatchEvent(new CustomEvent('app-offline'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline) // Store handlers for cleanup
    ;(window as any).__appCleanup = {
      ...((window as any).__appCleanup || {}),
      handleOnline,
      handleOffline,
    }

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      // Full cleanup for development
      if (process.env.NODE_ENV === 'development') {
        cleanupAppEventListeners()
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className='min-h-screen bg-gray-50'>
        {/* PWA Components */}
        <PWAInstallPrompt className='fixed bottom-4 right-4 z-50' />
        <PWAOfflineIndicator className='fixed top-4 right-4 z-50' />

        {/* Main Application Router */}
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  )
}

export default App
