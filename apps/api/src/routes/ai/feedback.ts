import { FeedbackRequest, FeedbackResponse, UserRole } from '@neonpro/types'
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

// Simple in-memory feedback storage (in production, use database)
const feedbackStore = new Map<string, any>()

/**
 * Helper function to validate feedback request
 */
function validateFeedbackRequest(
  body: any,
  _userRole: UserRole,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!body.messageId) {
    errors.push('Message ID is required')
  } else if (
    typeof body.messageId !== 'string' ||
    body.messageId.trim().length === 0
  ) {
    errors.push('Message ID must be a non-empty string')
  }

  if (!body.feedback || typeof body.feedback !== 'object') {
    errors.push('Feedback object is required')
  } else {
    if (!body.feedback.rating || typeof body.feedback.rating !== 'number') {
      errors.push('Rating is required and must be a number')
    } else if (body.feedback.rating < 1 || body.feedback.rating > 5) {
      errors.push('Rating must be between 1 and 5')
    }

    if (body.feedback.comment && typeof body.feedback.comment !== 'string') {
      errors.push('Comment must be a string')
    } else if (body.feedback.comment && body.feedback.comment.length > 1000) {
      errors.push('Comment must be less than 1000 characters')
    }

    if (
      body.feedback.helpful !== undefined &&
      typeof body.feedback.helpful !== 'boolean'
    ) {
      errors.push('Helpful flag must be a boolean')
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Helper function to log feedback for analytics
 */
async function logFeedbackForAnalytics(
  sessionId: string,
  messageId: string,
  _userId: string,
  userRole: UserRole,
  feedback: FeedbackRequest['feedback'],
): Promise<void> {
  try {
    // In production, this would store to your analytics database
    const feedbackData = {
      id: crypto.randomUUID(),
      sessionId,
      messageId,
      userId,
      userRole,
      rating: feedback.rating,
      comment: feedback.comment || null,
      helpful: feedback.helpful ?? null,
      timestamp: new Date().toISOString(),
      userAgent: '', // Would extract from request headers
    }

    feedbackStore.set(feedbackData.id, feedbackData)

    console.warn('Feedback logged:', {
      sessionId,
      messageId,
      userId,
      rating: feedback.rating,
      helpful: feedback.helpful,
    })
  } catch {
    console.error('Failed to log feedback for analytics:', error)
    // Don't throw - feedback logging failures shouldn't block the user experience
  }
}

/**
 * Helper function to trigger feedback-based improvements
 */
async function triggerFeedbackImprovements(
  feedback: FeedbackRequest['feedback'],
  queryContext?: any,
): Promise<void> {
  // Low ratings trigger improvement alerts
  if (feedback.rating <= 2) {
    console.warn('Low rating detected - triggering improvement analysis:', {
      rating: feedback.rating,
      comment: feedback.comment,
      _context: queryContext,
    })

    // In production, this could:
    // 1. Send alerts to the development team
    // 2. Trigger model retraining
    // 3. Update intent recognition patterns
    // 4. Improve response formatting
  }

  // Unhelpful responses with comments trigger specific analysis
  if (feedback.helpful === false && feedback.comment) {
    console.warn(
      'Unhelpful response with comment - analyzing for improvements:',
      {
        comment: feedback.comment,
        _context: queryContext,
      },
    )

    // In production, this could:
    // 1. Analyze comment content with NLP
    // 2. Categorize the type of issue
    // 3. Update response templates
    // 4. Improve intent parsing
  }
}

/**
 * POST /api/ai/sessions/:sessionId/feedback
 * Submit feedback for agent responses
 */
app.post('/ai/sessions/:sessionId/feedback', async c => {
  try {
    const sessionId = c.req.param('sessionId')
    const payload = c.get('jwtPayload')

    // Parse and validate request
    const body = (await c.req.json()) as FeedbackRequest
    const userRole = payload.role as UserRole

    // Validate feedback structure
    const validation = validateFeedbackRequest(body, userRole)
    if (!validation.valid) {
      return c.json(
        {
          error: {
            code: 'INVALID_FEEDBACK',
            message: 'Invalid feedback request',
            details: validation.errors,
          },
        },
        400,
      )
    }

    // Validate user can access this session
    if (!payload.sub) {
      return c.json(
        {
          error: {
            code: 'INVALID_USER',
            message: 'Invalid user token',
          },
        },
        401,
      )
    }

    // Log feedback for analytics
    await logFeedbackForAnalytics(
      sessionId,
      body.messageId,
      payload.sub,
      userRole,
      body.feedback,
    )

    // Trigger improvement processes based on feedback
    await triggerFeedbackImprovements(body.feedback)

    // Prepare success response
    const response: FeedbackResponse = {
      success: true,
      message: 'Feedback recebido com sucesso. Obrigado por nos ajudar a melhorar!',
      feedbackId: crypto.randomUUID(),
    }

    return c.json(response, 200)
  } catch {
    console.error('Feedback endpoint error:', error)

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit feedback',
        },
      },
      500,
    )
  }
})

