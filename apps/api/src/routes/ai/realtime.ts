/**
 * Real-time Subscriptions Endpoint
 *
 * Provides REST API for managing real-time subscriptions for AI agent sessions
 * with healthcare compliance and security filtering.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { v4 as uuidv4 } from 'uuid';
import { AguiService } from '../../services/agui-protocol/service';
import { logger } from '../../utils/secure-logger';

const app = new Hono();

// Apply CORS for cross-origin requests
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://app.neonpro.com', 'https://neonpro.com']
      : ['http://localhost:3000', 'http://localhost:3005'],
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }),
);

// Apply JWT authentication for protected routes
app.use(
  '/subscribe',
  jwt({
    secret: process.env.JWT_SECRET || 'fallback-secret',
  }),
);
app.use(
  '/unsubscribe',
  jwt({
    secret: process.env.JWT_SECRET || 'fallback-secret',
  }),
);
app.use(
  '/analytics',
  jwt({
    secret: process.env.JWT_SECRET || 'fallback-secret',
  }),
);

/**
 * POST /api/ai/realtime/subscribe
 * Create a new real-time subscription
 */
app.post('/subscribe', async c => {
  try {
    const requestId = c.req.header('X-Request-ID') || uuidv4();
    const start = Date.now();

    const payload = await c.req.json();
    const { eventTypes, sessionId, includeSystemEvents, heartbeatInterval } = payload;

    // Get user info from JWT token
    const tokenPayload = c.get('jwtPayload');
    const userId = tokenPayload.sub;

    if (!_userId) {
      return c.json(
        {
          success: false,
          error: 'User ID not found in token',
          requestId,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    logger.info('Real-time subscription request', {
      requestId,
      userId,
      sessionId,
      eventTypes,
      timestamp: new Date().toISOString(),
    });

    // Validate input
    if (!eventTypes || !Array.isArray(eventTypes)) {
      return c.json(
        {
          success: false,
          error: 'Event types must be provided as an array',
          requestId,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    // Get AG-UI service instance
    const aguiService = c.get('aguiService') as AguiService;
    if (!aguiService) {
      logger.error('AG-UI service not available', { requestId });
      return c.json(
        {
          success: false,
          error: 'Real-time service not available',
          requestId,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }

    // Create subscription
    const subscription = await aguiService.createRealtimeSubscription(userId, {
      sessionId,
      eventTypes,
      includeSystemEvents,
      heartbeatInterval: heartbeatInterval || 30000,
    });

    logger.info('Real-time subscription created successfully', {
      requestId,
      subscriptionId: subscription.id,
      userId,
      processingTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    return c.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        _userId: subscription.userId,
        sessionId: subscription.sessionId,
        eventTypes: Array.from(subscription.eventTypes),
        isActive: subscription.isActive,
        createdAt: subscription.createdAt,
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    logger.error('Error creating real-time subscription', error, {
      requestId: c.req.header('X-Request-ID'),
    });

    return c.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        requestId: c.req.header('X-Request-ID'),
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

/**
 * DELETE /api/ai/realtime/unsubscribe/:subscriptionId
 * Remove a real-time subscription
 */
app.delete('/unsubscribe/:subscriptionId', async c => {
  try {
    const requestId = c.req.header('X-Request-ID') || uuidv4();
    const subscriptionId = c.req.param('subscriptionId');
    const start = Date.now();

    // Get user info from JWT token
    const tokenPayload = c.get('jwtPayload');
    const userId = tokenPayload.sub;

    if (!_userId) {
      return c.json(
        {
          success: false,
          error: 'User ID not found in token',
          requestId,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    logger.info('Real-time unsubscription request', {
      requestId,
      subscriptionId,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Get AG-UI service instance
    const aguiService = c.get('aguiService') as AguiService;
    if (!aguiService) {
      logger.error('AG-UI service not available', { requestId });
      return c.json(
        {
          success: false,
          error: 'Real-time service not available',
          requestId,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }

    // Remove subscription
    await aguiService.removeRealtimeSubscription(subscriptionId);

    logger.info('Real-time subscription removed successfully', {
      requestId,
      subscriptionId,
      userId,
      processingTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    return c.json({
      success: true,
      data: {
        subscriptionId,
        message: 'Subscription removed successfully',
      },
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    logger.error('Error removing real-time subscription', error, {
      requestId: c.req.header('X-Request-ID'),
      subscriptionId: c.req.param('subscriptionId'),
    });

    return c.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        requestId: c.req.header('X-Request-ID'),
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

/**
 * GET /api/ai/realtime/analytics
 * Get real-time analytics (admin only)
 */
app.get('/analytics', async c => {
  try {
    const requestId = c.req.header('X-Request-ID') || uuidv4();
    const start = Date.now();

    // Get user info from JWT token
    const tokenPayload = c.get('jwtPayload');
    const userId = tokenPayload.sub;
    const userRole = tokenPayload.role;

    // Check admin permissions
    if (!userRole || !['admin', 'service_role'].includes(userRole)) {
      return c.json(
        {
          success: false,
          error: 'Insufficient permissions',
          requestId,
          timestamp: new Date().toISOString(),
        },
        403,
      );
    }

    logger.info('Real-time analytics request', {
      requestId,
      userId,
      userRole,
      timestamp: new Date().toISOString(),
    });

    // Get AG-UI service instance
    const aguiService = c.get('aguiService') as AguiService;
    if (!aguiService) {
      logger.error('AG-UI service not available', { requestId });
      return c.json(
        {
          success: false,
          error: 'Real-time service not available',
          requestId,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }

    // Get analytics
    const analytics = aguiService.getRealtimeAnalytics();

    logger.info('Real-time analytics retrieved successfully', {
      requestId,
      processingTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    return c.json({
      success: true,
      data: analytics,
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    logger.error('Error getting real-time analytics', error, {
      requestId: c.req.header('X-Request-ID'),
    });

    return c.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        requestId: c.req.header('X-Request-ID'),
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

/**
 * GET /api/ai/realtime/subscriptions
 * Get user's active subscriptions
 */
app.get('/subscriptions', async c => {
  try {
    const requestId = c.req.header('X-Request-ID') || uuidv4();
    const start = Date.now();

    // Get user info from JWT token
    const tokenPayload = c.get('jwtPayload');
    const userId = tokenPayload.sub;

    if (!_userId) {
      return c.json(
        {
          success: false,
          error: 'User ID not found in token',
          requestId,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    logger.info('Real-time subscriptions request', {
      requestId,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Get AG-UI service instance
    const aguiService = c.get('aguiService') as AguiService;
    if (!aguiService) {
      logger.error('AG-UI service not available', { requestId });
      return c.json(
        {
          success: false,
          error: 'Real-time service not available',
          requestId,
          timestamp: new Date().toISOString(),
        },
        503,
      );
    }

    // Get user subscriptions
    const subscriptions = aguiService.getUserRealtimeSubscriptions(userId);

    logger.info('Real-time subscriptions retrieved successfully', {
      requestId,
      userId,
      subscriptionCount: subscriptions.length,
      processingTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });

    return c.json({
      success: true,
      data: subscriptions.map(sub => ({
        id: sub.id,
        _userId: sub.userId,
        sessionId: sub.sessionId,
        eventTypes: Array.from(sub.eventTypes),
        isActive: sub.isActive,
        lastActivity: sub.lastActivity,
        createdAt: sub.createdAt,
      })),
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch {
    logger.error('Error getting real-time subscriptions', error, {
      requestId: c.req.header('X-Request-ID'),
    });

    return c.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        requestId: c.req.header('X-Request-ID'),
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

/**
 * Health check endpoint
 */
app.get('/health', c => {
  return c.json({
    status: 'healthy',
    _service: 'realtime-subscriptions',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default app;
