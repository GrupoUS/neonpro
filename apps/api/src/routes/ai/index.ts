import { Hono } from 'hono'

const aiRouter = new Hono()

aiRouter.get('/', (c) => c.text('AI router stub'))

export default aiRouter
