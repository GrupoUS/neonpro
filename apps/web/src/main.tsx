import { createRouter, RouterProvider } from '@tanstack/react-router'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { TanStackQueryProvider } from './components/stubs/TanStackQueryProvider.js'
import { TRPCProvider } from './components/stubs/TRPCProvider.js'
import { AuthProvider } from './contexts/AuthContext.js'
import { routeTree } from './routeTree.gen.js'

// Import PWA Styles
import './styles/pwa.css'

// Create the router with proper configuration
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// PWA Install Prompt Handler
let deferredPrompt: BeforeInstallPromptEvent | null = null

// Function to setup event listeners with cleanup
function setupPWAEventListeners() {
  // Service Worker registration
  if ('serviceWorker' in navigator) {
    const handleLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.warn('ServiceWorker registration successful with scope: ', registration.scope)
      } catch (error) {
        console.error('ServiceWorker registration failed: ', error)
      }
    }

    window.addEventListener('load', handleLoad)
    // store typed handler
    window.__pwaCleanup = {
      ...window.__pwaCleanup,
      loadHandler: handleLoad,
    }
  }

  // Before install prompt
  const handleBeforeInstall = (e: Event) => {
    const event = e as BeforeInstallPromptEvent
    event.preventDefault?.()
    deferredPrompt = event

    // typed install button with optional __installHandler
    const installButton = document.getElementById('pwa-install-button') as
      | (HTMLElement & { __installHandler?: EventListener })
      | null
    if (installButton) {
      installButton.style.display = 'block'

      // Remove existing listener if any
      const existingCleanup = installButton.__installHandler
      if (existingCleanup) {
        installButton.removeEventListener('click', existingCleanup)
      }

      const handleInstallClick: EventListener = async () => {
        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        if (choiceResult.outcome === 'accepted') {
          console.warn('User accepted the install prompt')
        } else {
          console.warn('User dismissed the install prompt')
        }
        deferredPrompt = null
      }

      installButton.addEventListener('click', handleInstallClick)
      installButton.__installHandler = handleInstallClick
    }
  }

  // App installed
  const handleAppInstalled = () => {
    console.warn('PWA was installed')
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'none'
    }
  }

  // Online status
  const handleOnline = () => {
    console.warn('App is online')
    document.body.classList.remove('offline')
    document.body.classList.add('online')
  }

  // Offline status
  const handleOffline = () => {
    console.warn('App is offline')
    document.body.classList.remove('online')
    document.body.classList.add('offline')
  }

  // Add all event listeners
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', handleAppInstalled)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Store cleanup functions safely
  const prev = window.__pwaCleanup || {}
  window.__pwaCleanup = {
    ...prev,
    beforeInstallHandler: handleBeforeInstall,
    appInstalledHandler: handleAppInstalled,
    onlineHandler: handleOnline,
    offlineHandler: handleOffline,
    cleanup: function() {
      if (prev.loadHandler) window.removeEventListener('load', prev.loadHandler)
      if (prev.beforeInstallHandler) {
        window.removeEventListener('beforeinstallprompt', prev.beforeInstallHandler)
      }
      if (prev.appInstalledHandler) {
        window.removeEventListener('appinstalled', prev.appInstalledHandler)
      }
      if (prev.onlineHandler) window.removeEventListener('online', prev.onlineHandler)
      if (prev.offlineHandler) window.removeEventListener('offline', prev.offlineHandler)

      const installButton = document.getElementById('pwa-install-button') as
        | (HTMLElement & { __installHandler?: EventListener })
        | null
      if (installButton && installButton.__installHandler) {
        installButton.removeEventListener('click', installButton.__installHandler)
        delete installButton.__installHandler
      }
    },
  }
}

// Setup PWA event listeners
setupPWAEventListeners()

// Set initial online status
if (navigator.onLine) {
  document.body.classList.add('online')
} else {
  document.body.classList.add('offline')
}

// Cleanup function for development hot-reloading
if (typeof window !== 'undefined' && import.meta.env.MODE === 'development') {
  window.addEventListener('beforeunload', () => {
    const cleanup = window.__pwaCleanup
    if (cleanup?.cleanup) {
      cleanup.cleanup()
    }
  })
}

// Render the app
const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <TanStackQueryProvider>
      <TRPCProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TRPCProvider>
    </TanStackQueryProvider>
  </React.StrictMode>,
)

// Add typed BeforeInstallPromptEvent and PWA cleanup types
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type PWACleanup = {
  loadHandler?: (this: Window, ev?: Event) => void
  beforeInstallHandler?: (e: Event) => void
  appInstalledHandler?: () => void
  onlineHandler?: () => void
  offlineHandler?: () => void
  cleanup?: () => void
}

declare global {
  interface Window {
    __pwaCleanup?: PWACleanup
  }
}
