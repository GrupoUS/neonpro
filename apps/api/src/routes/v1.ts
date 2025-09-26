import { Hono } from 'hono'

const v1Router = new Hono()

v1Router.get('/', (c) => c.text('V1 router stub'))

export default v1Router
