import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  AuditAction,
  AuditConfig,
  AuditEvent,
  AuditExportOptions,
  AuditFilter,
  AuditLogEntry,
  AuditResponse,
  AuditStats,
  ResourceType,
} from "../types/audit";
import {
  AuditEventSchema,
  AuditFilterSchema,
  AuditSeverity,
  CriticalAuditAlert,
} from "../types/audit";

export class AuditService {
  private supabase;
  private config: AuditConfig;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Configuração padrão
    this.config = {
      enabled: true,
      log_level: AuditSeverity.LOW,
      retention_days: 2555, // 7 anos para conformidade healthcare
      excluded_endpoints: ["/health", "/metrics", "/favicon.ico"],
      excluded_actions: [],
      auto_archive: true,
      alert_on_critical: true,
      max_details_size: 10_000, // 10KB max para details JSON
    };
  }

  /**
   * Registra um evento de auditoria
   */
  async logEvent(event: AuditEvent): Promise<AuditLogEntry | null> {
    try {
      if (!this.config.enabled) return null;

      // Validar dados de entrada
      const validatedEvent = AuditEventSchema.parse(event);

      // Filtrar por nível de severidade
      if (this.shouldSkipEvent(validatedEvent)) return null;

      // Limitar tamanho dos detalhes
      if (validatedEvent.details) {
        const detailsSize = JSON.stringify(validatedEvent.details).length;
        if (detailsSize > this.config.max_details_size) {
          validatedEvent.details = {
            ...validatedEvent.details,
            _truncated: true,
            _original_size: detailsSize,
          };
        }
      }

      // Inserir no banco
      const { data, error } = await this.supabase
        .from("audit_logs")
        .insert({
          ...validatedEvent,
          timestamp: validatedEvent.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao inserir log de auditoria:", error);
        return null;
      }

      const auditEntry: AuditLogEntry = {
        ...data,
        timestamp: new Date(data.timestamp),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      // Verificar se é um evento crítico
      if (validatedEvent.severity === AuditSeverity.CRITICAL && this.config.alert_on_critical) {
        await this.handleCriticalEvent(auditEntry);
      }

      return auditEntry;
    } catch (error) {
      console.error("Erro no serviço de auditoria:", error);
      return null;
    }
  }

  /**
   * Consulta logs de auditoria com filtros
   */
  async getLogs(filters: AuditFilter): Promise<AuditResponse<AuditLogEntry[]>> {
    try {
      const validatedFilters = AuditFilterSchema.parse(filters);

      let query = this.supabase
        .from("audit_logs")
        .select("*", { count: "exact" });

      // Aplicar filtros
      if (validatedFilters.start_date) {
        query = query.gte("timestamp", validatedFilters.start_date);
      }
      if (validatedFilters.end_date) {
        query = query.lte("timestamp", validatedFilters.end_date);
      }
      if (validatedFilters.user_id) {
        query = query.eq("user_id", validatedFilters.user_id);
      }
      if (validatedFilters.action) {
        query = query.eq("action", validatedFilters.action);
      }
      if (validatedFilters.resource_type) {
        query = query.eq("resource_type", validatedFilters.resource_type);
      }
      if (validatedFilters.resource_id) {
        query = query.eq("resource_id", validatedFilters.resource_id);
      }
      if (validatedFilters.severity) {
        query = query.eq("severity", validatedFilters.severity);
      }
      if (validatedFilters.ip_address) {
        query = query.eq("ip_address", validatedFilters.ip_address);
      }
      if (validatedFilters.status_code) {
        query = query.eq("status_code", validatedFilters.status_code);
      }

      // Ordenação e paginação
      query = query
        .order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === "asc" })
        .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao consultar logs: ${error.message}`);
      }

      const logs: AuditLogEntry[] = (data || []).map(log => ({
        ...log,
        timestamp: new Date(log.timestamp),
        created_at: new Date(log.created_at),
        updated_at: new Date(log.updated_at),
      }));

      return {
        success: true,
        data: logs,
        total: count || 0,
        page: Math.floor(validatedFilters.offset / validatedFilters.limit) + 1,
        limit: validatedFilters.limit,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gera estatísticas de auditoria
   */
  async getStats(days: number = 30): Promise<AuditResponse<AuditStats>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Consulta base
      const { data: logs, error } = await this.supabase
        .from("audit_logs")
        .select("*")
        .gte("timestamp", startDate.toISOString());

      if (error) {
        throw new Error(`Erro ao gerar estatísticas: ${error.message}`);
      }

      const auditLogs: AuditLogEntry[] = (logs || []).map(log => ({
        ...log,
        timestamp: new Date(log.timestamp),
        created_at: new Date(log.created_at),
        updated_at: new Date(log.updated_at),
      }));

      // Calcular estatísticas
      const stats: AuditStats = {
        total_events: auditLogs.length,
        events_by_action: this.groupByField(auditLogs, "action") as Record<AuditAction, number>,
        events_by_resource: this.groupByField(auditLogs, "resource_type") as Record<
          ResourceType,
          number
        >,
        events_by_severity: this.groupByField(auditLogs, "severity") as Record<
          AuditSeverity,
          number
        >,
        top_users: this.getTopUsers(auditLogs),
        recent_critical_events: auditLogs
          .filter(log => log.severity === AuditSeverity.CRITICAL)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10),
        daily_activity: this.getDailyActivity(auditLogs, days),
      };

      return {
        success: true,
        data: stats,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as AuditStats,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Exporta logs de auditoria
   */
  async exportLogs(
    options: AuditExportOptions,
  ): Promise<AuditResponse<{ download_url: string; file_size: number; }>> {
    try {
      const logsResponse = await this.getLogs({
        ...options.filters,
        limit: 10_000, // Limite para exportação
      });

      if (!logsResponse.success) {
        throw new Error(logsResponse.message || "Erro ao consultar logs para exportação");
      }

      let exportData: any;
      let filename: string;
      let contentType: string;

      switch (options.format) {
        case "json":
          exportData = JSON.stringify(logsResponse.data, null, 2);
          filename = `audit_logs_${Date.now()}.json`;
          contentType = "application/json";
          break;

        case "csv":
          exportData = this.convertToCSV(logsResponse.data, options.include_details);
          filename = `audit_logs_${Date.now()}.csv`;
          contentType = "text/csv";
          break;

        case "pdf":
          // Implementar geração de PDF (placeholder)
          throw new Error("Exportação em PDF não implementada ainda");

        default:
          throw new Error("Formato de exportação não suportado");
      }

      // Salvar arquivo temporário (implementar storage)
      const fileSize = Buffer.byteLength(exportData, "utf8");
      const downloadUrl = `/api/audit/download/${filename}`; // Placeholder

      return {
        success: true,
        data: {
          download_url: downloadUrl,
          file_size: fileSize,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: { download_url: "", file_size: 0 },
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Limpa logs antigos baseado na política de retenção
   */
  async cleanupOldLogs(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retention_days);

      const { count, error } = await this.supabase
        .from("audit_logs")
        .delete()
        .lt("timestamp", cutoffDate.toISOString());

      if (error) {
        console.error("Erro ao limpar logs antigos:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Erro na limpeza de logs:", error);
      return 0;
    }
  }

  // Métodos privados auxiliares
  private shouldSkipEvent(event: AuditEvent): boolean {
    // Verificar nível de severidade
    const severityLevels = [
      AuditSeverity.LOW,
      AuditSeverity.MEDIUM,
      AuditSeverity.HIGH,
      AuditSeverity.CRITICAL,
    ];
    const configLevel = severityLevels.indexOf(this.config.log_level);
    const eventLevel = severityLevels.indexOf(event.severity);

    if (eventLevel < configLevel) return true;

    // Verificar ações excluídas
    if (this.config.excluded_actions.includes(event.action)) return true;

    // Verificar endpoints excluídos
    if (event.endpoint && this.config.excluded_endpoints.some(ep => event.endpoint?.includes(ep))) {
      return true;
    }

    return false;
  }

  private async handleCriticalEvent(event: AuditLogEntry): Promise<void> {
    // Implementar lógica de alerta para eventos críticos
    console.warn("EVENTO CRÍTICO DE AUDITORIA:", {
      id: event.id,
      action: event.action,
      resource_type: event.resource_type,
      user_id: event.user_id,
      timestamp: event.timestamp,
    });

    // Aqui poderia integrar com sistemas de alerta (email, Slack, etc.)
  }

  private groupByField(logs: AuditLogEntry[], field: keyof AuditLogEntry): Record<string, number> {
    return logs.reduce((acc, log) => {
      const value = String(log[field] || "unknown");
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopUsers(logs: AuditLogEntry[]): { user_id: string; count: number; }[] {
    const userCounts = logs
      .filter(log => log.user_id)
      .reduce((acc, log) => {
        const userId = log.user_id!;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .map(([user_id, count]) => ({ user_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getDailyActivity(
    logs: AuditLogEntry[],
    days: number,
  ): { date: string; count: number; }[] {
    const dailyCounts: Record<string, number> = {};

    // Inicializar todos os dias com 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyCounts[dateStr] = 0;
    }

    // Contar eventos por dia
    logs.forEach(log => {
      const dateStr = log.timestamp.toISOString().split("T")[0];
      if (dailyCounts.hasOwnProperty(dateStr)) {
        dailyCounts[dateStr]++;
      }
    });

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private convertToCSV(logs: AuditLogEntry[], includeDetails: boolean): string {
    if (logs.length === 0) return "";

    const headers = [
      "id",
      "timestamp",
      "user_id",
      "session_id",
      "action",
      "resource_type",
      "resource_id",
      "resource_name",
      "ip_address",
      "user_agent",
      "method",
      "endpoint",
      "status_code",
      "severity",
      "error_message",
      "duration_ms",
    ];

    if (includeDetails) {
      headers.push("details", "before_data", "after_data");
    }

    const csvRows = [headers.join(",")];

    logs.forEach(log => {
      const row = headers.map(header => {
        let value = log[header as keyof AuditLogEntry];

        if (value === null || value === undefined) {
          return "";
        }

        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        // Escapar aspas duplas e envolver em aspas se necessário
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      });

      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }
}

// Instância singleton
export const auditService = new AuditService();
