import { Hono } from 'hono'

const copilotBridge = new Hono()

copilotBridge.get('/', c => c.text('Copilot Bridge router stub'))

export default copilotBridge
