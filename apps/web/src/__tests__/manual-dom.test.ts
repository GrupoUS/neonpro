import { expect, test } from 'vitest'

test('JSDOM environment is properly configured by vitest', () => {
  expect(document).toBeDefined()
  expect(window).toBeDefined()

  // Test basic DOM manipulation
  const div = document.createElement('div')
  div.textContent = 'Hello World'
  document.body.appendChild(div)

  expect(div.textContent).toBe('Hello World')
  expect(document.body.querySelector('div')).toBe(div)
})
