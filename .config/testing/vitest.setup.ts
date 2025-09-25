// Shared Vitest setup for NeonPro
// Ensures DOM matchers, IndexedDB, and browser APIs exist in tests

import '@testing-library/jest-dom/vitest'

// Fake IndexedDB for hooks using IDB (offline forms, caches)
import 'fake-indexeddb/auto'

// Polyfill ResizeObserver for components using it (charts, layouts)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class ResizeObserverPolyfill {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Only set if missing to avoid conflicts
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  ;(globalThis as any).ResizeObserver = ResizeObserverPolyfill as any
}

// Guard common env defaults for stable test behavior
process.env.TZ ||= 'UTC'
process.env.NODE_ENV ||= 'test'
