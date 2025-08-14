/**
 * API Endpoints para Métricas de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import { NextRequest, NextResponse } from 'next/server';
import { BackupManager } from '@/lib/backup/backup-manager';
import { createClient } from '@/lib/supabase/server';

const backupManager = new BackupManager();

/**
 * GET /api/backup/metrics
 * Retorna métricas detalhadas do sistema de backup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d
    const includeStorage = searchParams.get('storage') === 'true';
    const includePerformance = searchParams.get('performance') === 'true';
    const includeCompliance = searchParams.get('compliance') === 'true';

    const metricsData: any = {
      timestamp: new Date(),
      period,
    };

    // Métricas básicas sempre incluídas
    metricsData.basic = await backupManager.getBasicMetrics(period);

    // Métricas de storage se solicitadas
    if (includeStorage) {
      metricsData.storage = await backupManager.getStorageMetrics(period);
    }

    // Métricas de performance se solicitadas
    if (includePerformance) {
      metricsData.performance = await backupManager.getPerformanceMetrics(period);
    }

    // Métricas de compliance se solicitadas
    if (includeCompliance) {
      metricsData.compliance = await backupManager.getComplianceMetrics(period);
    }

    return NextResponse.json({
      success: true,
      data: metricsData,
      message: 'Métricas obtidas com sucesso',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}