// Polyfill for @supabase/node-fetch
// In browser, we use the native fetch API
export default globalThis.fetch
export const fetch = globalThis.fetch
export const Headers = globalThis.Headers
export const Request = globalThis.Request
export const Response = globalThis.Response
