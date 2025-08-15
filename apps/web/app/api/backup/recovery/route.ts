/**
 * API Endpoints para Recovery de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';

const backupManager = new BackupManager();

// Schema para operação de recovery
const recoverySchema = z.object({
  backup_id: z.string().uuid('ID de backup inválido'),
  type: z.enum([
    'FULL_RESTORE',
    'PARTIAL_RESTORE',
    'POINT_IN_TIME',
    'VERIFICATION',
  ]),
  target_location: z.string().optional(),
  files_to_restore: z.array(z.string()).optional(),
  point_in_time: z.string().datetime().optional(),
  overwrite_existing: z.boolean().default(false),
  verify_integrity: z.boolean().default(true),
  notification_email: z.string().email().optional(),
});

/**
 * GET /api/backup/recovery
 * Lista operações de recovery
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

    const filters = {
      ...(status && { status }),
      ...(type && { type }),
    };

    const result = await backupManager.getRecoveryOperations({
      pagination: { page, limit },
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar operações de recovery:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup/recovery
 * Inicia operação de recovery
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
    const validatedData = recoverySchema.parse(body);

    const result = await backupManager.startRecovery({
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
        { status: 400 }
      );
    }

    console.error('Erro ao iniciar recovery:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
