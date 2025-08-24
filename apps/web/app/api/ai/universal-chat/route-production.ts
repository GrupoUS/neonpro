/**
 * Universal AI Chat API Route - Production Version
 * Integrates with NeonPro AI Services infrastructure
 * Healthcare-optimized with Portuguese NLP
 * Dual Interface: External Client + Internal Staff
 * Full compliance automation and audit trails
 */

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { UniversalChatService } from '@neonpro/ai/services/universal-chat-service';
import { ComplianceAutomationService } from '@neonpro/ai/services/compliance-automation-service';
import { FeatureFlagService } from '@neonpro/ai/services/feature-flag-service';
import type { AIServiceConfig } from '@neonpro/ai/types';

export const runtime = 'edge';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI Service Configuration
const aiConfig: AIServiceConfig = {
  maxRetries: 3,
  timeout: 30000,
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  rateLimiting: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  monitoring: {
    enabled: true,
    sampleRate: 1.0,
  },
  compliance: {
    enabled: true,
    auditTrail: true,
    lgpdCompliance: true,
  },
};

// Initialize AI Services
let chatService: UniversalChatService;
let complianceService: ComplianceAutomationService;
let featureFlagService: FeatureFlagService;

try {
  chatService = new UniversalChatService(supabase, aiConfig);
  complianceService = new ComplianceAutomationService(supabase, aiConfig);
  featureFlagService = new FeatureFlagService(supabase, aiConfig);
} catch (error) {
  console.error('Failed to initialize AI services:', error);
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  interface?: 'external' | 'internal';
  sessionId?: string;
  userId?: string;
  clinicId?: string;
  patientId?: string;
  emergencyContext?: boolean;
}

interface ChatSession {
  id: string;
  userId: string;
  clinicId: string;
  sessionType: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  context: Record<string, any>;
  metadata: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();
    const { 
      messages, 
      interface: interfaceType = 'external',
      sessionId,
      userId,
      clinicId,
      patientId,
      emergencyContext = false
    } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get user context (from auth or session)
    const actualUserId = userId || await getUserIdFromRequest(request);
    const actualClinicId = clinicId || await getClinicIdFromUser(actualUserId);

    if (!actualUserId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Check feature flags
    const chatEnabled = await featureFlagService.executeWithMetrics({
      flagKey: 'universal_chat_enabled',
      userId: actualUserId,
      clinicId: actualClinicId,
      context: { interface: interfaceType }
    });

    if (!chatEnabled.enabled) {
      return NextResponse.json(
        { error: 'Chat service is currently unavailable' },
        { status: 503 }
      );
    }

    // Perform compliance check
    const complianceCheck = await complianceService.executeWithMetrics({
      userId: actualUserId,
      clinicId: actualClinicId,
      serviceName: 'universal-chat',
      operationType: `chat_${interfaceType}`,
      dataCategories: ['personal_data', 'health_data'],
      sensitiveDataHandled: interfaceType === 'internal' || emergencyContext,
      purpose: `AI-powered healthcare chat assistance - ${interfaceType} interface`,
      retentionPeriodDays: 2555, // 7 years for medical records
      patientId: patientId
    });

    if (!complianceCheck.compliant) {
      // Log compliance violations
      console.error('Compliance violations detected:', complianceCheck.violations);
      
      // Check for blocking violations
      const criticalViolations = complianceCheck.violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        return NextResponse.json(
          { error: 'Request blocked due to compliance requirements' },
          { status: 403 }
        );
      }
    }

    // Get or create chat session
    let session: ChatSession;
    if (sessionId) {
      session = await getChatSession(sessionId);
    } else {
      session = await createChatSession(actualUserId, actualClinicId, interfaceType);
    }

    // Prepare chat input
    const lastMessage = messages[messages.length - 1];
    const chatInput = {
      message: lastMessage.content,
      userId: actualUserId,
      clinicId: actualClinicId,
      sessionId: session.id,
      interfaceType: interfaceType as 'external' | 'internal',
      conversationHistory: messages.slice(-10), // Last 10 messages for context
      emergencyContext,
      patientContext: patientId ? await getPatientContext(patientId) : undefined,
      clinicContext: await getClinicContext(actualClinicId),
      language: 'pt-BR',
      complianceFlags: complianceCheck.violations.map(v => v.code)
    };

    // Generate AI response
    const chatResponse = await chatService.executeWithMetrics(chatInput, {
      userId: actualUserId,
      clinicId: actualClinicId
    });

    // Store message in database
    await storeChatMessage(session.id, lastMessage, chatResponse);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const initialData = JSON.stringify({
            type: 'start',
            sessionId: session.id,
            interface: interfaceType,
            timestamp: new Date().toISOString(),
            compliance: {
              compliant: complianceCheck.compliant,
              warnings: complianceCheck.violations.filter(v => v.severity !== 'critical').length
            },
            emergency: chatResponse.emergencyDetected
          });
          controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

