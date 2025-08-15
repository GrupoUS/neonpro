/**
 * 🛡️ NEONPRO AUTOMATED CLEANUP JOB
 *
 * Job automático para execução das políticas de retenção de dados
 * Executa via Edge Functions ou cron job para compliance LGPD/ANVISA
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, CFM
 */

import { DataRetentionEngine } from '@/lib/compliance/data-retention';
import { createClient } from '@/lib/supabase/client';

// ==================== JOB CONFIGURATION ====================

export interface CleanupJobConfig {
  enabled: boolean;
  schedule_cron: string; // Cron expression
  max_runtime_minutes: number;
  batch_size: number;
  notify_on_completion: boolean;
  notification_emails: string[];
  dry_run: boolean; // Para testes sem modificar dados
}

export interface CleanupJobResult {
  job_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  total_processed: number;
  anonymized_count: number;
  deleted_count: number;
  errors: string[];
  execution_time_ms: number;
  next_scheduled_run?: string;
}

// ==================== DEFAULT CONFIGURATION ====================

const DEFAULT_CONFIG: CleanupJobConfig = {
  enabled: true,
  schedule_cron: '0 2 * * 0', // Todo domingo às 2h da manhã
  max_runtime_minutes: 30,
  batch_size: 100,
  notify_on_completion: true,
  notification_emails: ['compliance@neonpro.com.br', 'admin@neonpro.com.br'],
  dry_run: false,
};

// ==================== AUTOMATED CLEANUP JOB CLASS ====================

export class AutomatedCleanupJob {
  private readonly supabase: ReturnType<typeof createClient>;
  private config: CleanupJobConfig;
  private readonly retentionEngine: DataRetentionEngine;

  constructor(config: Partial<CleanupJobConfig> = {}) {
    this.supabase = createClient();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.retentionEngine = new DataRetentionEngine();
  }

