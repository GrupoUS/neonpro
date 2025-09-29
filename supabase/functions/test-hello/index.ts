import { Hono } from 'https://esm.sh/hono@4.9.7'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: 'Hello from test function',
    timestamp: new Date().toISOString()
  })
})

Deno.serve(app.fetch)