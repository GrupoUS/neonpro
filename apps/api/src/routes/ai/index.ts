/**
 * Unified AI Routes Index
 * Consolidates all AI-related endpoints under /ai namespace
 */

import { Hono } from 'hono'
import analyzeRoutes from './analyze'
import chatRoutes from './chat'
import { copilotEndpoint } from './copilot'
import copilotBridge from './copilot-bridge'
import insightsRoutes from './insights'
import modelsRoutes from './models'
import realtimeRoutes from './realtime'
import dataAgentRoutes from './data-agent'
import sessionsRoutes from './sessions'
import feedbackRoutes from './feedback'

// Import legacy routes for consolidation
import chatEnhancedRoutes from '../ai-chat-enhanced'
import explanationRoutes from '../ai-explanation'

const app = new Hono()

// Mount AI chat routes under /chat
app.route('/chat', chatRoutes)

// Mount CopilotKit bridge routes under /copilot
app.route('/copilot', copilotBridge)

// Mount AI insights routes under /insights
app.route('/insights', insightsRoutes)

// Mount AI analyze route
app.route('', analyzeRoutes)

// Mount AI models routes under /models
app.route('/models', modelsRoutes)

// Mount real-time subscription routes under /realtime
app.route('/realtime', realtimeRoutes)

// Mount data agent routes under /data-agent
app.route('/data-agent', dataAgentRoutes)

// Mount session management routes under /sessions
app.route('/sessions', sessionsRoutes)

// Mount feedback routes under /feedback
app.route('/feedback', feedbackRoutes)

// Mount enhanced chat routes under /chat-enhanced
app.route('/chat-enhanced', chatEnhancedRoutes)

// Mount explanation routes under /explanation
app.route('/explanation', explanationRoutes)

// Mount CopilotKit endpoint for frontend integration
app.all('/copilot', copilotEndpoint)

export default app