  /**
   * Executa o job de limpeza automática
   */
  async execute(): Promise<CleanupJobResult> {
    const jobId = crypto.randomUUID();
    const startTime = new Date();

    const result: CleanupJobResult = {
      job_id: jobId,
      started_at: startTime.toISOString(),
      status: 'running',
      total_processed: 0,
      anonymized_count: 0,
      deleted_count: 0,
      errors: [],
      execution_time_ms: 0,
    };

    try {
      console.log(`🚀 Iniciando job de limpeza automática: ${jobId}`);
      console.log(`📅 Scheduled: ${this.config.schedule_cron}`);
      console.log(
        `⚙️ Config: batch_size=${this.config.batch_size}, dry_run=${this.config.dry_run}`
      );

      // Verificar se job está habilitado
      if (!this.config.enabled) {
        console.log('⚠️ Job desabilitado via configuração');
        result.status = 'completed';
        result.completed_at = new Date().toISOString();
        return result;
      }

      // Registrar início do job
      await this.logJobExecution(result);

      // Configurar timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => {
            reject(
              new Error(
                `Job timeout after ${this.config.max_runtime_minutes} minutes`
              )
            );
          },
          this.config.max_runtime_minutes * 60 * 1000
        );
      });

      // Executar limpeza com timeout
      const cleanupPromise = this.performCleanup(result);

      await Promise.race([cleanupPromise, timeoutPromise]);

      result.status = 'completed';
      result.completed_at = new Date().toISOString();

      console.log(`✅ Job concluído com sucesso: ${jobId}`);
      console.log(
        `📊 Processados: ${result.total_processed}, Anonimizados: ${result.anonymized_count}, Deletados: ${result.deleted_count}`
      );
    } catch (error) {
      result.status =
        error instanceof Error && error.message.includes('timeout')
          ? 'timeout'
          : 'failed';
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );

      console.error(`❌ Job falhou: ${jobId}`, error);
    } finally {
      const endTime = new Date();
      result.execution_time_ms = endTime.getTime() - startTime.getTime();
      result.completed_at = endTime.toISOString();

      // Calcular próxima execução
      result.next_scheduled_run = this.calculateNextRun().toISOString();

      // Atualizar registro do job
      await this.logJobExecution(result);

      // Notificar se configurado
      if (
        this.config.notify_on_completion &&
        this.config.notification_emails.length > 0
      ) {
        await this.sendCompletionNotification(result);
      }
    }

    return result;
  }

  /**
   * Executa o processo de limpeza
   */
  private async performCleanup(result: CleanupJobResult): Promise<void> {
    try {
      if (this.config.dry_run) {
        console.log('🧪 Modo DRY RUN - Nenhum dado será modificado');
        await this.performDryRun(result);
      } else {
        console.log('🔄 Executando limpeza real de dados');
        await this.performRealCleanup(result);
      }
    } catch (error) {
      console.error('❌ Erro durante limpeza:', error);
      throw error;
    }
  }

  /**
   * Executa dry run para teste
   */
  private async performDryRun(result: CleanupJobResult): Promise<void> {
    console.log('🔍 Simulando limpeza de dados...');

    // Simular análise de compliance para cada tabela
    const tables = [
      'patients',
      'consultations',
      'transactions',
      'appointments',
      'invoices',
    ];

    for (const table of tables) {
      try {
        const complianceStatus =
          await this.retentionEngine.checkComplianceStatus(table);

        console.log(
          `📊 ${table}: ${complianceStatus.total_records} registros, ${complianceStatus.records_need_anonymization} precisam anonimização, ${complianceStatus.records_need_deletion} precisam deleção`
        );

        result.total_processed += complianceStatus.total_records;
        result.anonymized_count += complianceStatus.records_need_anonymization;
        result.deleted_count += complianceStatus.records_need_deletion;
      } catch (error) {
        const errorMsg = `Erro ao analisar tabela ${table}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('✅ Dry run concluído - Nenhum dado foi modificado');
  }

  /**
   * Executa limpeza real de dados
   */
  private async performRealCleanup(result: CleanupJobResult): Promise<void> {
    console.log(
      '⚠️ Executando limpeza REAL - Dados serão modificados permanentemente'
    );

    try {
      // Executar políticas de retenção
      const complianceRecords =
        await this.retentionEngine.executeRetentionPolicies();

      // Processar resultados
      result.total_processed = complianceRecords.length;
      result.anonymized_count = complianceRecords.filter(
        (r) => r.action === 'anonymized'
      ).length;
      result.deleted_count = complianceRecords.filter(
        (r) => r.action === 'deleted'
      ).length;

      console.log(
        `📊 Limpeza concluída: ${result.total_processed} ações executadas`
      );
    } catch (error) {
      const errorMsg = `Erro durante limpeza real: ${error}`;
      result.errors.push(errorMsg);
      console.error(errorMsg);
      throw error;
    }
  }

  /**
   * Registra execução do job no banco
   */
  private async logJobExecution(result: CleanupJobResult): Promise<void> {
    try {
      const { error } = await this.supabase.from('cleanup_job_history').upsert({
        job_id: result.job_id,
        started_at: result.started_at,
        completed_at: result.completed_at,
        status: result.status,
        total_processed: result.total_processed,
        anonymized_count: result.anonymized_count,
        deleted_count: result.deleted_count,
        errors: result.errors,
        execution_time_ms: result.execution_time_ms,
        next_scheduled_run: result.next_scheduled_run,
        config_snapshot: this.config,
      });

      if (error) {
        console.error('❌ Erro ao registrar execução do job:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao fazer log do job:', error);
    }
  }

  /**
   * Calcula próxima execução baseada no cron
   */
  private calculateNextRun(): Date {
    // Implementação simplificada - em produção usar library como 'node-cron'
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7); // Todo domingo
    nextWeek.setHours(2, 0, 0, 0); // 2h da manhã

    return nextWeek;
  }

  /**
   * Envia notificação de conclusão
   */
  private async sendCompletionNotification(
    result: CleanupJobResult
  ): Promise<void> {
    try {
      const isSuccess =
        result.status === 'completed' && result.errors.length === 0;
      const subject = isSuccess
        ? `✅ Job de Limpeza Concluído - ${result.job_id}`
        : `⚠️ Job de Limpeza com Problemas - ${result.job_id}`;

      const body = this.generateNotificationBody(result, isSuccess);

      // Em produção, implementar envio via email service (SendGrid, etc.)
      console.log(
        `📧 Enviando notificação para: ${this.config.notification_emails.join(', ')}`
      );
      console.log(`📄 Assunto: ${subject}`);
      console.log(`📝 Corpo:\n${body}`);

      // TODO: Implementar envio real de email
      // await emailService.send({
      //   to: this.config.notification_emails,
      //   subject,
      //   body
      // });
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
    }
  }

  /**
   * Gera corpo da notificação
   */
  private generateNotificationBody(
    result: CleanupJobResult,
    isSuccess: boolean
  ): string {
    const duration = Math.round(result.execution_time_ms / 1000);
    const status = isSuccess ? '✅ SUCESSO' : '⚠️ COM PROBLEMAS';

    return `
🛡️ RELATÓRIO DE LIMPEZA AUTOMÁTICA - NEONPRO COMPLIANCE

Status: ${status}
Job ID: ${result.job_id}
Iniciado: ${new Date(result.started_at).toLocaleString('pt-BR')}
Concluído: ${result.completed_at ? new Date(result.completed_at).toLocaleString('pt-BR') : 'N/A'}
Duração: ${duration}s

📊 ESTATÍSTICAS:
• Total processado: ${result.total_processed} registros
• Anonimizados: ${result.anonymized_count} registros
• Deletados: ${result.deleted_count} registros

${
  result.errors.length > 0
    ? `
❌ ERROS ENCONTRADOS:
${result.errors.map((e) => `• ${e}`).join('\n')}
`
    : ''
}

🗓️ Próxima execução: ${result.next_scheduled_run ? new Date(result.next_scheduled_run).toLocaleString('pt-BR') : 'N/A'}

Este é um relatório automático do sistema de compliance NeonPro.
Para mais detalhes, acesse o dashboard de compliance.
    `.trim();
  }

  /**
   * Obtém histórico de execuções
   */
  async getJobHistory(limit = 10): Promise<CleanupJobResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('cleanup_job_history')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao obter histórico:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Atualiza configuração do job
   */
  updateConfig(newConfig: Partial<CleanupJobConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuração do job atualizada:', this.config);
  }
}

// ==================== EDGE FUNCTION HANDLER ====================

/**
 * Handler para Edge Function do Supabase
 * Pode ser usado para executar o job via webhook ou cron
 */
export async function handleCleanupRequest(
  request: Request
): Promise<Response> {
  const url = new URL(request.url);
  const isDryRun = url.searchParams.get('dry_run') === 'true';

  try {
    // Verificar autenticação (implementar conforme necessário)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('🚀 Iniciando cleanup job via Edge Function');

    const cleanupJob = new AutomatedCleanupJob({
      dry_run: isDryRun,
      notify_on_completion: false, // Não notificar via edge function
    });

    const result = await cleanupJob.execute();

    return new Response(JSON.stringify(result, null, 2), {
      status: result.status === 'completed' ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro no handler da edge function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ==================== CLI INTEGRATION ====================

/**
 * Função para execução via CLI
 * Uso: node cleanup-job.js [--dry-run] [--config-file=path]
 */
export async function runCleanupCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log('🛡️ NEONPRO AUTOMATED CLEANUP JOB');
  console.log('================================');
  console.log(`Modo: ${isDryRun ? 'DRY RUN (simulação)' : 'PRODUÇÃO'}`);
  console.log('');

  try {
    const cleanupJob = new AutomatedCleanupJob({
      dry_run: isDryRun,
      notify_on_completion: true,
    });

    const result = await cleanupJob.execute();

    console.log('');
    console.log('📊 RESULTADO FINAL:');
    console.log(`Status: ${result.status}`);
    console.log(`Processados: ${result.total_processed}`);
    console.log(`Anonimizados: ${result.anonymized_count}`);
    console.log(`Deletados: ${result.deleted_count}`);
    console.log(`Duração: ${Math.round(result.execution_time_ms / 1000)}s`);

    if (result.errors.length > 0) {
      console.log('');
      console.log('❌ ERROS:');
      result.errors.forEach((error) => console.log(`• ${error}`));
    }

    process.exit(result.status === 'completed' ? 0 : 1);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// ==================== EXPORTS ====================

export { AutomatedCleanupJob };
export default AutomatedCleanupJob;
