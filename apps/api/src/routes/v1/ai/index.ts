/**
 * V1 AI Routes Index
 * Provides backward compatibility for v1 API endpoints
 */

import { Hono } from 'hono';
import analyzeRoutes from './analyze';

const app = new Hono();

// Mount AI analyze route for v1 compatibility
app.route('/analyze', analyzeRoutes);

export default app;