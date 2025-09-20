/**
 * AI Agent Feedback API Endpoint
 * Handles user feedback collection for conversation quality and improvement
 */

import { validator } from '@hono/zod-validator';
import { safeValidate } from '@neonpro/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

// Initialize Hono app
const app = new Hono<{
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
  };
  Variables: {
    user: {
      id: string;
      role: string;
      domain?: string;
    };
  };
}>();

// Middleware
app.use(
  '*',
  cors({
    origin: origin => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://neonpro.app',
      ];
      return allowedOrigins.includes(origin) || origin === undefined;
    },
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Initialize Supabase client
let supabaseClient: SupabaseClient;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }
  return supabaseClient;
}

// =====================================
// Feedback Schema
// =====================================

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  category: z.enum([
    'accuracy',
    'helpfulness',
    'speed',
    'completeness',
    'clarity',
    'general',
  ]).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.object({
    queryIntent: z.string().optional(),
    resultCount: z.number().optional(),
    processingTime: z.number().optional(),
    userAgent: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  }).optional(),
});

const FeedbackSummarySchema = z.object({
  messageId: z.string().optional(),
  responseId: z.string().optional(),
  helpful: z.boolean(),
  issues: z.array(z.enum([
    'incorrect_data',
    'slow_response',
    'unclear_answer',
    'missing_information',
    'technical_error',
    'other',
  ])).optional(),
  suggestions: z.string().optional(),
});

type Feedback = z.infer<typeof FeedbackSchema>;
type FeedbackSummary = z.infer<typeof FeedbackSummarySchema>;

// =====================================
// Feedback Endpoints
// =====================================

/**
 * POST /api/ai/sessions/{sessionId}/feedback
 * Submit detailed feedback for a conversation session
 */
