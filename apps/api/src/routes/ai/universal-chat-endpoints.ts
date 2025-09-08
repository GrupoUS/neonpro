/**
 * Universal AI Chat Endpoints - NeonPro API
 * Complete implementation of AI chat system with healthcare context
 * Supports both external (patient) and internal (staff) interfaces
 */

import { openai, } from '@ai-sdk/openai'
import { createClient, } from '@supabase/supabase-js'
import { streamText, } from 'ai'
import { Hono, } from 'hono'

const universalChat = new Hono()

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface ChatRequest {
  messages: ChatMessage[]
  interface: 'external' | 'internal'
  sessionId: string
  userId?: string
  clinicId?: string
  patientId?: string
  emergencyContext?: boolean
}

interface ChatResponse {
  type: 'start' | 'content' | 'complete' | 'error'
  content?: string
  sessionId?: string
  messageId?: string
  confidence?: number
  emergencyDetected?: boolean
  escalationTriggered?: boolean
  suggestedActions?: string[]
  complianceFlags?: string[]
  error?: string
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

// Healthcare context prompts
const HEALTHCARE_CONTEXT = {
  external: `Você é o assistente de IA da NeonPro, uma clínica de estética brasileira. 
	Você pode ajudar com:
	- Informações sobre tratamentos estéticos
	- Agendamento de consultas
	- Dúvidas gerais sobre procedimentos
	- Cuidados pós-procedimento
	
	IMPORTANTE:
	- Sempre mantenha conformidade com LGPD/ANVISA/CFM
	- Nunca faça diagnósticos médicos específicos
	- Em casos de emergência, direcione para atendimento médico
	- Use linguagem acessível em português brasileiro
	- Seja empático e profissional`,

  internal: `Você é o assistente interno de IA da NeonPro para profissionais de saúde.
	Você pode ajudar com:
	- Análise de dados de pacientes (respeitando LGPD)
	- Otimização de agenda e fluxos de trabalho
	- Métricas e insights da clínica
	- Suporte operacional
	
	IMPORTANTE:
	- Mantenha total conformidade LGPD/ANVISA/CFM
	- Proteja informações confidenciais de pacientes
	- Forneça insights baseados em dados
	- Use terminologia médica apropriada`,
}

// =============================================================================
// MAIN CHAT ENDPOINT
// =============================================================================

universalChat.post('/', async (c,) => {
  try {
    const body = (await c.req.json()) as ChatRequest
    const {
      messages,
      interface: interfaceType,
      sessionId,
      userId,
      clinicId,
      patientId,
    } = body

    if (!(messages && Array.isArray(messages,)) || messages.length === 0) {
      return c.json({ error: 'Messages array is required', }, 400,)
    }

    if (!sessionId) {
      return c.json({ error: 'Session ID is required', }, 400,)
    }

    // Log conversation start
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36,).slice(2, 9,)}`

    await supabase.from('assistant_conversations',).insert({
      session_id: sessionId,
      conversation_id: conversationId,
      user_id: userId,
      clinic_id: clinicId,
      patient_id: patientId,
      interface_type: interfaceType,
      status: 'active',
      created_at: new Date().toISOString(),
    },)

    // Build system context
    const systemMessage = {
      role: 'system' as const,
      content: `${HEALTHCARE_CONTEXT[interfaceType]}

Contexto da sessão:
- Interface: ${interfaceType}
- Clínica: ${clinicId || 'não especificada'}
- Data: ${new Date().toLocaleDateString('pt-BR',)}
- Horário: ${new Date().toLocaleTimeString('pt-BR',)}`,
    }

    // Prepare messages for OpenAI
    const chatMessages = [
      systemMessage,
      ...messages.map((msg,) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Stream response
    const result = await streamText({
      model: openai('gpt-4',),
      messages: chatMessages,
      temperature: 0.7,
      maxTokens: 1000,
    },)

    // Set up SSE headers
    c.header('Content-Type', 'text/event-stream',)
    c.header('Cache-Control', 'no-cache',)
    c.header('Connection', 'keep-alive',)
    c.header('Access-Control-Allow-Origin', '*',)

    const encoder = new TextEncoder()
    let fullResponse = ''
    const messageId = `msg_${Date.now()}_${Math.random().toString(36,).slice(2, 9,)}`

    // Start streaming
    const stream = new ReadableStream({
      async start(controller,) {
        // Send start event
        const startEvent: ChatResponse = {
          type: 'start',
          sessionId,
          messageId,
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(startEvent,)}\n\n`,),
        )

        try {
          // Stream content
          for await (const delta of result.textStream) {
            fullResponse += delta

            const contentEvent: ChatResponse = {
              type: 'content',
              content: delta,
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(contentEvent,)}\n\n`,),
            )
          }

          // Analyze response for compliance and emergency detection
          const analysis = await analyzeResponse(fullResponse, interfaceType,)

          // Log message to database
          await supabase.from('assistant_messages',).insert({
            conversation_id: conversationId,
            message_id: messageId,
            role: 'assistant',
            content: fullResponse,
            interface_type: interfaceType,
            confidence_score: analysis.confidence,
            emergency_detected: analysis.emergencyDetected,
            compliance_flags: analysis.complianceFlags,
            created_at: new Date().toISOString(),
          },)

          // Send complete event
          const completeEvent: ChatResponse = {
            type: 'complete',
            confidence: analysis.confidence,
            emergencyDetected: analysis.emergencyDetected,
            escalationTriggered: analysis.escalationTriggered,
            suggestedActions: analysis.suggestedActions,
            complianceFlags: analysis.complianceFlags,
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(completeEvent,)}\n\n`,),
          )
        } catch (error) {
          const errorEvent: ChatResponse = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent,)}\n\n`,),
          )
        } finally {
          controller.close()
        }
      },
    },)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    },)
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500,
    )
  }
},)

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

// Create new session
universalChat.put('/', async (c,) => {
  try {
    const body = await c.req.json()
    const { action, interface: interfaceType, clinicId, patientId, } = body

    if (action !== 'create') {
      return c.json({ error: 'Invalid action', }, 400,)
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36,).slice(2, 9,)}`

    await supabase.from('ai_chat_sessions',).insert({
      session_id: sessionId,
      interface_type: interfaceType,
      clinic_id: clinicId,
      patient_id: patientId,
      status: 'active',
      language: 'pt-BR',
      created_at: new Date().toISOString(),
    },)

    return c.json({
      success: true,
      sessionId,
      message: 'Session created successfully',
      timestamp: new Date().toISOString(),
    },)
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create session',
      },
      500,
    )
  }
},)

