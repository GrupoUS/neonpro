import { Hono } from 'hono'

const appointmentsRouter = new Hono()

appointmentsRouter.get('/', (c) => c.text('Appointments router stub'))

export default appointmentsRouter
