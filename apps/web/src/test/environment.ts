import { JSDOM } from 'jsdom'

// Setup JSDOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously',
})

// Set global DOM objects
global.document = dom.window.document
global.window = dom.window
global.navigator = dom.window.navigator
global.location = dom.window.location
global.history = dom.window.history
global.URL = dom.window.URL
global.URLSearchParams = dom.window.URLSearchParams
global.Blob = dom.window.Blob
global.File = dom.window.File
global.FileReader = dom.window.FileReader
global.FormData = dom.window.FormData
global.XMLHttpRequest = dom.window.XMLHttpRequest
global.Event = dom.window.Event
global.CustomEvent = dom.window.CustomEvent
global.Storage = dom.window.Storage
global.localStorage = dom.window.localStorage
global.sessionStorage = dom.window.sessionStorage
global.Image = dom.window.Image
global.HTMLCanvasElement = dom.window.HTMLCanvasElement
global.CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D
global.Request = dom.window.Request
global.Response = dom.window.Response
global.Headers = dom.window.Headers
global.FetchEvent = dom.window.FetchEvent
global.ServiceWorkerGlobalScope = dom.window.ServiceWorkerGlobalScope
global.WorkerGlobalScope = dom.window.WorkerGlobalScope

// Set globalThis
globalThis.document = dom.window.document
globalThis.window = dom.window
globalThis.navigator = dom.window.navigator
globalThis.location = dom.window.location
globalThis.history = dom.window.history
globalThis.URL = dom.window.URL
globalThis.localStorage = dom.window.localStorage
globalThis.sessionStorage = dom.window.sessionStorage

// Mock missing APIs
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

if (!global.WebSocket) {
  global.WebSocket = require('ws')
}

// Export for testing
export { dom }