app.post(
  '/api/ai/sessions/:sessionId/feedback',
  validator('json', (value, c) => {
    const result = safeValidate(FeedbackSchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid feedback data: ${result.error.message}`,
        cause: result.error,
      });
    }
    return result.data;
  }),
  async c => {
    try {
      const sessionId = c.req.param('sessionId');
      const user = c.get('user');
      
      if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
      }

      if (!sessionId) {
        throw new HTTPException(400, { message: 'Session ID is required' });
      }

      const feedback: Feedback = c.req.valid('json');
      const supabase = getSupabaseClient();

      // Verify session exists and belongs to user
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_sessions')
        .select('id, domain')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          throw new HTTPException(404, { message: 'Session not found' });
        }
        console.error('Database error verifying session:', sessionError);
        throw new HTTPException(500, { 
          message: 'Failed to verify session',
          cause: sessionError 
        });
      }

      const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Insert feedback
      const { data, error } = await supabase
        .from('ai_feedback')
        .insert({
          id: feedbackId,
          session_id: sessionId,
          user_id: user.id,
          domain: sessionData.domain,
          rating: feedback.rating,
          comment: feedback.comment,
          category: feedback.category || 'general',
          tags: feedback.tags || [],
          metadata: {
            ...feedback.metadata,
            userRole: user.role,
            submittedAt: now,
          },
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error submitting feedback:', error);
        throw new HTTPException(500, { 
          message: 'Failed to submit feedback',
          cause: error 
        });
      }

      // Update session with feedback flag
      await supabase
        .from('ai_sessions')
        .update({ 
          updated_at: now,
          metadata: { 
            ...sessionData.metadata,
            hasFeedback: true,
            lastFeedbackAt: now,
          },
        })
        .eq('id', sessionId);

      return c.json({
        success: true,
        feedback: {
          id: data.id,
          sessionId: data.session_id,
          rating: data.rating,
          category: data.category,
          submittedAt: data.created_at,
        },
        message: 'Feedback submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: 'Internal error submitting feedback',
      });
    }
  },
);

/**
 * POST /api/ai/sessions/{sessionId}/feedback/quick
 * Submit quick thumbs up/down feedback with optional issues
 */
app.post(
  '/api/ai/sessions/:sessionId/feedback/quick',
  validator('json', (value, c) => {
    const result = safeValidate(FeedbackSummarySchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid quick feedback data: ${result.error.message}`,
        cause: result.error,
      });
    }
    return result.data;
  }),
  async c => {
    try {
      const sessionId = c.req.param('sessionId');
      const user = c.get('user');
      
      if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
      }

      if (!sessionId) {
        throw new HTTPException(400, { message: 'Session ID is required' });
      }

      const quickFeedback: FeedbackSummary = c.req.valid('json');
      const supabase = getSupabaseClient();

      // Verify session exists and belongs to user
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_sessions')
        .select('id, domain')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (sessionError) {
        if (sessionError.code === 'PGRST116') {
          throw new HTTPException(404, { message: 'Session not found' });
        }
        console.error('Database error verifying session:', sessionError);
        throw new HTTPException(500, { 
          message: 'Failed to verify session',
          cause: sessionError 
        });
      }

      const feedbackId = `quick_feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Convert quick feedback to standard feedback format
      const standardFeedback = {
        id: feedbackId,
        session_id: sessionId,
        user_id: user.id,
        domain: sessionData.domain,
        rating: quickFeedback.helpful ? 4 : 2, // Helpful = 4, Not helpful = 2
        comment: quickFeedback.suggestions,
        category: 'general',
        tags: quickFeedback.issues || [],
        metadata: {
          type: 'quick_feedback',
          messageId: quickFeedback.messageId,
          responseId: quickFeedback.responseId,
          helpful: quickFeedback.helpful,
          userRole: user.role,
          submittedAt: now,
        },
        created_at: now,
      };

      // Insert feedback
      const { data, error } = await supabase
        .from('ai_feedback')
        .insert(standardFeedback)
        .select()
        .single();

      if (error) {
        console.error('Database error submitting quick feedback:', error);
        throw new HTTPException(500, { 
          message: 'Failed to submit quick feedback',
          cause: error 
        });
      }

      return c.json({
        success: true,
        feedback: {
          id: data.id,
          sessionId: data.session_id,
          helpful: quickFeedback.helpful,
          submittedAt: data.created_at,
        },
        message: 'Quick feedback submitted successfully',
      });
    } catch (error) {
      console.error('Error submitting quick feedback:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: 'Internal error submitting quick feedback',
      });
    }
  },
);

/**
 * GET /api/ai/sessions/{sessionId}/feedback
 * Get feedback summary for a session (admin/analytics use)
 */
app.get('/api/ai/sessions/:sessionId/feedback', async c => {
  try {
    const sessionId = c.req.param('sessionId');
    const user = c.get('user');
    
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    // Only allow admins or the session owner to view feedback
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      // Verify session belongs to user
      const supabase = getSupabaseClient();
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError || sessionData.user_id !== user.id) {
        throw new HTTPException(403, { message: 'Access denied' });
      }
    }

    const supabase = getSupabaseClient();

    // Get all feedback for this session
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Database error fetching feedback:', feedbackError);
      throw new HTTPException(500, { 
        message: 'Failed to fetch feedback',
        cause: feedbackError 
      });
    }

    const feedback = feedbackData || [];

    // Calculate summary statistics
    const summary = {
      totalFeedback: feedback.length,
      averageRating: feedback.length > 0 
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
        : 0,
      positiveCount: feedback.filter(f => f.rating >= 4).length,
      negativeCount: feedback.filter(f => f.rating <= 2).length,
      categories: [...new Set(feedback.map(f => f.category))],
      commonIssues: getCommonIssues(feedback),
      latestFeedback: feedback[0]?.created_at,
    };

    return c.json({
      success: true,
      summary,
      feedback: feedback.map(f => ({
        id: f.id,
        rating: f.rating,
        category: f.category,
        comment: f.comment,
        tags: f.tags,
        createdAt: f.created_at,
        metadata: f.metadata,
      })),
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Internal error fetching feedback',
    });
  }
});

/**
 * GET /api/ai/feedback/analytics
 * Get system-wide feedback analytics (admin only)
 */
app.get('/api/ai/feedback/analytics', async c => {
  try {
    const user = c.get('user');
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw new HTTPException(403, { message: 'Admin access required' });
    }

    const supabase = getSupabaseClient();

    // Get feedback from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: feedbackData, error: feedbackError } = await supabase
      .from('ai_feedback')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Database error fetching analytics:', feedbackError);
      throw new HTTPException(500, { 
        message: 'Failed to fetch analytics',
        cause: feedbackError 
      });
    }

    const feedback = feedbackData || [];

    const analytics = {
      period: '30 days',
      totalFeedback: feedback.length,
      averageRating: feedback.length > 0 
        ? Math.round((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length) * 100) / 100
        : 0,
      satisfactionRate: feedback.length > 0 
        ? Math.round((feedback.filter(f => f.rating >= 4).length / feedback.length) * 100)
        : 0,
      byCategory: getCategoryBreakdown(feedback),
      byRating: getRatingDistribution(feedback),
      commonIssues: getCommonIssues(feedback),
      trends: getTrends(feedback),
      suggestions: feedback
        .filter(f => f.comment && f.comment.trim())
        .slice(0, 10)
        .map(f => ({
          rating: f.rating,
          comment: f.comment,
          category: f.category,
          createdAt: f.created_at,
        })),
    };

    return c.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Internal error fetching analytics',
    });
  }
});

// =====================================
// Helper Functions
// =====================================

function getCommonIssues(feedback: any[]): Array<{issue: string; count: number}> {
  const issueCount = new Map<string, number>();
  
  feedback.forEach(f => {
    if (f.tags && Array.isArray(f.tags)) {
      f.tags.forEach((tag: string) => {
        issueCount.set(tag, (issueCount.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(issueCount.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getCategoryBreakdown(feedback: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  feedback.forEach(f => {
    const category = f.category || 'general';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });

  return breakdown;
}

function getRatingDistribution(feedback: any[]): Record<string, number> {
  const distribution: Record<string, number> = {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0,
  };
  
  feedback.forEach(f => {
    const rating = f.rating.toString();
    if (distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  return distribution;
}

function getTrends(feedback: any[]): {
  weeklyAverage: number;
  isImproving: boolean;
  changePercent: number;
} {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = feedback.filter(f => new Date(f.created_at) >= oneWeekAgo);
  const lastWeek = feedback.filter(f => {
    const date = new Date(f.created_at);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });

  const thisWeekAvg = thisWeek.length > 0 
    ? thisWeek.reduce((sum, f) => sum + f.rating, 0) / thisWeek.length 
    : 0;
  
  const lastWeekAvg = lastWeek.length > 0 
    ? lastWeek.reduce((sum, f) => sum + f.rating, 0) / lastWeek.length 
    : 0;

  const changePercent = lastWeekAvg > 0 
    ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
    : 0;

  return {
    weeklyAverage: Math.round(thisWeekAvg * 100) / 100,
    isImproving: thisWeekAvg > lastWeekAvg,
    changePercent,
  };
}

// Health check endpoint
app.get('/api/ai/feedback/health', async c => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ai_feedback')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    const isHealthy = !error;

    return c.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'ai-feedback',
      },
      isHealthy ? 200 : 503,
    );
  } catch (error) {
    console.error('Health check error:', error);
    return c.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'ai-feedback',
        error: 'Health check failed',
      },
      503,
    );
  }
});

export default app;