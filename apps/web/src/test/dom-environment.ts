// DOM environment setup for tests
import { JSDOM } from 'jsdom'

console.log('🔧 DOM environment setup starting...')

// Initialize DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously',
})

console.log('🔧 JSDOM created successfully')

// Assign to global scope
if (typeof global !== 'undefined') {
  console.log('🔧 Setting up global scope...')
  global.document = dom.window.document
  global.window = dom.window
  global.navigator = dom.window.navigator
  global.location = dom.window.location
  global.history = dom.window.history
  global.URL = dom.window.URL
  global.URLSearchParams = dom.window.URLSearchParams
  global.localStorage = dom.window.localStorage
  global.sessionStorage = dom.window.sessionStorage
  console.log('🔧 Global scope setup complete')
}

// Also assign to globalThis
if (typeof globalThis !== 'undefined') {
  console.log('🔧 Setting up globalThis scope...')
  globalThis.document = dom.window.document
  globalThis.window = dom.window
  globalThis.navigator = dom.window.navigator
  globalThis.location = dom.window.location
  globalThis.history = dom.window.history
  globalThis.URL = dom.window.URL
  globalThis.localStorage = dom.window.localStorage
  globalThis.sessionStorage = dom.window.sessionStorage
  console.log('🔧 globalThis scope setup complete')
}

console.log('🔧 DOM environment setup complete')

export { dom }
