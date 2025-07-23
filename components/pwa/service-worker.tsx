// NeonPro - PWA Service Worker Registration
// VIBECODE V1.0 - Healthcare PWA Excellence Standards
// Purpose: Register and manage Service Worker with healthcare-specific configurations

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isInstalling: boolean
  isWaitingUpdate: boolean
  registration: ServiceWorkerRegistration | null
}

export function PWAServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaitingUpdate: false,
    registration: null,
  })

  useEffect(() => {
    // Check if Service Worker is supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    // Register Service Worker
    const registerServiceWorker = async () => {
      try {
        setState(prev => ({ ...prev, isInstalling: true }))

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check for updates
        })

        setState(prev => ({
          ...prev,
          isRegistered: true,
          isInstalling: false,
          registration,
        }))

        console.log('✅ NeonPro Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setState(prev => ({ ...prev, isWaitingUpdate: true }))
                
                toast.info('Nova versão disponível', {
                  description: 'Clique para atualizar o aplicativo',
                  action: {
                    label: 'Atualizar',
                    onClick: () => {
                      newWorker.postMessage({ action: 'SKIP_WAITING' })
                      window.location.reload()
                    },
                  },
                  duration: 10000,
                })
              }
            })
          }
        })

        // Listen for controlling Service Worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker controller changed - reloading page')
          window.location.reload()
        })

        // Background sync event listeners
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'BACKGROUND_SYNC') {
            const { success, failed, total } = event.data
            
            if (success > 0) {
              toast.success(`${success} ações sincronizadas com sucesso`)
            }
            
            if (failed > 0) {
              toast.error(`${failed} ações falharam na sincronização`)
            }

            console.log(`📡 Background sync completed: ${success}/${total} successful`)
          }
        })

        // Manual update check on page load
        if (registration.waiting) {
          setState(prev => ({ ...prev, isWaitingUpdate: true }))
        }

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update().catch(console.warn)
        }, 5 * 60 * 1000)

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
        setState(prev => ({ ...prev, isInstalling: false }))
        
        toast.error('Erro ao carregar funcionalidades offline', {
          description: 'Algumas funcionalidades podem não estar disponíveis',
        })
      }
    }

    // Register when page loads
    registerServiceWorker()

    // Register on page visibility change (for mobile app switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update().catch(console.warn)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // This component only handles registration, no UI
  return null
}

// Install prompt component
export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true

      setIsInstalled(isInstalled)
    }

    checkInstalled()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)

      // Show install prompt after 30 seconds
      setTimeout(() => {
        if (!isInstalled) {
          toast.info('Instalar NeonPro', {
            description: 'Adicione o NeonPro à sua tela inicial para acesso rápido',
            action: {
              label: 'Instalar',
              onClick: handleInstall,
            },
            duration: 15000,
          })
        }
      }, 30000)
    }

    const handleInstall = async () => {
      if (!installPrompt) return

      try {
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        
        if (outcome === 'accepted') {
          toast.success('NeonPro instalado com sucesso!')
          setIsInstalled(true)
        }
        
        setInstallPrompt(null)
      } catch (error) {
        console.error('Install prompt failed:', error)
      }
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      toast.success('NeonPro foi adicionado à sua tela inicial!')
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [installPrompt, isInstalled])

  return null
}

// Types for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}
