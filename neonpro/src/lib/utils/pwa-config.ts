// ===============================================
// PWA Configuration for Patient Portal
// Story 4.3: Patient Portal & Self-Service
// ===============================================

import type { PWAConfig } from '@/types/patient-portal'

export const PORTAL_PWA_CONFIG: PWAConfig = {
  name: 'NeonPro Portal do Paciente',
  short_name: 'NeonPro Portal',
  description: 'Portal do paciente para clínicas de estética NeonPro',
  theme_color: '#6366f1',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/portal',
  scope: '/portal/',
  icons: [
    {
      src: '/portal/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png'
    },
    {
      src: '/portal/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    },
    {
      src: '/portal/icons/maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}

export function generateClinicPWAConfig(
  clinicName: string,
  themeColor?: string,
  backgroundColor?: string
): PWAConfig {
  return {
    ...PORTAL_PWA_CONFIG,
    name: `${clinicName} - Portal do Paciente`,
    short_name: `${clinicName}`,
    description: `Portal do paciente da clínica ${clinicName}`,
    theme_color: themeColor || PORTAL_PWA_CONFIG.theme_color,
    background_color: backgroundColor || PORTAL_PWA_CONFIG.background_color
  }
}// Service Worker Registration
export function registerPortalServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/portal/sw.js', {
          scope: '/portal/'
        })
        
        console.log('Portal Service Worker registered successfully:', registration.scope)
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification()
              }
            })
          }
        })
        
      } catch (error) {
        console.error('Portal Service Worker registration failed:', error)
      }
    })
  }
}

function showUpdateNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Atualização Disponível', {
      body: 'Uma nova versão do portal está disponível. Recarregue a página para atualizar.',
      icon: '/portal/icons/icon-192x192.png',
      badge: '/portal/icons/icon-72x72.png',
      tag: 'portal-update'
    })
  }
}

// Offline Support Functions
export function enableOfflineSupport() {
  if (typeof window !== 'undefined') {
    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial connection status
    if (!navigator.onLine) {
      handleOffline()
    }
  }
}

function handleOnline() {
  console.log('Portal back online - syncing offline actions')
  syncOfflineActions()
  showConnectionStatus('online')
}

function handleOffline() {
  console.log('Portal offline - enabling offline mode')
  showConnectionStatus('offline')
}

function showConnectionStatus(status: 'online' | 'offline') {
  // Remove existing status notifications
  const existingNotifications = document.querySelectorAll('.connection-status')
  existingNotifications.forEach(el => el.remove())
  
  // Create status notification
  const notification = document.createElement('div')
  notification.className = `connection-status fixed top-4 right-4 px-4 py-2 rounded-lg z-50 transition-all duration-300 ${
    status === 'online' 
      ? 'bg-green-100 border border-green-200 text-green-800' 
      : 'bg-yellow-100 border border-yellow-200 text-yellow-800'
  }`
  
  notification.innerHTML = `
    <div class="flex items-center space-x-2">
      <div class="w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}"></div>
      <span class="text-sm font-medium">
        ${status === 'online' ? 'Conectado' : 'Modo Offline'}
      </span>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remove online notification after 3 seconds
  if (status === 'online') {
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
}

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await syncAction(action)
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
        // Update retry count
        await updateActionRetryCount(action.id)
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions:', error)
  }
}

// IndexedDB operations for offline storage
async function getOfflineActions(): Promise<any[]> {
  // Simplified implementation - in real app would use proper IndexedDB wrapper
  return []
}

async function removeOfflineAction(actionId: string): Promise<void> {
  // Implementation for removing synced action
}

async function updateActionRetryCount(actionId: string): Promise<void> {
  // Implementation for updating retry count
}

async function syncAction(action: any): Promise<void> {
  // Implementation for syncing individual action
}

// PWA Install Prompt
export function enableInstallPrompt() {
  let deferredPrompt: any = null
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    // Show install button or notification
    showInstallPrompt()
  })
  
  window.addEventListener('appinstalled', () => {
    console.log('Portal PWA was installed')
    hideInstallPrompt()
    deferredPrompt = null
  })
  
  return {
    showInstallDialog: () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt')
          } else {
            console.log('User dismissed the install prompt')
          }
          deferredPrompt = null
        })
      }
    }
  }
}

function showInstallPrompt() {
  // Create install prompt UI
  const installBanner = document.createElement('div')
  installBanner.id = 'install-banner'
  installBanner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50'
  installBanner.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">Instalar Portal</h3>
        <p class="text-sm opacity-90">Adicione o portal à sua tela inicial para acesso rápido</p>
      </div>
      <div class="flex space-x-2">
        <button id="install-button" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Instalar
        </button>
        <button id="dismiss-install" class="text-white opacity-75 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(installBanner)
  
  // Add event listeners
  document.getElementById('install-button')?.addEventListener('click', () => {
    const installEvent = new CustomEvent('install-portal')
    window.dispatchEvent(installEvent)
  })
  
  document.getElementById('dismiss-install')?.addEventListener('click', hideInstallPrompt)
}

function hideInstallPrompt() {
  const banner = document.getElementById('install-banner')
  if (banner) {
    banner.style.opacity = '0'
    setTimeout(() => banner.remove(), 300)
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Send portal notification
export function sendPortalNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/portal/icons/icon-192x192.png',
      badge: '/portal/icons/icon-72x72.png',
      ...options
    })
    
    notification.onclick = function() {
      window.focus()
      notification.close()
    }
    
    return notification
  }
}

// Check if app is running as PWA
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://')
}