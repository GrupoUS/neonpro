'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ServiceWorkerRegistration() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true)
      registerSW()
    } else {
      console.warn('Service Workers not supported in this browser')
    }
  }, [])

  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setIsRegistered(true)
      console.log('Service Worker registered successfully:', registration)

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available, prompt user to refresh
                toast.info('Uma nova versão do aplicativo está disponível', {
                  description: 'Recarregue a página para usar a versão mais recente',
                  duration: 10000,
                  action: {
                    label: 'Recarregar',
                    onClick: () => window.location.reload()
                  }
                })
              } else {
                // First time install
                console.log('Service Worker installed for the first time')
              }
            }
          })
        }
      })

      // Handle service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed')
        // Optionally reload the page to ensure consistency
        // window.location.reload()
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from Service Worker:', event.data)
        
        const { type, data } = event.data
        
        switch (type) {
          case 'CACHE_UPDATED':
            toast.success('Aplicativo atualizado', {
              description: 'Nova versão carregada com sucesso'
            })
            break
          case 'OFFLINE_MODE':
            toast.info('Modo offline ativado', {
              description: 'Você está navegando offline'
            })
            break
          case 'ONLINE_MODE':
            toast.success('Conectado novamente', {
              description: 'Conexão com internet restaurada'
            })
            break
        }
      })

    } catch (error) {
      console.error('Service Worker registration failed:', error)
      setIsRegistered(false)
      
      toast.error('Erro ao registrar Service Worker', {
        description: 'Algumas funcionalidades offline podem não funcionar'
      })
    }
  }

  const updateServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        toast.success('Service Worker atualizado')
      }
    } catch (error) {
      console.error('Error updating service worker:', error)
      toast.error('Erro ao atualizar Service Worker')
    }
  }

  const unregisterServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        setIsRegistered(false)
        toast.success('Service Worker removido')
      }
    } catch (error) {
      console.error('Error unregistering service worker:', error)
      toast.error('Erro ao remover Service Worker')
    }
  }

  // Skip waiting for new service worker
  const skipWaiting = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        toast.success('Atualizando aplicativo...')
      }
    } catch (error) {
      console.error('Error skipping waiting:', error)
    }
  }

  // Check for service worker updates manually
  const checkForUpdates = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        
        if (registration.waiting) {
          toast.info('Nova versão disponível', {
            description: 'Clique para atualizar o aplicativo',
            duration: 10000,
            action: {
              label: 'Atualizar',
              onClick: skipWaiting
            }
          })
        } else {
          toast.success('Aplicativo já está atualizado')
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
      toast.error('Erro ao verificar atualizações')
    }
  }

  // This component doesn't render anything visible
  // It just handles service worker registration and updates
  return null
}

// Hook to check if app is running as PWA
export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      // Check various indicators that suggest the app is installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = (window.navigator as any).standalone === true
      const hasMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
      
      setIsInstalled(isStandalone || isInApp || hasMinimalUI)
    }

    checkInstalled()
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addListener(checkInstalled)
    
    return () => mediaQuery.removeListener(checkInstalled)
  }, [])

  return isInstalled
}

// Hook to check if service worker is supported and registered
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        setIsSupported(true)
        
        try {
          const reg = await navigator.serviceWorker.getRegistration()
          if (reg) {
            setIsRegistered(true)
            setRegistration(reg)
          }
        } catch (error) {
          console.error('Error checking service worker registration:', error)
        }
      }
    }

    checkSupport()
  }, [])

  return {
    isSupported,
    isRegistered,
    registration,
    updateServiceWorker: async () => {
      if (registration) {
        await registration.update()
      }
    },
    unregisterServiceWorker: async () => {
      if (registration) {
        await registration.unregister()
        setIsRegistered(false)
        setRegistration(null)
      }
    }
  }
}
