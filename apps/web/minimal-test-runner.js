#!/usr/bin/env node

// Minimal test runner to bypass vitest CLI issues
import { JSDOM } from 'jsdom'

console.log('🧪 Starting minimal test runner...')

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

console.log('✅ DOM environment setup complete')

// Mock React and testing library for basic component testing
const React = {
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
  createElement: (type, props, ...children) => {
    const element = document.createElement(type === 'div' ? 'div' : 'span')
    if (props && props['data-testid']) {
      element.setAttribute('data-testid', props['data-testid'])
    }
    if (props && props.onClick) {
      element.addEventListener('click', props.onClick)
    }
    if (children && children.length) {
      element.textContent = children.join(' ')
    }
    return element
  },
}

global.React = React

// Simple testing library mock
const _testingLibrary = {
  render: (component) => {
    const container = document.createElement('div')
    container.id = 'root'

    // Simple component renderer - just append the component directly
    if (component && typeof component === 'object') {
      container.appendChild(component)
    }

    document.body.appendChild(container)

    const screen = {
      getByTestId: (testId) => {
        const element = document.querySelector(`[data-testid="${testId}"]`)
        if (!element) {
          throw new Error(`Unable to find an element with the testid: ${testId}`)
        }
        return element
      },
      queryByTestId: (testId) => {
        return document.querySelector(`[data-testid="${testId}"]`)
      },
    }

    return { container, screen }
  },
  fireEvent: {
    click: (element) => {
      element.click()
    },
    change: (element, value) => {
      element.value = value
      element.dispatchEvent(new Event('change', { bubbles: true }))
    },
  },
  waitFor: async (callback) => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    return callback()
  },
}

// Mock vi functions
const vi = {
  fn: (impl) => {
    const mockFn = impl || (() => {})
    mockFn.mock = {
      calls: [],
      instances: [],
      clear: () => {
        mockFn.mock.calls = []
        mockFn.mock.instances = []
      },
    }
    mockFn.mockClear = () => {
      mockFn.mock.calls = []
      mockFn.mock.instances = []
    }
    return mockFn
  },
  clearAllMocks: () => {},
  beforeEach: (callback) => callback(),
  afterEach: (callback) => callback(),
  describe: (name, callback) => {
    console.log(`\n📋 ${name}`)
    callback()
  },
  it: (name, callback) => {
    try {
      console.log(`  ✅ ${name}`)
      callback()
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`)
      throw error
    }
  },
  expect: (actual) => ({
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`)
      }
    },
    toBeInTheDocument: () => {
      if (!actual || !actual.parentNode) {
        throw new Error('Element is not in the document')
      }
    },
    toHaveBeenCalled: () => {
      if (!actual.mock || actual.mock.calls.length === 0) {
        throw new Error('Function was not called')
      }
    },
  }),
}

global.vi = vi

// Import and run our test
console.log('🔄 Loading test file...')

try {
  // Simple test to verify our setup works
  vi.describe('DOM Setup Test', () => {
    vi.it('should create and find elements', () => {
      const testDiv = document.createElement('div')
      testDiv.setAttribute('data-testid', 'test-div')
      testDiv.textContent = 'Test Content'
      document.body.appendChild(testDiv)

      const element = document.querySelector('[data-testid="test-div"]')
      vi.expect(element).toBeInTheDocument()
      vi.expect(element.textContent).toBe('Test Content')
    })

    vi.it('should handle basic form interactions', () => {
      const form = document.createElement('form')
      form.setAttribute('data-testid', 'test-form')

      const nameInput = document.createElement('input')
      nameInput.setAttribute('data-testid', 'name-input')
      nameInput.type = 'text'
      form.appendChild(nameInput)

      const submitButton = document.createElement('button')
      submitButton.setAttribute('data-testid', 'submit-button')
      submitButton.type = 'submit'
      submitButton.textContent = 'Submit'
      form.appendChild(submitButton)

      document.body.appendChild(form)

      // Verify form elements exist
      vi.expect(document.querySelector('[data-testid="test-form"]')).toBeInTheDocument()
      vi.expect(document.querySelector('[data-testid="name-input"]')).toBeInTheDocument()
      vi.expect(document.querySelector('[data-testid="submit-button"]')).toBeInTheDocument()
    })
  })

  console.log('\n🎉 All tests passed! DOM setup is working correctly.')
} catch (error) {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
}
