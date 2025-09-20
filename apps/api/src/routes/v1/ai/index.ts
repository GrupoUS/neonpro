/**
 * V1 AI Routes Index
 * Provides backward compatibility for v1 API endpoints
 */

import { Hono } from 'hono';
import analyzeRoutes from './analyze';
import crudRoutes from './crud';

const app = new Hono();

// Mount AI analyze route for v1 compatibility
app.route('/analyze', analyzeRoutes);

// Mount AI CRUD routes for 3-step flow
app.route('/crud', crudRoutes);

export default app;