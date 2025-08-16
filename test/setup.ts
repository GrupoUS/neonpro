import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Global test environment setup
beforeAll(() => {
  // Mock console methods for cleaner test output
  global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
  
  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver for UI component tests
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver for responsive component tests
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
  useParams() {
    return {}
  },
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    return {
      type: 'img',
      props: {
        src: props.src,
        alt: props.alt || '',
        ...props
      }
    }
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: (props: any) => {
    return {
      type: 'a',
      props: {
        href: props.href,
        children: props.children,
        ...props
      }
    }
  },
}))

// Mock next/font modules
vi.mock('next/font/google', () => ({
  Inter: () => ({
    style: {
      fontFamily: 'Inter',
    },
  }),
  Roboto: () => ({
    style: {
      fontFamily: 'Roboto',
    },
  }),
}))

// Mock environment variables for testing
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_ENVIRONMENT: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-clerk-key',
}

// Mock crypto for patient data encryption tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: any) => arr,
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
    },
  },
})

// Mock File and FileReader for medical document upload tests
Object.defineProperty(global, 'File', {
  value: vi.fn().mockImplementation((chunks: BlobPart[], name: string, options?: FilePropertyBag) => ({
    name,
    size: 1024,
    type: options?.type || 'application/pdf',
    lastModified: Date.now(),
    webkitRelativePath: '',
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn().mockResolvedValue('test-content'),
    bytes: vi.fn().mockResolvedValue(new Uint8Array(1024)),
  })),
})

Object.defineProperty(global, 'FileReader', {
  value: vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    result: 'test-file-content',
    onload: null,
    onerror: null,
    onabort: null,
    onloadstart: null,
    onloadend: null,
    onprogress: null,
    readyState: 0,
    error: null,
    EMPTY: 0,
    LOADING: 1,
    DONE: 2,
  })),
})

// Mock geolocation for clinic location services
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success) =>
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
        },
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
})

// Mock localStorage for patient preferences
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage for temporary data
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

export {}