/**
 * GET /api/ai/sessions/:sessionId/feedback/stats
 * Get feedback statistics for a session (admin only)
 */
app.get('/ai/sessions/:sessionId/feedback/stats', async c => {
  try {
    const sessionId = c.req.param('sessionId')
    const payload = c.get('jwtPayload')
    const userRole = payload.role as UserRole

    // Only admins can view feedback statistics
    if (userRole !== 'admin') {
      return c.json(
        {
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required to view feedback statistics',
          },
        },
        403,
      )
    }

    // Calculate feedback statistics for the session
    const sessionFeedback = Array.from(feedbackStore.values()).filter(
      (feedback: any) => feedback.sessionId === sessionId,
    )

    if (sessionFeedback.length === 0) {
      return c.json(
        {
          sessionId,
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {},
          helpfulPercentage: 0,
          recentComments: [],
        },
        200,
      )
    }

    const totalFeedback = sessionFeedback.length
    const averageRating = sessionFeedback.reduce((sum, _f) => sum + f.rating, 0) / totalFeedback

    const ratingDistribution = sessionFeedback.reduce(
      (acc, _f) => {
        acc[f.rating] = (acc[f.rating] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const helpfulResponses = sessionFeedback.filter(
      f => f.helpful === true,
    ).length
    const helpfulPercentage = totalFeedback > 0 ? (helpfulResponses / totalFeedback) * 100 : 0

    const recentComments = sessionFeedback
      .filter(f => f.comment)
      .slice(-5) // Last 5 comments
      .map(f => ({
        rating: f.rating,
        comment: f.comment,
        timestamp: f.timestamp,
      }))

    return c.json(
      {
        sessionId,
        totalFeedback,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        helpfulPercentage: Math.round(helpfulPercentage * 100) / 100,
        recentComments,
      },
      200,
    )
  } catch {
    console.error('Feedback stats endpoint error:', error)

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve feedback statistics',
        },
      },
      500,
    )
  }
})

/**
 * GET /api/ai/feedback/admin/overview
 * Get system-wide feedback overview (admin only)
 */
app.get('/ai/feedback/admin/overview', async c => {
  try {
    const payload = c.get('jwtPayload')
    const userRole = payload.role as UserRole

    // Only admins can view system-wide feedback
    if (userRole !== 'admin') {
      return c.json(
        {
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required to view feedback overview',
          },
        },
        403,
      )
    }

    const allFeedback = Array.from(feedbackStore.values())

    if (allFeedback.length === 0) {
      return c.json(
        {
          totalFeedback: 0,
          averageRating: 0,
          ratingDistribution: {},
          helpfulPercentage: 0,
          topIssues: [],
          recentActivity: [],
        },
        200,
      )
    }

    const totalFeedback = allFeedback.length
    const averageRating = allFeedback.reduce((sum, _f) => sum + f.rating, 0) / totalFeedback

    const ratingDistribution = allFeedback.reduce(
      (acc, _f) => {
        acc[f.rating] = (acc[f.rating] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const helpfulResponses = allFeedback.filter(
      f => f.helpful === true,
    ).length
    const helpfulPercentage = totalFeedback > 0 ? (helpfulResponses / totalFeedback) * 100 : 0

    // Identify top issues from low ratings and comments
    const lowRatings = allFeedback.filter(f => f.rating <= 2 && f.comment)
    const topIssues = lowRatings
      .map(f => ({
        comment: f.comment,
        rating: f.rating,
        sessionId: f.sessionId,
        timestamp: f.timestamp,
      }))
      .slice(-10) // Last 10 issues

    // Recent activity
    const recentActivity = allFeedback
      .sort(
        (a, _b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(-10)
      .map(f => ({
        rating: f.rating,
        helpful: f.helpful,
        timestamp: f.timestamp,
        userRole: f.userRole,
      }))

    return c.json(
      {
        totalFeedback,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution,
        helpfulPercentage: Math.round(helpfulPercentage * 100) / 100,
        topIssues,
        recentActivity,
      },
      200,
    )
  } catch {
    console.error('Feedback overview endpoint error:', error)

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve feedback overview',
        },
      },
      500,
    )
  }
})

/**
 * Health check endpoint
 */
app.get('/ai/feedback/health', async c => {
  try {
    const totalFeedback = feedbackStore.size
    const recentFeedback = Array.from(feedbackStore.values()).filter(f => {
      const feedbackTime = new Date(f.timestamp).getTime()
      const hourAgo = Date.now() - 60 * 60 * 1000
      return feedbackTime > hourAgo
    }).length

    return c.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        feedback: {
          total: totalFeedback,
          recentLastHour: recentFeedback,
        },
        store: {
          type: 'memory',
          entries: totalFeedback,
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

export const POST = handle(app)
