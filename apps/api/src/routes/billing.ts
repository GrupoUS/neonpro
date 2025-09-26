import { Hono } from 'hono'

const billing = new Hono()

billing.get('/', (c) => c.text('Billing router stub'))

export { billing }
