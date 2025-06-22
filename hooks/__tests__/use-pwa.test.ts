import { renderHook, act } from '@testing-library/react'
import { usePWA } from '../use-pwa'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock do navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: {
      register: jest.fn(),
      ready: Promise.resolve({
        sync: {
          register: jest.fn(),
        },
      }),
    },
  },
  writable: true,
})

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('usePWA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Estado inicial', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => usePWA())

      expect(result.current.isInstallable).toBe(false)
      expect(result.current.isInstalled).toBe(false)
      expect(result.current.isOnline).toBe(true)
      expect(result.current.isStandalone).toBe(false)
      expect(result.current.canInstall).toBe(false)
      expect(result.current.installPrompt).toBe(null)
    })

    it('deve detectar quando app está instalado via localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('true')

      const { result } = renderHook(() => usePWA())

      expect(result.current.isInstalled).toBe(true)
    })

    it('deve detectar modo standalone', () => {
      // Mock do matchMedia para retornar true para display-mode: standalone
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      const { result } = renderHook(() => usePWA())

      expect(result.current.isStandalone).toBe(true)
      expect(result.current.isInstalled).toBe(true)
    })
  })

  describe('Eventos de instalação', () => {
    it('deve atualizar estado quando beforeinstallprompt é disparado', () => {
      const { result } = renderHook(() => usePWA())

      const mockInstallPrompt = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      }

      act(() => {
        const event = new Event('beforeinstallprompt')
        Object.assign(event, mockInstallPrompt)
        window.dispatchEvent(event)
      })

      expect(result.current.isInstallable).toBe(true)
      expect(result.current.canInstall).toBe(true)
      expect(result.current.installPrompt).toBeTruthy()
    })

    it('deve atualizar estado quando app é instalado', () => {
      const { result } = renderHook(() => usePWA())

      act(() => {
        window.dispatchEvent(new Event('appinstalled'))
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwa-installed', 'true')
      expect(result.current.isInstalled).toBe(true)
      expect(result.current.isInstallable).toBe(false)
      expect(result.current.canInstall).toBe(false)
      expect(result.current.installPrompt).toBe(null)
    })
  })

  describe('Status de conexão', () => {
    it('deve atualizar quando fica online', () => {
      // Iniciar offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const { result } = renderHook(() => usePWA())

      expect(result.current.isOnline).toBe(false)

      // Simular volta da conexão
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      act(() => {
        window.dispatchEvent(new Event('online'))
      })

      expect(result.current.isOnline).toBe(true)
    })

    it('deve atualizar quando fica offline', () => {
      const { result } = renderHook(() => usePWA())

      expect(result.current.isOnline).toBe(true)

      act(() => {
        window.dispatchEvent(new Event('offline'))
      })

      expect(result.current.isOnline).toBe(false)
    })
  })

  describe('installApp', () => {
    it('deve instalar app quando prompt está disponível', async () => {
      const mockInstallPrompt = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      }

      const { result } = renderHook(() => usePWA())

      // Simular evento beforeinstallprompt
      act(() => {
        const event = new Event('beforeinstallprompt')
        Object.assign(event, mockInstallPrompt)
        window.dispatchEvent(event)
      })

      let installResult: boolean
      await act(async () => {
        installResult = await result.current.installApp()
      })

      expect(mockInstallPrompt.prompt).toHaveBeenCalled()
      expect(installResult!).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('pwa-installed', 'true')
    })

    it('deve retornar false quando prompt não está disponível', async () => {
      const { result } = renderHook(() => usePWA())

      let installResult: boolean
      await act(async () => {
        installResult = await result.current.installApp()
      })

      expect(installResult!).toBe(false)
    })

    it('deve retornar false quando usuário rejeita instalação', async () => {
      const mockInstallPrompt = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      }

      const { result } = renderHook(() => usePWA())

      // Simular evento beforeinstallprompt
      act(() => {
        const event = new Event('beforeinstallprompt')
        Object.assign(event, mockInstallPrompt)
        window.dispatchEvent(event)
      })

      let installResult: boolean
      await act(async () => {
        installResult = await result.current.installApp()
      })

      expect(installResult!).toBe(false)
    })
  })

  describe('registerServiceWorker', () => {
    it('deve registrar service worker com sucesso', async () => {
      const mockRegistration = {
        addEventListener: jest.fn(),
        installing: null,
      }

      navigator.serviceWorker.register = jest.fn().mockResolvedValue(mockRegistration)

      const { result } = renderHook(() => usePWA())

      let registerResult: boolean
      await act(async () => {
        registerResult = await result.current.registerServiceWorker()
      })

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(registerResult!).toBe(true)
    })

    it('deve retornar false quando service worker não é suportado', async () => {
      // Remover suporte ao service worker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      })

      const { result } = renderHook(() => usePWA())

      let registerResult: boolean
      await act(async () => {
        registerResult = await result.current.registerServiceWorker()
      })

      expect(registerResult!).toBe(false)
    })
  })

  describe('syncData', () => {
    it('deve agendar sincronização com sucesso', async () => {
      const mockSync = {
        register: jest.fn().mockResolvedValue(undefined),
      }

      const mockRegistration = {
        sync: mockSync,
      }

      navigator.serviceWorker.ready = Promise.resolve(mockRegistration as any)

      const { result } = renderHook(() => usePWA())

      let syncResult: boolean
      await act(async () => {
        syncResult = await result.current.syncData('test-sync')
      })

      expect(mockSync.register).toHaveBeenCalledWith('test-sync')
      expect(syncResult!).toBe(true)
    })

    it('deve retornar false quando background sync não é suportado', async () => {
      // Remover suporte ao service worker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      })

      const { result } = renderHook(() => usePWA())

      let syncResult: boolean
      await act(async () => {
        syncResult = await result.current.syncData('test-sync')
      })

      expect(syncResult!).toBe(false)
    })
  })

  describe('getInstallInstructions', () => {
    it('deve retornar instruções para Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      })

      const { result } = renderHook(() => usePWA())

      const instructions = result.current.getInstallInstructions()

      expect(instructions.browser).toBe('Chrome')
      expect(instructions.steps).toContain('Clique no ícone de menu (três pontos) no canto superior direito')
    })

    it('deve retornar instruções para Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      })

      const { result } = renderHook(() => usePWA())

      const instructions = result.current.getInstallInstructions()

      expect(instructions.browser).toBe('Firefox')
      expect(instructions.steps).toContain('Clique no ícone de menu (três linhas) no canto superior direito')
    })

    it('deve retornar instruções para Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      })

      const { result } = renderHook(() => usePWA())

      const instructions = result.current.getInstallInstructions()

      expect(instructions.browser).toBe('Safari')
      expect(instructions.steps).toContain('Clique no botão de compartilhar (quadrado com seta)')
    })
  })
})
