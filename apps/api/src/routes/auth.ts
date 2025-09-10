import { Hono } from 'hono'

const auth = new Hono()

auth.get('/status', (c) => c.json({ feature: 'auth', status: 'ok' }))

export default auth
