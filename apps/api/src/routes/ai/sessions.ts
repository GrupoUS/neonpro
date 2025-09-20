/**
 * AI Agent Sessions API Endpoint
 * Handles session management and conversation history using Hono.js
 */

import { validator } from '@hono/zod-validator';
import {
  AgentError,
  ChatMessage,
  ChatState,
  safeValidate,
} from '@neonpro/types';
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
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
// Session Management Schema
// =====================================

const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  domain: z.string().optional(),
  title: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

const MessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime(),
  data: z.any().optional(),
  actions: z.array(z.any()).optional(),
});

type Session = z.infer<typeof SessionSchema>;
type Message = z.infer<typeof MessageSchema>;

// =====================================
// Sessions Endpoints
// =====================================

/**
 * GET /api/ai/sessions
 * Get all sessions for the current user
 */
app.get('/api/ai/sessions', async c => {
  try {
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('ai_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(50);

    // Apply domain filter if specified
    if (user.domain) {
      query = query.eq('domain', user.domain);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error fetching sessions:', error);
      throw new HTTPException(500, { 
        message: 'Failed to fetch sessions',
        cause: error 
      });
    }

    const sessions: Session[] = (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      domain: row.domain,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isActive: row.is_active,
      metadata: row.metadata,
    }));

    return c.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Internal error fetching sessions',
    });
  }
});

/**
 * GET /api/ai/sessions/{sessionId}
 * Get specific session with conversation history
 */
app.get('/api/ai/sessions/:sessionId', async c => {
  try {
    const sessionId = c.req.param('sessionId');
    const user = c.get('user');
    
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    if (!sessionId) {
      throw new HTTPException(400, { message: 'Session ID is required' });
    }

    const supabase = getSupabaseClient();

    // Get session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        throw new HTTPException(404, { message: 'Session not found' });
      }
      console.error('Database error fetching session:', sessionError);
      throw new HTTPException(500, { 
        message: 'Failed to fetch session',
        cause: sessionError 
      });
    }

    // Get conversation history
    const { data: messagesData, error: messagesError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(100);

    if (messagesError) {
      console.error('Database error fetching messages:', messagesError);
      throw new HTTPException(500, { 
        message: 'Failed to fetch conversation history',
        cause: messagesError 
      });
    }

    const session: Session = {
      id: sessionData.id,
      userId: sessionData.user_id,
      domain: sessionData.domain,
      title: sessionData.title,
      createdAt: sessionData.created_at,
      updatedAt: sessionData.updated_at,
      isActive: sessionData.is_active,
      metadata: sessionData.metadata,
    };

    const messages: ChatMessage[] = (messagesData || []).map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      data: msg.data,
      actions: msg.actions,
    }));

    const chatState: ChatState = {
      messages,
      isLoading: false,
      context: {
        userId: user.id,
        userRole: user.role,
        domain: user.domain,
      },
    };

    return c.json({
      success: true,
      session,
      chatState,
      messageCount: messages.length,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Internal error fetching session',
    });
  }
});

/**
 * POST /api/ai/sessions
 * Create a new conversation session
 */
