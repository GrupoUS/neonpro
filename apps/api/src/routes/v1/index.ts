/**
 * V1 Routes Index
 * Main router for v1 API endpoints
 */

import { Hono } from 'hono'
import aiRoutes from './ai/index.js'

const app = new Hono()

// Mount AI routes under /ai
app.route('/ai', aiRoutes)

export default app
