/**
 * API Endpoints para Configuração específica de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Initialize BackupManager only if Supabase is configured
const backupManager: BackupManager | null = null;
// TODO: Re-enable after environment is properly configured
// try {
//   if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     backupManager = new BackupManager();
//   }
// } catch (error) {
//   console.warn('BackupManager initialization failed:', error);
// }

// Schema para atualização de configuração
const updateConfigSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  schedule_frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  schedule_time: z.string().optional(),
  schedule_cron: z.string().optional(),
  retention_daily: z.number().min(1).max(365).optional(),
  retention_weekly: z.number().min(1).max(52).optional(),
  retention_monthly: z.number().min(1).max(24).optional(),
  encryption_enabled: z.boolean().optional(),
  compression_enabled: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notification_email: z.string().email().optional(),
  notification_webhook: z.string().url().optional(),
});

/**
 * GET /api/backup/configs/[id]
 * Busca configuração específica de backup
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!backupManager) {
      return NextResponse.json(
        { error: 'Backup service not configured' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await backupManager.getBackupConfig(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar configuração de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/backup/configs/[id]
 * Atualiza configuração de backup
 */export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!backupManager) {
      return NextResponse.json(
        { error: 'Backup service not configured' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateConfigSchema.parse(body);

    const result = await backupManager.updateBackupConfig(params.id, {
      ...validatedData,
      updatedBy: user.id,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
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

    console.error('Erro ao atualizar configuração de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/backup/configs/[id]
 * Remove configuração de backup
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!backupManager) {
      return NextResponse.json(
        { error: 'Backup service not configured' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const result = await backupManager.deleteBackupConfig(params.id);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400
    });
  } catch (error) {
    console.error('Erro ao remover configuração de backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}