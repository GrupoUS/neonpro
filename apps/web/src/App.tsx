import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import * as React from 'react'
import { AccessibilityProvider } from './components/providers/accessibility-provider.js'
import { PWAInstallPrompt } from './components/stubs/PWAInstallPrompt.js'
import { PWAOfflineIndicator } from './components/stubs/PWAOfflineIndicator.js'
import { router } from './router.js'
import './styles/healthcare-colors.css'
import './styles/healthcare-mobile.css'
import './styles/ui-theme.css'
import { ThemeProvider } from './theme-provider.tsx'
import { TRPCProvider } from './components/providers/TRPCProvider.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

// Add typed definitions for PWA event and app cleanup to avoid `any` usage
type AppEventHandler = (this: Window, ev: Event) => any

interface AppCleanup {
  loadHandler?: AppEventHandler
  beforeInstallHandler?: AppEventHandler
  appInstalledHandler?: AppEventHandler
  handleOnline?: AppEventHandler
  handleOffline?: AppEventHandler
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __appCleanup?: AppCleanup
  }
}

// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const handleLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.warn('SW registered: ', registration)
      } catch (registrationError) {
        console.warn('SW registration failed: ', registrationError)
      }
    }

    window.addEventListener('load', handleLoad) // Store for cleanup
    const prevCleanup = window.__appCleanup ?? {}
    window.__appCleanup = {
      ...prevCleanup,
      loadHandler: handleLoad,
    }
  }
}

// PWA Install Handlers
export function setupPWAInstallHandlers() {
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  const handleBeforeInstall: AppEventHandler = (e: Event) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    window.dispatchEvent(
      new CustomEvent('pwa-install-available', {
        detail: deferredPrompt,
      }),
    )
  }

  const handleAppInstalled: AppEventHandler = () => {
    console.warn('PWA was installed')
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  }

  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', handleAppInstalled) // Store for cleanup
  const prevCleanup = window.__appCleanup ?? {}
  window.__appCleanup = {
    ...prevCleanup,
    beforeInstallHandler: handleBeforeInstall,
    appInstalledHandler: handleAppInstalled,
  }
}

// Cleanup function for development
export function cleanupAppEventListeners() {
  const cleanup = window.__appCleanup
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
    const handleOnline: AppEventHandler = () => {
      console.warn('App is online')
      window.dispatchEvent(new CustomEvent('app-online'))
    }

    const handleOffline: AppEventHandler = () => {
      console.warn('App is offline')
      window.dispatchEvent(new CustomEvent('app-offline'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline) // Store handlers for cleanup
    const prevCleanup = window.__appCleanup ?? {}
    window.__appCleanup = {
      ...prevCleanup,
      handleOnline,
      handleOffline,
    }

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      // Full cleanup for development
      if (import.meta.env.MODE === 'development') {
        cleanupAppEventListeners()
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        brazilianOptimization={true}
        aestheticClinicMode={true}
        lgpdCompliance={true}
        defaultTheme="system"
        enableSystem
      >
        <AuthProvider>
          <TRPCProvider>
            <AccessibilityProvider>
              <div className='min-h-screen healthcare-bg-primary'>
                {/* PWA Components */}
                <PWAInstallPrompt className='fixed bottom-4 right-4 z-50' />
                <PWAOfflineIndicator className='fixed top-4 right-4 z-50' />

                {/* Main Application Router */}
                <RouterProvider router={router} />
              </div>
            </AccessibilityProvider>
          </TRPCProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