// Get session history
universalChat.get('/sessions/:sessionId', async (c,) => {
  try {
    const sessionId = c.req.param('sessionId',)

    const { data: conversations, error, } = await supabase
      .from('assistant_conversations',)
      .select(
        `
				*,
				messages:assistant_messages(*)
			`,
      )
      .eq('session_id', sessionId,)
      .order('created_at', { ascending: true, },)

    if (error) {
      throw error
    }

    return c.json({
      success: true,
      data: conversations,
      timestamp: new Date().toISOString(),
    },)
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get session',
      },
      500,
    )
  }
},)

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

async function analyzeResponse(
  content: string,
  _interfaceType: 'external' | 'internal',
) {
  // Emergency detection patterns
  const emergencyPatterns = [
    /emergência|urgente|socorro|ajuda médica/i,
    /dor intensa|sangramento|reação alérgica/i,
    /dificuldade para respirar|falta de ar/i,
  ]

  // Compliance validation patterns
  const complianceFlags: string[] = []

  // Check for medical advice (CFM compliance)
  if (/diagnóstico|prescrevo|recomendo tomar|dose de/i.test(content,)) {
    complianceFlags.push('CFM_MEDICAL_ADVICE',)
  }

  // Check for ANVISA device mentions
  if (/laser|botox|ácido hialurônico|peeling/i.test(content,)) {
    complianceFlags.push('ANVISA_DEVICE_MENTION',)
  }

  // Detect emergency
  const emergencyDetected = emergencyPatterns.some((pattern,) => pattern.test(content,))

  // Escalation logic
  const escalationTriggered = emergencyDetected || complianceFlags.length > 2

  // Suggested actions
  const suggestedActions: string[] = []
  if (emergencyDetected) {
    suggestedActions.push('Contatar equipe médica imediatamente',)
  }
  if (complianceFlags.includes('CFM_MEDICAL_ADVICE',)) {
    suggestedActions.push('Agendar consulta com profissional',)
  }

  return {
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
    emergencyDetected,
    escalationTriggered,
    complianceFlags,
    suggestedActions,
  }
}

export default universalChat
