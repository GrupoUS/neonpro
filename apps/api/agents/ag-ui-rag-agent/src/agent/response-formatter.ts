/**
 * Response formatter for CopilotKit and AG-UI Protocol
 * Formats healthcare data for optimal UI display
 */

interface FormattingInput {
  intent: string;
  data: any;
  query: string;
  confidence: number;
}

interface FormattedResponse {
  type: 'text' | 'list' | 'table' | 'chart' | 'error';
  content: {
    title?: string;
    text?: string;
    data?: any[];
    columns?: Array<{ key: string; label: string; type: string }>;
  };
  actions?: Array<{
    id: string;
    label: string;
    type: 'button' | 'link' | 'form';
    action: string;
    parameters?: Record<string, any>;
  }>;
}

/**
 * Response formatter for healthcare data presentation
 */
export class ResponseFormatter {

  /**
   * Format response based on intent and data
   */
  async formatResponse(input: FormattingInput): Promise<FormattedResponse> {
    switch (input.intent) {
      case 'client_search':
        return this.formatClientSearchResponse(input);
      
      case 'appointment_query':
        return this.formatAppointmentResponse(input);
      
      case 'financial_summary':
        return this.formatFinancialResponse(input);
      
      case 'general_help':
        return this.formatHelpResponse(input);
      
      default:
        return this.formatErrorResponse(`Intenção não suportada: ${input.intent}`);
    }
  }

  /**
   * Format client search results
   */
  private formatClientSearchResponse(input: FormattingInput): FormattedResponse {
    const clients = input.data;

    if (!Array.isArray(clients) || clients.length === 0) {
      return {
        type: 'text',
        content: {
          title: 'Clientes Não Encontrados',
          text: 'Nenhum cliente foi encontrado com os critérios de busca fornecidos. Tente refinar sua busca ou verificar a grafia do nome.',
        },
        actions: [
          {
            id: 'new_search',
            label: 'Nova Busca',
            type: 'button',
            action: 'start_new_search',
          }
        ],
      };
    }

    return {
      type: 'table',
      content: {
        title: `${clients.length} Cliente(s) Encontrado(s)`,
        text: `Resultados da busca para: "${input.query}"`,
        data: clients.map(client => ({
          id: client.id,
          nome: client.name,
          email: client.email || 'Não informado',
          telefone: client.phone || 'Não informado',
          nascimento: client.birthDate ? this.formatDate(client.birthDate) : 'Não informado',
          cadastro: this.formatDate(client.createdAt),
        })),
        columns: [
          { key: 'nome', label: 'Nome', type: 'string' },
          { key: 'email', label: 'Email', type: 'string' },
          { key: 'telefone', label: 'Telefone', type: 'string' },
          { key: 'nascimento', label: 'Nascimento', type: 'date' },
          { key: 'cadastro', label: 'Cadastro', type: 'date' },
        ],
      },
      actions: clients.map(client => ({
        id: `view_client_${client.id}`,
        label: 'Ver Detalhes',
        type: 'button',
        action: 'view_client_details',
        parameters: { clientId: client.id },
      })),
    };
  }

  /**
   * Format appointment query results
   */
  private formatAppointmentResponse(input: FormattingInput): FormattedResponse {
    const appointments = input.data;

    if (!Array.isArray(appointments) || appointments.length === 0) {
      return {
        type: 'text',
        content: {
          title: 'Nenhum Agendamento Encontrado',
          text: 'Não há agendamentos para o período especificado.',
        },
        actions: [
          {
            id: 'schedule_new',
            label: 'Novo Agendamento',
            type: 'button',
            action: 'schedule_appointment',
          }
        ],
      };
    }

    return {
      type: 'table',
      content: {
        title: `${appointments.length} Agendamento(s)`,
        text: this.getAppointmentSummaryText(appointments),
        data: appointments.map(apt => ({
          id: apt.id,
          data: this.formatDateTime(apt.datetime),
          cliente: apt.clientName || 'Cliente não encontrado',
          tipo: apt.type || 'Consulta',
          status: this.translateStatus(apt.status),
          duracao: `${apt.duration || 60} min`,
        })),
        columns: [
          { key: 'data', label: 'Data/Hora', type: 'datetime' },
          { key: 'cliente', label: 'Cliente', type: 'string' },
          { key: 'tipo', label: 'Tipo', type: 'string' },
          { key: 'status', label: 'Status', type: 'string' },
          { key: 'duracao', label: 'Duração', type: 'string' },
        ],
      },
      actions: appointments.map(apt => ({
        id: `view_appointment_${apt.id}`,
        label: 'Ver Detalhes',
        type: 'button',
        action: 'view_appointment_details',
        parameters: { appointmentId: apt.id },
      })),
    };
  }