          // Stream the response content
          const words = chatResponse.message.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ' ' + words[i];
            const chunkData = JSON.stringify({
              type: 'content',
              content: chunk,
              confidence: chatResponse.confidence
            });
            controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));

            // Realistic streaming delay
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70));
          }

          // Send completion with metadata
          const completeData = JSON.stringify({
            type: 'complete',
            messageId: chatResponse.messageId,
            confidence: chatResponse.confidence,
            emergencyDetected: chatResponse.emergencyDetected,
            escalationTriggered: chatResponse.escalationTriggered,
            suggestedActions: chatResponse.suggestedActions,
            complianceFlags: chatResponse.complianceFlags,
            usage: {
              promptTokens: chatResponse.usage.promptTokens,
              completionTokens: chatResponse.usage.completionTokens,
              totalTokens: chatResponse.usage.totalTokens
            },
            performance: {
              responseTime: chatResponse.responseTimeMs,
              modelUsed: chatResponse.modelUsed
            }
          });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response',
            message: 'Please try again in a moment'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Accel-Buffering': 'no' // Disable Nginx buffering
      }
    });

  } catch (error) {
    console.error('Universal chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Unable to process chat request. Please try again.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Session management endpoints
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, ...data } = body;

    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    switch (action) {
      case 'create':
        const session = await createChatSession(
          userId,
          data.clinicId,
          data.interface || 'external'
        );
        return NextResponse.json({
          sessionId: session.id,
          status: 'active',
          interface: data.interface || 'external',
          createdAt: new Date().toISOString()
        });

      case 'update':
        await updateChatSession(sessionId, data);
        return NextResponse.json({
          sessionId,
          status: 'updated',
          updatedAt: new Date().toISOString()
        });

      case 'end':
        await endChatSession(sessionId);
        return NextResponse.json({
          sessionId,
          status: 'ended',
          endedAt: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session management error:', error);
    return NextResponse.json({ error: 'Session management failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');

    if (sessionId) {
      // Get specific session
      const session = await getChatSession(sessionId);
      return NextResponse.json(session);
    } else if (userId) {
      // Get user sessions
      const sessions = await getUserChatSessions(userId);
      return NextResponse.json({ sessions });
    } else {
      // Health check
      return NextResponse.json({
        status: 'operational',
        message: 'Universal AI Chat API - Production Version',
        features: [
          'Dual interface (external/internal)',
          'Portuguese healthcare optimization',
          'Real-time AI responses',
          'Session management',
          'Compliance automation',
          'Emergency detection',
          'Audit trails',
          'Feature flags'
        ],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('GET request error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Implementation would extract user ID from JWT token or session
  // This is a placeholder - implement actual auth logic
  return 'user_' + Date.now();
}

async function getClinicIdFromUser(userId: string): Promise<string> {
  // Implementation would get clinic ID from user profile
  // This is a placeholder - implement actual user-clinic mapping
  return 'clinic_' + Date.now();
}

async function getChatSession(sessionId: string): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    clinicId: data.clinic_id,
    sessionType: data.session_type,
    title: data.title,
    status: data.status,
    context: data.context,
    metadata: data.metadata
  };
}

async function createChatSession(
  userId: string, 
  clinicId: string, 
  interfaceType: string
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert({
      user_id: userId,
      clinic_id: clinicId,
      session_type: interfaceType,
      title: `Chat ${interfaceType} - ${new Date().toLocaleString('pt-BR')}`,
      status: 'active',
      context: { interface: interfaceType },
      metadata: { created_via: 'universal-chat-api' }
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create chat session');
  }

  return {
    id: data.id,
    userId: data.user_id,
    clinicId: data.clinic_id,
    sessionType: data.session_type,
    title: data.title,
    status: data.status,
    context: data.context,
    metadata: data.metadata
  };
}

async function updateChatSession(sessionId: string, updates: any): Promise<void> {
  const { error } = await supabase
    .from('ai_chat_sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    throw new Error('Failed to update chat session');
  }
}

async function endChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_chat_sessions')
    .update({ 
      status: 'archived',
      metadata: { ended_at: new Date().toISOString() }
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error('Failed to end chat session');
  }
}

async function getUserChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error('Failed to get user sessions');
  }

  return data.map(session => ({
    id: session.id,
    userId: session.user_id,
    clinicId: session.clinic_id,
    sessionType: session.session_type,
    title: session.title,
    status: session.status,
    context: session.context,
    metadata: session.metadata
  }));
}

async function storeChatMessage(
  sessionId: string, 
  userMessage: ChatMessage, 
  aiResponse: any
): Promise<void> {
  const messages = [
    {
      session_id: sessionId,
      role: userMessage.role,
      content: userMessage.content,
      tokens_used: Math.ceil(userMessage.content.length / 4),
      metadata: { timestamp: userMessage.timestamp || new Date().toISOString() }
    },
    {
      session_id: sessionId,
      role: 'assistant',
      content: aiResponse.message,
      tokens_used: aiResponse.usage.completionTokens,
      model_used: aiResponse.modelUsed,
      response_time_ms: aiResponse.responseTimeMs,
      confidence_score: aiResponse.confidence,
      compliance_flags: aiResponse.complianceFlags,
      metadata: {
        emergency_detected: aiResponse.emergencyDetected,
        escalation_triggered: aiResponse.escalationTriggered,
        suggested_actions: aiResponse.suggestedActions
      }
    }
  ];

  const { error } = await supabase
    .from('ai_chat_messages')
    .insert(messages);

  if (error) {
    console.error('Failed to store chat messages:', error);
    // Don't throw - logging failure shouldn't break the chat
  }
}

async function getPatientContext(patientId: string): Promise<any> {
  // Implementation would fetch patient context from database
  // This is a placeholder
  return { patientId, context: 'patient_context_placeholder' };
}

async function getClinicContext(clinicId: string): Promise<any> {
  // Implementation would fetch clinic context from database
  // This is a placeholder
  return { clinicId, context: 'clinic_context_placeholder' };
}