/**
 * API Endpoint: Send Notification
 * 
 * Endpoint para envio de notificações com validação completa de compliance
 * e otimização inteligente via ML.
 * 
 * @route POST /api/notifications/send
 * @author APEX Architecture Team
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { notificationManager } from '@/lib/notifications/core/notification-manager';
import { notificationMLEngine } from '@/lib/notifications/ml/optimization-engine';
import { notificationComplianceEngine } from '@/lib/notifications/compliance/compliance-engine';
import { NotificationChannel, NotificationType } from '@/lib/notifications/types';

// ================================================================================
// VALIDATION SCHEMAS
// ================================================================================

const SendNotificationSchema = z.object({
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  clinicId: z.string().uuid('ID da clínica deve ser um UUID válido'),
  type: z.nativeEnum(NotificationType, {
    errorMap: () => ({ message: 'Tipo de notificação inválido' })
  }),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  content: z.string().min(1, 'Conteúdo é obrigatório').max(1000, 'Conteúdo muito longo'),
  templateId: z.string().uuid().optional(),
  templateData: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.any()).optional(),
  enableMLOptimization: z.boolean().default(true),
  skipComplianceCheck: z.boolean().default(false),
});

const BulkSendSchema = z.object({
  clinicId: z.string().uuid(),
  notifications: z.array(SendNotificationSchema).min(1).max(1000),
  batchOptions: z.object({
    delay: z.number().min(0).max(60000).default(1000), // ms entre envios
    stopOnError: z.boolean().default(false),
    enableProgressTracking: z.boolean().default(true),
  }).optional(),
});

type SendNotificationRequest = z.infer<typeof SendNotificationSchema>;
type BulkSendRequest = z.infer<typeof BulkSendSchema>;

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

/**
 * Valida autenticação e autorização
 */
async function validateAuth(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { error: 'Não autenticado', status: 401 };
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Usuário inválido', status: 401 };
  }

  // Verificar permissões de notificação
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role, permissions')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { error: 'Perfil não encontrado', status: 404 };
  }

  const canSendNotifications = profile.permissions?.includes('send_notifications') || 
                              ['admin', 'manager', 'receptionist'].includes(profile.role);

  if (!canSendNotifications) {
    return { error: 'Sem permissão para enviar notificações', status: 403 };
  }

  return { user, profile, supabase };
}

/**
 * Processa otimização inteligente
 */
async function applyMLOptimization(
  request: SendNotificationRequest,
  skipOptimization = false
) {
  if (skipOptimization || !request.enableMLOptimization) {
    return request;
  }

  try {
    const optimization = await notificationMLEngine.optimizeForUser(
      request.userId,
      request.clinicId,
      {
        content: request.content,
        type: request.type,
        scheduledFor: request.scheduledFor ? new Date(request.scheduledFor) : undefined,
        channels: request.channels,
      }
    );

    // Aplicar otimizações
    const optimizedRequest = {
      ...request,
      channels: request.channels || [optimization.optimizations.channel.recommended],
      content: optimization.optimizations.content.personalizedContent,
      scheduledFor: optimization.optimizations.timing.recommended.toISOString(),
      metadata: {
        ...request.metadata,
        mlOptimization: {
          applied: true,
          confidence: {
            channel: optimization.optimizations.channel.confidence,
            timing: optimization.optimizations.timing.confidence,
            content: optimization.optimizations.content.confidence,
          },
          modelVersions: optimization.modelVersions,
        },
      },
    };

    return optimizedRequest;
  } catch (error) {
    console.error('Erro na otimização ML:', error);
    // Continuar sem otimização em caso de erro
    return request;
  }
}

/**
 * Valida compliance
 */
async function validateCompliance(request: SendNotificationRequest) {
  if (request.skipComplianceCheck) {
    return { isCompliant: true, warnings: ['Verificação de compliance ignorada'] };
  }

  try {
    // Validação LGPD
    const lgpdCheck = await notificationComplianceEngine.validateLGPDCompliance(
      request.userId,
      request.clinicId,
      request.type,
      request.channels?.[0] || NotificationChannel.EMAIL
    );

    // Validação médica (se aplicável)
    const medicalCheck = await notificationComplianceEngine.validateMedicalCompliance(
      request.userId,
      request.clinicId,
      request.content,
      request.type
    );

    const allViolations = [...lgpdCheck.violations, ...medicalCheck.violations];
    const criticalViolations = allViolations.filter(v => v.severity === 'critical');

    if (criticalViolations.length > 0) {
      return {
        isCompliant: false,
        violations: allViolations,
        error: 'Violações críticas de compliance detectadas',
      };
    }

    return {
      isCompliant: true,
      violations: allViolations,
      recommendations: [...lgpdCheck.recommendations, ...medicalCheck.recommendations],
    };
  } catch (error) {
    console.error('Erro na validação de compliance:', error);
    return {
      isCompliant: false,
      error: 'Erro interno na validação de compliance',
    };
  }
}

// ================================================================================
// API HANDLERS
// ================================================================================