app.post(
  '/api/ai/sessions',
  validator('json', (value, c) => {
    const CreateSessionSchema = z.object({
      title: z.string().optional(),
      domain: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = safeValidate(CreateSessionSchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid request: ${result.error.message}`,
        cause: result.error,
      });
    }
    return result.data;
  }),
  async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Unauthorized' });
      }

      const request = c.req.valid('json');
      const supabase = getSupabaseClient();

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('ai_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          domain: request.domain || user.domain,
          title: request.title || 'Nova Conversa',
          created_at: now,
          updated_at: now,
          is_active: true,
          metadata: request.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating session:', error);
        throw new HTTPException(500, { 
          message: 'Failed to create session',
          cause: error 
        });
      }

      const session: Session = {
        id: data.id,
        userId: data.user_id,
        domain: data.domain,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isActive: data.is_active,
        metadata: data.metadata,
      };

      return c.json({
        success: true,
        session,
      });
    } catch (error) {
      console.error('Error creating session:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: 'Internal error creating session',
      });
    }
  },
);

/**
 * PUT /api/ai/sessions/{sessionId}
 * Update session details
 */
app.put(
  '/api/ai/sessions/:sessionId',
  validator('json', (value, c) => {
    const UpdateSessionSchema = z.object({
      title: z.string().optional(),
      isActive: z.boolean().optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = safeValidate(UpdateSessionSchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid request: ${result.error.message}`,
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

      const request = c.req.valid('json');
      const supabase = getSupabaseClient();

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (request.title !== undefined) {
        updateData.title = request.title;
      }
      if (request.isActive !== undefined) {
        updateData.is_active = request.isActive;
      }
      if (request.metadata !== undefined) {
        updateData.metadata = request.metadata;
      }

      const { data, error } = await supabase
        .from('ai_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HTTPException(404, { message: 'Session not found' });
        }
        console.error('Database error updating session:', error);
        throw new HTTPException(500, { 
          message: 'Failed to update session',
          cause: error 
        });
      }

      const session: Session = {
        id: data.id,
        userId: data.user_id,
        domain: data.domain,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isActive: data.is_active,
        metadata: data.metadata,
      };

      return c.json({
        success: true,
        session,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: 'Internal error updating session',
      });
    }
  },
);

/**
 * DELETE /api/ai/sessions/{sessionId}
 * Soft delete a session (mark as inactive)
 */
app.delete('/api/ai/sessions/:sessionId', async c => {
  try {
    const sessionId = c.req.param('sessionId');
    const user = c.get('user');
    
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    if (!sessionId) {
      throw new HTTPException(400, { message: 'Session ID is required' });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('ai_sessions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error deleting session:', error);
      throw new HTTPException(500, { 
        message: 'Failed to delete session',
        cause: error 
      });
    }

    return c.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, {
      message: 'Internal error deleting session',
    });
  }
});

// =====================================
// Message Management
// =====================================

/**
 * POST /api/ai/sessions/{sessionId}/messages
 * Add a new message to the conversation
 */
app.post(
  '/api/ai/sessions/:sessionId/messages',
  validator('json', (value, c) => {
    const AddMessageSchema = z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
      data: z.any().optional(),
      actions: z.array(z.any()).optional(),
    });
    
    const result = safeValidate(AddMessageSchema, value);
    if (!result.success) {
      throw new HTTPException(400, {
        message: `Invalid request: ${result.error.message}`,
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

      const request = c.req.valid('json');
      const supabase = getSupabaseClient();

      // Verify session exists and belongs to user
      const { data: sessionData, error: sessionError } = await supabase
        .from('ai_sessions')
        .select('id')
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

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      // Insert message
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role: request.role,
          content: request.content,
          timestamp: now,
          data: request.data,
          actions: request.actions,
        })
        .select()
        .single();

      if (error) {
        console.error('Database error adding message:', error);
        throw new HTTPException(500, { 
          message: 'Failed to add message',
          cause: error 
        });
      }

      // Update session timestamp
      await supabase
        .from('ai_sessions')
        .update({ updated_at: now })
        .eq('id', sessionId);

      const message: ChatMessage = {
        id: data.id,
        role: data.role,
        content: data.content,
        timestamp: data.timestamp,
        data: data.data,
        actions: data.actions,
      };

      return c.json({
        success: true,
        message,
      });
    } catch (error) {
      console.error('Error adding message:', error);
      
      if (error instanceof HTTPException) {
        throw error;
      }

      throw new HTTPException(500, {
        message: 'Internal error adding message',
      });
    }
  },
);

// Health check endpoint
app.get('/api/ai/sessions/health', async c => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ai_sessions')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    const isHealthy = !error;

    return c.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'ai-sessions',
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
        service: 'ai-sessions',
        error: 'Health check failed',
      },
      503,
    );
  }
});

export default app;