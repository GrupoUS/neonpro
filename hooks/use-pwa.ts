'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isStandalone: boolean
  canInstall: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isStandalone: false,
    canInstall: false,
    installPrompt: null
  })

  useEffect(() => {
    // Verificar se está rodando como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://')

    // Verificar se já está instalado
    const isInstalled = isStandalone || 
                       localStorage.getItem('pwa-installed') === 'true'

    // Verificar status online
    const isOnline = navigator.onLine

    setPwaState(prev => ({
      ...prev,
      isStandalone,
      isInstalled,
      isOnline
    }))

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as BeforeInstallPromptEvent
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        canInstall: true,
        installPrompt: installEvent
      }))
    }

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true')
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        canInstall: false,
        installPrompt: null
      }))
    }

    // Listeners para status de conexão
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
    }

    // Registrar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async (): Promise<boolean> => {
    if (!pwaState.installPrompt) {
      return false
    }

    try {
      await pwaState.installPrompt.prompt()
      const choiceResult = await pwaState.installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true')
        setPwaState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          canInstall: false,
          installPrompt: null
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  const registerServiceWorker = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registrado:', registration)
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              console.log('Nova versão do app disponível')
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error)
      return false
    }
  }

  const syncData = async (tag: string): Promise<boolean> => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('Background Sync não suportado')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(tag)
      console.log(`Sincronização agendada: ${tag}`)
      return true
    } catch (error) {
      console.error('Erro ao agendar sincronização:', error)
      return false
    }
  }

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Clique no ícone de menu (três pontos) no canto superior direito',
          'Selecione "Instalar NeonPro..."',
          'Clique em "Instalar" na janela que aparecer'
        ]
      }
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Clique no ícone de menu (três linhas) no canto superior direito',
          'Selecione "Instalar este site como um app"',
          'Clique em "Instalar" para confirmar'
        ]
      }
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Clique no botão de compartilhar (quadrado com seta)',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" para confirmar'
        ]
      }
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        steps: [
          'Clique no ícone de menu (três pontos) no canto superior direito',
          'Selecione "Apps" > "Instalar este site como um app"',
          'Clique em "Instalar" para confirmar'
        ]
      }
    }
    
    return {
      browser: 'Navegador',
      steps: [
        'Procure por uma opção de "Instalar app" ou "Adicionar à tela inicial"',
        'Geralmente está no menu do navegador',
        'Siga as instruções do seu navegador'
      ]
    }
  }

  return {
    ...pwaState,
    installApp,
    registerServiceWorker,
    syncData,
    getInstallInstructions
  }
}
