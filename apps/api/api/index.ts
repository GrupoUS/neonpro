import { handle, } from 'hono/vercel'
import app from '../src/index'

export const config = { runtime: 'nodejs20.x', } as const
export default handle(app,)