/**
 * POST /api/notifications/send
 * Envia notificação única com otimização e compliance
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar autenticação
    const authResult = await validateAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile, supabase } = authResult;

    // 2. Validar dados da requisição
    const body = await request.json();
    const validationResult = SendNotificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    const notificationRequest = validationResult.data;

    // 3. Verificar se usuário pertence à clínica
    if (profile.clinic_id !== notificationRequest.clinicId) {
      return NextResponse.json(
        { error: 'Usuário não autorizado para esta clínica' },
        { status: 403 }
      );
    }

    // 4. Aplicar otimização ML
    const optimizedRequest = await applyMLOptimization(notificationRequest);

    // 5. Validar compliance
    const complianceResult = await validateCompliance(optimizedRequest);
    if (!complianceResult.isCompliant) {
      return NextResponse.json(
        { 
          error: complianceResult.error || 'Falha na validação de compliance',
          violations: complianceResult.violations
        },
        { status: 422 }
      );
    }

    // 6. Enviar notificação
    const notification = await notificationManager.sendNotification({
      userId: optimizedRequest.userId,
      clinicId: optimizedRequest.clinicId,
      type: optimizedRequest.type,
      channels: optimizedRequest.channels!,
      title: optimizedRequest.title,
      content: optimizedRequest.content,
      templateId: optimizedRequest.templateId,
      templateData: optimizedRequest.templateData,
      scheduledFor: optimizedRequest.scheduledFor ? new Date(optimizedRequest.scheduledFor) : undefined,
      priority: optimizedRequest.priority,
      metadata: {
        ...optimizedRequest.metadata,
        sentBy: user.id,
        sentByRole: profile.role,
        complianceValidated: true,
      },
    });

    // 7. Retornar resultado
    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      optimizations: optimizedRequest.metadata?.mlOptimization,
      compliance: {
        validated: true,
        warnings: complianceResult.violations?.filter(v => v.severity !== 'critical'),
        recommendations: complianceResult.recommendations,
      },
      channels: optimizedRequest.channels,
      scheduledFor: optimizedRequest.scheduledFor,
    });

  } catch (error) {
    console.error('Erro no envio de notificação:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/send
 * Envio em lote (bulk) com processamento otimizado
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. Validar autenticação
    const authResult = await validateAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, profile } = authResult;

    // 2. Validar dados da requisição
    const body = await request.json();
    const validationResult = BulkSendSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos para envio em lote',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const bulkRequest = validationResult.data;

    // 3. Verificar autorização da clínica
    if (profile.clinic_id !== bulkRequest.clinicId) {
      return NextResponse.json(
        { error: 'Usuário não autorizado para esta clínica' },
        { status: 403 }
      );
    }

    // 4. Processar notificações em lote
    const results = [];
    const errors = [];
    let processed = 0;

    for (const notification of bulkRequest.notifications) {
      try {
        // Aplicar otimização e compliance para cada notificação
        const optimizedNotification = await applyMLOptimization(notification);
        const complianceResult = await validateCompliance(optimizedNotification);

        if (!complianceResult.isCompliant) {
          errors.push({
            userId: notification.userId,
            error: 'Falha na validação de compliance',
            violations: complianceResult.violations
          });
          
          if (bulkRequest.batchOptions?.stopOnError) {
            break;
          }
          continue;
        }

        // Enviar notificação
        const result = await notificationManager.sendNotification({
          ...optimizedNotification,
          channels: optimizedNotification.channels!,
          scheduledFor: optimizedNotification.scheduledFor ? new Date(optimizedNotification.scheduledFor) : undefined,
          metadata: {
            ...optimizedNotification.metadata,
            sentBy: user.id,
            sentByRole: profile.role,
            batchId: `bulk_${Date.now()}`,
          },
        });

        results.push({
          userId: notification.userId,
          notificationId: result.id,
          status: 'sent',
        });

        processed++;

        // Delay entre envios se configurado
        if (bulkRequest.batchOptions?.delay) {
          await new Promise(resolve => setTimeout(resolve, bulkRequest.batchOptions.delay));
        }

      } catch (error) {
        errors.push({
          userId: notification.userId,
          error: error.message,
        });

        if (bulkRequest.batchOptions?.stopOnError) {
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: bulkRequest.notifications.length,
        processed,
        successful: results.length,
        failed: errors.length,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Erro no envio em lote:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno no envio em lote',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/send
 * Retorna informações sobre limites e configurações
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { profile } = authResult;

    return NextResponse.json({
      limits: {
        single: {
          maxTitleLength: 100,
          maxContentLength: 1000,
          supportedChannels: Object.values(NotificationChannel),
          supportedTypes: Object.values(NotificationType),
        },
        bulk: {
          maxNotifications: 1000,
          maxDelay: 60000,
          recommendedBatchSize: 100,
        },
      },
      features: {
        mlOptimization: true,
        complianceValidation: true,
        scheduling: true,
        templateSupport: true,
      },
      clinic: {
        id: profile.clinic_id,
        permissions: profile.permissions,
        role: profile.role,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao obter configurações' },
      { status: 500 }
    );
  }
}