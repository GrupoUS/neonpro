/**
 * API Endpoints para Configurações de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema de validação para configuração de backup
const backupConfigSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'DATABASE', 'FILES']),
  schedule_frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']),
  schedule_time: z.string().optional(),
  schedule_cron: z.string().optional(),
  storage_provider: z.enum(['LOCAL', 'S3', 'GCS', 'AZURE']),
  storage_config: z.record(z.any()).optional(),
  retention_daily: z.number().min(1).max(365).default(30),
  retention_weekly: z.number().min(1).max(52).default(12),
  retention_monthly: z.number().min(1).max(24).default(6),
  encryption_enabled: z.boolean().default(true),
  compression_enabled: z.boolean().default(true),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  data_types: z.array(z.string()).optional(),
  exclude_patterns: z.array(z.string()).optional(),
  notification_email: z.string().email().optional(),
  notification_webhook: z.string().url().optional(),
});

const backupManager = new BackupManager();

/**
 * GET /api/backup/configs
 * Lista todas as configurações de backup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const enabled = searchParams.get('enabled');
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');

    const filters = {
      ...(enabled !== null && { enabled: enabled === 'true' }),
      ...(type && { type }),
      ...(provider && { storage_provider: provider }),
    };

    const result = await backupManager.getBackupConfigs({
      pagination: { page, limit },
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar configurações de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup/configs
 * Cria nova configuração de backup
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validar dados de entrada
    const validatedData = backupConfigSchema.parse(body);

    // Criar configuração
    const result = await backupManager.createBackupConfig({
      ...validatedData,
      createdBy: user.id,
    });

    return NextResponse.json(result, { 
      status: result.success ? 201 : 400 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Erro ao criar configuração de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}