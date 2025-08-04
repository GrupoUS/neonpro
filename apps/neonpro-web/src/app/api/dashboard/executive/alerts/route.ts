import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AlertSystem } from '@/lib/dashboard/executive/alert-system';

// Schema for alert rule creation/update
const CreateAlertRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  kpiDefinitionId: z.string().uuid().optional(),
  conditionType: z.enum(['threshold', 'trend', 'anomaly', 'custom']),
  conditionConfig: z.record(z.any()),
  severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  notificationConfig: z.object({
    email: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string().email()).default([])
    }).optional(),
    sms: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string()).default([])
    }).optional(),
    push: z.object({
      enabled: z.boolean().default(false),
      recipients: z.array(z.string()).default([])
    }).optional(),
    webhook: z.object({
      enabled: z.boolean().default(false),
      url: z.string().url().optional(),
      headers: z.record(z.string()).optional()
    }).optional()
  }).default({}),
  cooldownMinutes: z.number().min(1).default(60)
});

const UpdateAlertRuleSchema = CreateAlertRuleSchema.partial();

// Schema for alert instance actions
const AlertActionSchema = z.object({
  action: z.enum(['acknowledge', 'resolve', 'dismiss']),
  comment: z.string().optional()
});

// GET /api/dashboard/executive/alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: 'Usuário não associado a uma clínica' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'rules' or 'instances'
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const alertSystem = new AlertSystem(supabase, clinicUser.clinic_id);

    if (type === 'rules') {
      // Get alert rules
      const rules = await alertSystem.getAlertRules({
        isActive: status !== 'inactive'
      });
      return NextResponse.json({ rules });
    } else {
      // Get alert instances (default)
      const filters: any = {};
      if (status) filters.status = status;
      if (severity) filters.severity = severity;

      const instances = await alertSystem.getAlertInstances(filters, limit, offset);
      return NextResponse.json({ instances });
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/executive/alerts
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get user's clinic
    const { data: clinicUser } = await supabase
      .from('clinic_users')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (!clinicUser) {
      return NextResponse.json(
        { error: 'Usuário não associado a uma clínica' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateAlertRuleSchema.parse(body);

    const alertSystem = new AlertSystem(supabase, clinicUser.clinic_id);
    const rule = await alertSystem.createAlertRule(validatedData);

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating alert rule:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}