  /**
   * Format financial summary results
   */
  private formatFinancialResponse(input: FormattingInput): FormattedResponse {
    const records = input.data;

    if (!Array.isArray(records) || records.length === 0) {
      return {
        type: 'text',
        content: {
          title: 'Nenhum Registro Financeiro',
          text: 'Não há registros financeiros para o período especificado.',
        },
      };
    }

    // Calculate summary statistics
    const summary = this.calculateFinancialSummary(records);

    return {
      type: 'chart',
      content: {
        title: 'Resumo Financeiro',
        text: `Período analisado: ${summary.periodText}`,
        data: [
          {
            categoria: 'Receitas',
            valor: summary.totalRevenue,
            count: summary.revenueCount,
            percentage: summary.revenuePercentage,
          },
          {
            categoria: 'Despesas',
            valor: summary.totalExpenses,
            count: summary.expenseCount,
            percentage: summary.expensePercentage,
          },
          {
            categoria: 'Saldo',
            valor: summary.netBalance,
            count: summary.totalTransactions,
            percentage: 100,
          },
        ],
        columns: [
          { key: 'categoria', label: 'Categoria', type: 'string' },
          { key: 'valor', label: 'Valor (R$)', type: 'currency' },
          { key: 'count', label: 'Transações', type: 'number' },
          { key: 'percentage', label: 'Percentual', type: 'percentage' },
        ],
      },
      actions: [
        {
          id: 'detailed_report',
          label: 'Relatório Detalhado',
          type: 'button',
          action: 'generate_detailed_report',
          parameters: { period: summary.period },
        },
        {
          id: 'export_data',
          label: 'Exportar Dados',
          type: 'button',
          action: 'export_financial_data',
          parameters: { period: summary.period },
        },
      ],
    };
  }

  /**
   * Format help response
   */
  private formatHelpResponse(input: FormattingInput): FormattedResponse {
    const helpData = input.data;

    return {
      type: 'list',
      content: {
        title: 'Como Posso Ajudar?',
        text: 'Aqui estão as principais funcionalidades disponíveis:',
        data: helpData.helpTopics.map((topic: any) => ({
          title: topic.title,
          description: topic.description,
          examples: topic.examples,
        })),
      },
      actions: helpData.helpTopics.map((topic: any, index: number) => ({
        id: `help_topic_${index}`,
        label: `Usar ${topic.title}`,
        type: 'button',
        action: 'use_help_topic',
        parameters: { topic: topic.title.toLowerCase().replace(/\s+/g, '_') },
      })),
    };
  }

  /**
   * Format error response
   */
  private formatErrorResponse(message: string): FormattedResponse {
    return {
      type: 'error',
      content: {
        title: 'Erro',
        text: message,
      },
      actions: [
        {
          id: 'try_again',
          label: 'Tentar Novamente',
          type: 'button',
          action: 'retry_query',
        },
        {
          id: 'get_help',
          label: 'Obter Ajuda',
          type: 'button',
          action: 'show_help',
        },
      ],
    };
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   */
  private formatDateTime(dateTimeString: string): string {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('pt-BR');
    } catch {
      return dateTimeString;
    }
  }

  /**
   * Translate appointment status to Portuguese
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'no_show': 'Faltou',
    };

    return statusMap[status] || status;
  }

  /**
   * Get appointment summary text
   */
  private getAppointmentSummaryText(appointments: any[]): string {
    const statusCounts = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const parts = Object.entries(statusCounts).map(([status, count]) => 
      `${count} ${this.translateStatus(status).toLowerCase()}`
    );

    return `Total: ${parts.join(', ')}`;
  }

  /**
   * Calculate financial summary statistics
   */
  private calculateFinancialSummary(records: any[]): any {
    const revenue = records.filter(r => ['payment', 'invoice'].includes(r.type));
    const expenses = records.filter(r => ['expense', 'refund'].includes(r.type));

    const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, r) => sum + (r.amount || 0), 0);
    const netBalance = totalRevenue - totalExpenses;

    const totalTransactions = records.length;
    const revenuePercentage = totalTransactions > 0 ? (revenue.length / totalTransactions) * 100 : 0;
    const expensePercentage = totalTransactions > 0 ? (expenses.length / totalTransactions) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netBalance,
      revenueCount: revenue.length,
      expenseCount: expenses.length,
      totalTransactions,
      revenuePercentage: Math.round(revenuePercentage),
      expensePercentage: Math.round(expensePercentage),
      periodText: this.getPeriodText(records),
      period: this.getPeriod(records),
    };
  }

  /**
   * Get period text from records
   */
  private getPeriodText(records: any[]): string {
    if (records.length === 0) return 'Período não definido';

    const dates = records.map(r => new Date(r.timestamp)).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('pt-BR');
    }

    return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
  }

  /**
   * Get period object from records
   */
  private getPeriod(records: any[]): { start: string; end: string } {
    if (records.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }

    const dates = records.map(r => new Date(r.timestamp)).sort();
    return {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0],
    };
  }
}