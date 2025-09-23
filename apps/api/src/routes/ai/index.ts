/**
 * AI Routes Index
 * Combines all AI-related endpoints under /ai namespace
 */

import { Hono } from 'hono';
import analyzeRoutes from './analyze';
import chatRoutes from './chat';
import { copilotEndpoint } from './copilot';
import copilotBridge from './copilot-bridge';
import insightsRoutes from './insights';
import modelsRoutes from './models';
import realtimeRoutes from './realtime';

const app = new Hono();

// Mount AI chat routes under /chat
app.route('/chat', chatRoutes);

// Mount CopilotKit bridge routes under /copilot
app.route('/copilot', copilotBridge);

// Mount AI insights routes under /insights
app.route('/insights', insightsRoutes);

// Mount AI analyze route
app.route('', analyzeRoutes);

// Mount AI models routes under /models
app.route('/models', modelsRoutes);

// Mount real-time subscription routes under /realtime
app.route('/realtime', realtimeRoutes);

// Mount CopilotKit endpoint for frontend integration
app.all('/copilot', copilotEndpoint);

export default app;
