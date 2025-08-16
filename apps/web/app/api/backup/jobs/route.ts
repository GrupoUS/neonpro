/**
 * API Endpoints para Jobs de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';

const backupManager = new BackupManager();

// Schema para iniciar backup manual
const startBackupSchema = z.object({
  config_id: z.string().uuid('ID de configuração inválido'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional(),
});

/**
 * GET /api/backup/jobs
 * Lista jobs de backup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const config_id = searchParams.get('config_id');

    const filters = {
      ...(status && { status }),
      ...(type && { type }),
      ...(config_id && { config_id }),
    };

    const result = await backupManager.getBackupJobs({
      pagination: { page, limit },
      filters,
    });

    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/backup/jobs
 * Inicia backup manual
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = startBackupSchema.parse(body);

    const result = await backupManager.startBackup({
      ...validatedData,
      initiated_by: user.id,
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
