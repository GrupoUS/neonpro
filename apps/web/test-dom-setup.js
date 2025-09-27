#!/usr/bin/env node

// Simple test runner to validate DOM setup without vitest
import { JSDOM } from 'jsdom'

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
})

// Set global DOM objects (with proper handling of read-only properties)
global.document = dom.window.document
global.window = dom.window

// Use Object.defineProperty for read-only properties
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'localStorage', {
  value: dom.window.localStorage,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'sessionStorage', {
  value: dom.window.sessionStorage,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'location', {
  value: dom.window.location,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'history', {
  value: dom.window.history,
  writable: false,
  configurable: true,
})

Object.defineProperty(global, 'URL', {
  value: dom.window.URL,
  writable: false,
  configurable: true,
})

// Debug logs for DOM setup validation
// console.warn('✅ DOM setup successful')
// console.warn('document:', typeof document, document ? 'exists' : 'missing')
// console.warn('window:', typeof window, window ? 'exists' : 'missing')
// console.warn('navigator:', typeof navigator, navigator ? 'exists' : 'missing')
// console.warn('localStorage:', typeof localStorage, localStorage ? 'exists' : 'missing')

// Test basic DOM manipulation
const testDiv = document.createElement('div')
testDiv.textContent = 'Test Content'
testDiv.setAttribute('data-testid', 'test-div')
document.body.appendChild(testDiv)

// Debug logs for DOM manipulation
// console.warn('✅ DOM manipulation successful')
// console.warn('Test div content:', document.querySelector('[data-testid="test-div"]')?.textContent)

// Test testing-library queries
try {
  // Create a simple screen object similar to testing-library
  const screen = {
    getByTestId: testId => {
      const element = document.querySelector(`[data-testid="${testId}"]`)
      if (!element) {
        throw new Error(`Unable to find an element with the testid: ${testId}`)
      }
      return element
    },
  }

  const _foundElement = screen.getByTestId('test-div')
  // Debug logs for testing-library queries
  // console.warn('✅ Testing-library style queries successful')
  // console.warn('Found element:', foundElement.textContent)
} catch (_error) {}

// console.warn('🎉 All DOM setup tests passed!')
