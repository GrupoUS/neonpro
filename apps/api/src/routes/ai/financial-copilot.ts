import { Hono } from 'hono'

const financialCopilotRouter = new Hono()

financialCopilotRouter.get('/', (c) => c.text('Financial Copilot router stub'))

export default financialCopilotRouter
