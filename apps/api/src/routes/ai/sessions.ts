import { ChatMessage, ChatSession, SessionResponse, UserRole } from '@neonpro/types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { handle } from 'hono/vercel'

// Create Hono app for Vercel deployment
const app = new Hono().basePath('/api')

// Enable CORS for frontend integration
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  }),
)

// JWT middleware for authentication
app.use('*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: process.env.JWT_SECRET!,
  })
  return jwtMiddleware(c, next)
})

// Simple in-memory session storage (in production, use Redis or database)
const sessionStore = new Map<string, ChatSession>()

/**
 * Helper function to validate user permissions
 */
function validateUserSession(
  _payload: any,
  sessionId: string,
): { valid: boolean; error?: string } {
  if (!payload.sub) {
    return { valid: false, error: 'Invalid user token' }
  }

  if (!sessionId) {
    return { valid: false, error: 'Session ID is required' }
  }

  const session = sessionStore.get(sessionId)
  if (!session) {
    return { valid: false, error: 'Session not found' }
  }

  if (session.userId !== payload.sub) {
    return { valid: false, error: 'Session does not belong to current user' }
  }

  if (session.status === 'terminated') {
    return { valid: false, error: 'Session has been terminated' }
  }

  // Check session expiration (30 minutes of inactivity)
  const now = new Date()
  const lastActivity = new Date(session.lastActivity)
  const inactiveTime = now.getTime() - lastActivity.getTime()

  if (inactiveTime > 30 * 60 * 1000) {
    // 30 minutes
    session.status = 'expired'
    sessionStore.set(sessionId, session)
    return { valid: false, error: 'Session has expired' }
  }

  return { valid: true }
}

/**
 * GET /api/ai/sessions/:sessionId
 * Retrieve conversation session data
 */
app.get('/ai/sessions/:sessionId', async c => {
  try {
    const sessionId = c.req.param('sessionId')
    const payload = c.get('jwtPayload')

    // Validate session access
    const validation = validateUserSession(payload, sessionId)
    if (!validation.valid) {
      return c.json(
        {
          error: {
            code: 'SESSION_INVALID',
            message: validation.error || 'Invalid session',
          },
        },
        validation.error?.includes('not found') ? 404 : 401,
      )
    }

    const session = sessionStore.get(sessionId)!

    // Update last activity timestamp
    session.lastActivity = new Date()
    sessionStore.set(sessionId, session)

    // Format response
    const response: SessionResponse = {
      sessionId: session.id,
      _userId: session.userId,
      status: session.status,
      messages: session.context.recentMessages || [],
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount,
    }

    return c.json(response, 200)
  } catch {
    console.error('Session endpoint error:', error)

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve session data',
        },
      },
      500,
    )
  }
})

/**
 * Helper function to create a new session
 */
export function createSession(
  _userId: string,
  userRole: UserRole,
  domain: string,
): ChatSession {
  const sessionId = crypto.randomUUID()
  const now = new Date()

  const session: ChatSession = {
    id: sessionId,
    userId,
    status: 'active',
    createdAt: now,
    lastActivity: now,
    _context: {
      domain,
      _role: userRole,
      preferences: {},
      recentIntents: [],
      cachedData: {},
    },
    messageCount: 0,
  }

  sessionStore.set(sessionId, session)
  return session
}

/**
 * Helper function to add a message to a session
 */
export function addMessageToSession(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>,
): ChatMessage | null {
  const session = sessionStore.get(sessionId)
  if (!session) {
    return null
  }

  const fullMessage: ChatMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  }

  // Add to recent messages (keep last 10 for _context)
  if (!session.context.recentMessages) {
    session.context.recentMessages = []
  }

  session.context.recentMessages.push(fullMessage)
  if (session.context.recentMessages.length > 10) {
    session.context.recentMessages.shift()
  }

  // Update session metadata
  session.lastActivity = new Date()
  session.messageCount++

  sessionStore.set(sessionId, session)
  return fullMessage
}

/**
 * Helper function to update session context
 */
export function updateSessionContext(
  sessionId: string,
  _context: Partial<ChatSession['context']>,
): boolean {
  const session = sessionStore.get(sessionId)
  if (!session) {
    return false
  }

  session.context = {
    ...session.context,
    ...context,
  }

  session.lastActivity = new Date()
  sessionStore.set(sessionId, session)
  return true
}

/**
 * Helper function to terminate a session
 */
export function terminateSession(sessionId: string): boolean {
  const session = sessionStore.get(sessionId)
  if (!session) {
    return false
  }

  session.status = 'terminated'
  session.lastActivity = new Date()
  sessionStore.set(sessionId, session)
  return true
}

/**
 * Cleanup expired sessions (call this periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = new Date()
  const expirationThreshold = 30 * 60 * 1000 // 30 minutes

  for (const [sessionId, session] of sessionStore.entries()) {
    const lastActivity = new Date(session.lastActivity)
    const inactiveTime = now.getTime() - lastActivity.getTime()

    if (inactiveTime > expirationThreshold) {
      session.status = 'expired'
      sessionStore.set(sessionId, session)
    }
  }
}

/**
 * Health check endpoint
 */
app.get('/ai/sessions/health', async c => {
  try {
    const activeSessions = Array.from(sessionStore.values()).filter(
      s => s.status === 'active',
    ).length

    const totalSessions = sessionStore.size

    return c.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        sessions: {
          active: activeSessions,
          total: totalSessions,
        },
        store: {
          type: 'memory',
          entries: totalSessions,
        },
      },
      200,
    )
  } catch {
    return c.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    )
  }
})

export const GET = handle(app)
