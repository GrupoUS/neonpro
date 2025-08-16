/**
 * API Endpoints para Status de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { type NextRequest, NextResponse } from 'next/server';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';

const backupManager = new BackupManager();

/**
 * GET /api/backup/status
 * Retorna status geral do sistema de backup
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
    const includeMetrics = searchParams.get('metrics') === 'true';
    const includeActiveJobs = searchParams.get('active_jobs') === 'true';
    const includeAlerts = searchParams.get('alerts') === 'true';

    const statusData: any = {
      timestamp: new Date(),
      system_health: 'HEALTHY',
    };

    // Incluir métricas se solicitado
    if (includeMetrics) {
      statusData.metrics = await backupManager.getSystemMetrics();
    }

    // Incluir jobs ativos se solicitado
    if (includeActiveJobs) {
      statusData.active_jobs = await backupManager.getActiveJobs();
    }

    // Incluir alertas se solicitado
    if (includeAlerts) {
      statusData.alerts = await backupManager.getActiveAlerts();
    }

    return NextResponse.json({
      success: true,
      data: statusData,
      message: 'Status do sistema obtido com sucesso',
      timestamp: new Date(),
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
