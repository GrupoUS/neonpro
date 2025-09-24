import { JSDOM } from 'jsdom'
import { expect, test } from 'vitest'

// Setup DOM for this specific test
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
global.window = dom.window

test('DOM is available in test file', () => {
  expect(document).toBeDefined()
  expect(window).toBeDefined()
  expect(document.body).toBeDefined()
  expect(document.createElement('div')).toBeDefined()
})

test('DOM operations work', () => {
  const div = document.createElement('div')
  div.textContent = 'Test'
  document.body.appendChild(div)

  expect(document.querySelector('div')).toBeTruthy()
  expect(document.querySelector('div')?.textContent).toBe('Test')
})
