import { createRouter, RouterProvider } from '@tanstack/react-router'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { TanStackQueryProvider } from './components/providers/TanStackQueryProvider'
import { TRPCProvider } from './components/stubs/TRPCProvider'
import { routeTree } from './routeTree.gen'

// Import PWA Styles
import './styles/pwa.css'

// Create the router
const router = createRouter({ routeTree })

// Register the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// PWA Install Prompt Handler
let deferredPrompt: any

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

    window.addEventListener('load', handleLoad) // Store for cleanup
    ;(window as any).__pwaCleanup = {
      loadHandler: handleLoad,
    }
  }

  // Before install prompt
  const handleBeforeInstall = (e: any) => {
    e.preventDefault()
    deferredPrompt = e

    // Show custom install UI if needed
    const installButton = document.getElementById('pwa-install-button')
    if (installButton) {
      installButton.style.display = 'block'

      // Remove existing listener if any
      const existingCleanup = (installButton as any).__installHandler
      if (existingCleanup) {
        installButton.removeEventListener('click', existingCleanup)
      }

      const handleInstallClick = async () => {
        deferredPrompt.prompt()
        const choiceResult: any = await deferredPrompt.userChoice
        if (choiceResult.outcome === 'accepted') {
          console.warn('User accepted the install prompt')
        } else {
          console.warn('User dismissed the install prompt')
        }
        deferredPrompt = null
      }

      installButton.addEventListener('click', handleInstallClick)
      ;(installButton as any).__installHandler = handleInstallClick
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

  // Store cleanup functions
  const cleanup = (window as any).__pwaCleanup || {}
  ;(window as any).__pwaCleanup = {
    ...cleanup,
    beforeInstallHandler: handleBeforeInstall,
    appInstalledHandler: handleAppInstalled,
    onlineHandler: handleOnline,
    offlineHandler: handleOffline,
    cleanup: function() {
      window.removeEventListener('load', cleanup.loadHandler)
      window.removeEventListener('beforeinstallprompt', cleanup.beforeInstallHandler)
      window.removeEventListener('appinstalled', cleanup.appInstalledHandler)
      window.removeEventListener('online', cleanup.onlineHandler)
      window.removeEventListener('offline', cleanup.offlineHandler)

      const installButton = document.getElementById('pwa-install-button')
      if (installButton && (installButton as any).__installHandler) {
        installButton.removeEventListener('click', (installButton as any).__installHandler)
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
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('beforeunload', () => {
    const cleanup = (window as any).__pwaCleanup
    if (cleanup && typeof cleanup.cleanup === 'function') {
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
        <RouterProvider router={router} />
      </TRPCProvider>
    </TanStackQueryProvider>
  </React.StrictMode>,
)
