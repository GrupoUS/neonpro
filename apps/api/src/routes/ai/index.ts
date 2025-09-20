/**
 * AI Routes Index
 * Combines all AI-related endpoints under /ai namespace
 */

import { Hono } from 'hono';
import analyzeRoutes from './analyze';
import chatRoutes from './chat';
import copilotBridge from './copilot-bridge';
import insightsRoutes from './insights';
import modelsRoutes from './models';

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

export default app;
