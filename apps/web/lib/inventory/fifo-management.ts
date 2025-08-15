/**
 * Story 11.3: FIFO Management and Batch Control System
 * Advanced FIFO optimization with expiry management and intelligent batch selection
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { StockOutputManager, BatchStock, FIFOResult } from './stock-output-management';

export interface FIFOAnalysis {
  produto_id: string;
  nome_produto: string;
  lotes_disponiveis: BatchStock[];
  lotes_priorizados: BatchStock[];
  lotes_vencendo: BatchStock[];
  economia_fifo: number;
  desperdicioEvitado: number;
  recomendacoes: FIFORecommendation[];
}

export interface FIFORecommendation {
  tipo: 'usar_prioritario' | 'transferir_lote' | 'promocao_uso' | 'descarte_iminente';
  lote_id: string;
  numero_lote: string;
  dias_para_vencer: number;
  quantidade_disponivel: number;
  acao_recomendada: string;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  impacto_financeiro: number;
}

export interface ExpiryAlert {
  id: string;
  produto_id: string;
  nome_produto: string;
  lote_id: string;
  numero_lote: string;
  data_validade: Date;
  dias_para_vencer: number;
  quantidade_disponivel: number;
  valor_estimado: number;
  centro_custo_principal: string;
  acoes_disponiveis: ExpiryAction[];
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface ExpiryAction {
  tipo: 'uso_prioritario' | 'transferencia' | 'promocao' | 'descarte' | 'devolucao';
  descricao: string;
  impacto_financeiro: number;
  prazo_execucao: number; // dias
  probabilidade_sucesso: number; // 0-100
}

export interface BatchMovement {
  id: string;
  lote_id: string;
  tipo_movimento: 'entrada' | 'saida' | 'transferencia' | 'ajuste' | 'bloqueio';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_posterior: number;
  data_movimento: Date;
  responsavel: string;
  motivo: string;
  documento_origem?: string;
  auditoria_completa: boolean;
}

export interface FIFOOptimizationConfig {
  margem_seguranca_dias: number; // Dias antes do vencimento para alertar
  percentual_uso_automatico: number; // % para uso automático em procedimentos
  priorizar_por_valor: boolean; // Priorizar lotes de maior valor
  permitir_quebra_fifo: boolean; // Permitir quebra de FIFO por motivos específicos
  notificacoes_ativas: boolean;
  integrar_com_compras: boolean; // Integrar com sistema de compras
}

/**
 * FIFO Management System
 * Advanced batch control with expiry optimization and intelligent selection
 */
export class FIFOManager {
  private supabase = createClientComponentClient<Database>();
  private stockOutputManager = new StockOutputManager();

  /**
   * Get comprehensive FIFO analysis for all products or specific product
   */
  async getFIFOAnalysis(productId?: string): Promise<{ 
    data: FIFOAnalysis[] | null; 
    error: string | null 
  }> {
    try {
      let query = this.supabase
        .from('lotes_estoque')
        .select(`
          *,
          produto:produtos_estoque(nome, codigo_interno, categoria, preco_custo)
        `)
        .eq('status', 'disponivel')
        .gt('quantidade_disponivel', 0);

      if (productId) {
        query = query.eq('produto_id', productId);
      }

      const { data: batches, error } = await query
        .order('data_validade', { ascending: true });

      if (error) throw error;

      // Group batches by product
      const batchesByProduct = batches?.reduce((acc, batch) => {
        const productId = batch.produto_id;
        if (!acc[productId]) {
          acc[productId] = [];
        }
        acc[productId].push(batch);
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Generate analysis for each product
      const analyses = Object.entries(batchesByProduct).map(([productId, productBatches]) => {
        return this.analyzeProductFIFO(productId, productBatches);
      });

      const resolvedAnalyses = await Promise.all(analyses);

      return {
        data: resolvedAnalyses,
        error: null
      };

    } catch (error) {
      console.error('Error getting FIFO analysis:', error);
      return {
        data: null,
        error: 'Erro ao analisar FIFO'
      };
    }
  }

  /**
   * Get expiry alerts for products nearing expiration
   */
  async getExpiryAlerts(daysAhead: number = 30): Promise<{ 
    data: ExpiryAlert[] | null; 
    error: string | null 
  }> {
    try {
      const { data: expiringBatches, error } = await this.supabase
        .from('lotes_estoque')
        .select(`
          *,
          produto:produtos_estoque(nome, codigo_interno, preco_custo)
        `)
        .eq('status', 'disponivel')
        .gt('quantidade_disponivel', 0)
        .lte('dias_para_vencer', daysAhead)
        .order('dias_para_vencer', { ascending: true });

      if (error) throw error;

      const alerts = expiringBatches?.map(batch => {
        const daysToExpiry = batch.dias_para_vencer;
        const estimatedValue = batch.quantidade_disponivel * (batch.produto?.preco_custo || 0);

        return {
          id: `alert-${batch.id}`,
          produto_id: batch.produto_id,
          nome_produto: batch.produto?.nome || 'Produto não identificado',
          lote_id: batch.id,
          numero_lote: batch.numero_lote,
          data_validade: new Date(batch.data_validade),
          dias_para_vencer: daysToExpiry,
          quantidade_disponivel: batch.quantidade_disponivel,
          valor_estimado: estimatedValue,
          centro_custo_principal: batch.localizacao_principal,
          acoes_disponiveis: this.generateExpiryActions(batch, estimatedValue),
          prioridade: this.calculateExpiryPriority(daysToExpiry, estimatedValue)
        } as ExpiryAlert;
      }) || [];

      return {
        data: alerts,
        error: null
      };

    } catch (error) {
      console.error('Error getting expiry alerts:', error);
      return {
        data: null,
        error: 'Erro ao buscar alertas de vencimento'
      };
    }
  }

  /**
   * Optimize FIFO selection for specific consumption
   */
  async optimizeFIFOSelection(requests: Array<{
    produto_id: string;
    quantidade_necessaria: number;
    centro_custo_id: string;
    urgente?: boolean;
  }>): Promise<{ 
    data: FIFOResult[] | null; 
    error: string | null 
  }> {
    try {
      const optimizedSelections: FIFOResult[] = [];

      for (const request of requests) {
        const selection = await this.selectOptimalBatches(request);
        optimizedSelections.push(...selection);
      }

      return {
        data: optimizedSelections,
        error: null
      };

    } catch (error) {
      console.error('Error optimizing FIFO selection:', error);
      return {
        data: null,
        error: 'Erro ao otimizar seleção FIFO'
      };
    }
  }

  /**
   * Execute batch transfer between cost centers
   */
  async executeBatchTransfer(data: {
    lote_id: string;
    centro_custo_origem: string;
    centro_custo_destino: string;
    quantidade: number;
    motivo: string;
    urgente?: boolean;
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Validate batch availability
      const { data: batch } = await this.supabase
        .from('lotes_estoque')
        .select('*')
        .eq('id', data.lote_id)
        .single();

      if (!batch) {
        return { success: false, error: 'Lote não encontrado' };
      }

      if (batch.quantidade_disponivel < data.quantidade) {
        return { success: false, error: 'Quantidade insuficiente no lote' };
      }

      // 2. Create transfer record
      const transferNumber = await this.generateTransferNumber();

      const { data: transfer, error: transferError } = await this.supabase
        .from('transferencias_internas')
        .insert({
          numero_transferencia: transferNumber,
          centro_custo_origem: data.centro_custo_origem,
          centro_custo_destino: data.centro_custo_destino,
          localizacao_origem: batch.localizacao_principal,
          localizacao_destino: data.centro_custo_destino,
          motivo_transferencia: data.motivo,
          urgente: data.urgente || false,
          quantidade_total: data.quantidade,
          valor_total: data.quantidade * (batch.custo_unitario || 0),
          status: 'aprovada', // Auto-approve for FIFO optimization
          aprovado: true,
          aprovado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (transferError) throw transferError;

      // 3. Create transfer item
      await this.supabase
        .from('itens_transferencia_interna')
        .insert({
          transferencia_id: transfer.id,
          produto_id: batch.produto_id,
          lote_id: batch.id,
          quantidade_solicitada: data.quantidade,
          quantidade_transferida: data.quantidade,
          status: 'transferido'
        });

      // 4. Update batch location and quantities
      await this.supabase
        .from('lotes_estoque')
        .update({
          localizacao_principal: data.centro_custo_destino,
          quantidade_atual: batch.quantidade_atual - data.quantidade,
          ultima_movimentacao: new Date().toISOString()
        })
        .eq('id', data.lote_id);

      // 5. Log movement
      await this.logBatchMovement({
        lote_id: data.lote_id,
        tipo_movimento: 'transferencia',
        quantidade: -data.quantidade,
        quantidade_anterior: batch.quantidade_atual,
        quantidade_posterior: batch.quantidade_atual - data.quantidade,
        motivo: `Transferência FIFO: ${data.motivo}`,
        documento_origem: transfer.numero_transferencia
      });

      return { success: true, error: null };

    } catch (error) {
      console.error('Error executing batch transfer:', error);
      return { success: false, error: 'Erro ao executar transferência' };
    }
  }

  /**
   * Block expired or near-expiry batches
   */
  async blockExpiringBatches(daysThreshold: number = 0): Promise<{ 
    blocked: number; 
    error: string | null 
  }> {
    try {
      const { data: expiringBatches } = await this.supabase
        .from('lotes_estoque')
        .select('id, numero_lote, produto_id, dias_para_vencer')
        .eq('status', 'disponivel')
        .eq('bloqueado', false)
        .lte('dias_para_vencer', daysThreshold);

      if (!expiringBatches || expiringBatches.length === 0) {
        return { blocked: 0, error: null };
      }

      // Block batches
      const { error: blockError } = await this.supabase
        .from('lotes_estoque')
        .update({
          bloqueado: true,
          status: daysThreshold <= 0 ? 'vencido' : 'bloqueado',
          motivo_bloqueio: daysThreshold <= 0 
            ? 'Produto vencido - bloqueio automático'
            : `Próximo ao vencimento - ${daysThreshold} dias`
        })
        .in('id', expiringBatches.map(b => b.id));

      if (blockError) throw blockError;

      // Log movements for all blocked batches
      for (const batch of expiringBatches) {
        await this.logBatchMovement({
          lote_id: batch.id,
          tipo_movimento: 'bloqueio',
          quantidade: 0,
          quantidade_anterior: 0,
          quantidade_posterior: 0,
          motivo: daysThreshold <= 0 ? 'Bloqueio por vencimento' : 'Bloqueio preventivo'
        });
      }

      return { blocked: expiringBatches.length, error: null };

    } catch (error) {
      console.error('Error blocking expiring batches:', error);
      return { blocked: 0, error: 'Erro ao bloquear lotes vencidos' };
    }
  }

  /**
   * Get batch movement history
   */
  async getBatchMovementHistory(loteId: string): Promise<{ 
    data: BatchMovement[] | null; 
    error: string | null 
  }> {
    try {
      const { data: movements, error } = await this.supabase
        .from('movimentacoes_lote')
        .select(`
          *,
          responsavel:auth.users(nome)
        `)
        .eq('lote_id', loteId)
        .order('data_movimento', { ascending: false });

      if (error) throw error;

      return {
        data: movements as BatchMovement[],
        error: null
      };

    } catch (error) {
      console.error('Error getting batch movement history:', error);
      return {
        data: null,
        error: 'Erro ao buscar histórico de movimentações'
      };
    }
  }

  /**
   * Analyze FIFO for specific product
   */
  private async analyzeProductFIFO(productId: string, batches: any[]): Promise<FIFOAnalysis> {
    // Sort batches by FIFO priority
    const sortedBatches = batches.sort((a, b) => {
      if (a.data_validade && b.data_validade) {
        return new Date(a.data_validade).getTime() - new Date(b.data_validade).getTime();
      }
      return a.prioridade_uso - b.prioridade_uso;
    });

    // Categorize batches
    const lotesPriorizados = sortedBatches.filter(b => b.prioridade_uso <= 3);
    const lotesVencendo = sortedBatches.filter(b => b.dias_para_vencer <= 30);

    // Calculate FIFO economy (simplified calculation)
    const economiaFifo = this.calculateFIFOEconomy(sortedBatches);
    const desperdicioEvitado = this.calculateWastePrevention(lotesVencendo);

    // Generate recommendations
    const recomendacoes = this.generateFIFORecommendations(sortedBatches);

    return {
      produto_id: productId,
      nome_produto: batches[0]?.produto?.nome || 'Produto não identificado',
      lotes_disponiveis: sortedBatches,
      lotes_priorizados: lotesPriorizados,
      lotes_vencendo: lotesVencendo,
      economia_fifo: economiaFifo,
      desperdicioEvitado: desperdicioEvitado,
      recomendacoes: recomendacoes
    };
  }

  /**
   * Select optimal batches for consumption
   */
  private async selectOptimalBatches(request: {
    produto_id: string;
    quantidade_necessaria: number;
    centro_custo_id: string;
    urgente?: boolean;
  }): Promise<FIFOResult[]> {
    const { data: availableBatches } = await this.supabase
      .from('lotes_estoque')
      .select('*')
      .eq('produto_id', request.produto_id)
      .eq('status', 'disponivel')
      .gt('quantidade_disponivel', 0)
      .eq('bloqueado', false)
      .order('data_validade', { ascending: true })
      .order('prioridade_uso', { ascending: true });

    if (!availableBatches || availableBatches.length === 0) {
      return [];
    }

    const selectedBatches: FIFOResult[] = [];
    let remainingQuantity = request.quantidade_necessaria;

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const quantityToTake = Math.min(remainingQuantity, batch.quantidade_disponivel);

      selectedBatches.push({
        lote_id: batch.id,
        produto_id: batch.produto_id,
        numero_lote: batch.numero_lote,
        quantidade_disponivel: quantityToTake,
        data_validade: new Date(batch.data_validade),
        dias_para_vencer: batch.dias_para_vencer,
        prioridade_uso: batch.prioridade_uso,
        recomendado: batch.dias_para_vencer <= 30 || batch.prioridade_uso <= 3,
        motivo_recomendacao: this.getRecommendationReason(batch)
      });

      remainingQuantity -= quantityToTake;
    }

    return selectedBatches;
  }

  /**
   * Generate expiry actions for a batch
   */
  private generateExpiryActions(batch: any, estimatedValue: number): ExpiryAction[] {
    const actions: ExpiryAction[] = [];
    const daysToExpiry = batch.dias_para_vencer;

    if (daysToExpiry > 7) {
      actions.push({
        tipo: 'uso_prioritario',
        descricao: 'Priorizar uso em procedimentos',
        impacto_financeiro: estimatedValue * 0.95,
        prazo_execucao: daysToExpiry - 2,
        probabilidade_sucesso: 85
      });

      actions.push({
        tipo: 'transferencia',
        descricao: 'Transferir para setor de maior consumo',
        impacto_financeiro: estimatedValue * 0.90,
        prazo_execucao: 3,
        probabilidade_sucesso: 70
      });
    }

    if (daysToExpiry > 3) {
      actions.push({
        tipo: 'promocao',
        descricao: 'Promoção interna ou desconto',
        impacto_financeiro: estimatedValue * 0.70,
        prazo_execucao: daysToExpiry,
        probabilidade_sucesso: 60
      });
    }

    if (daysToExpiry <= 7) {
      actions.push({
        tipo: 'devolucao',
        descricao: 'Devolução ao fornecedor (se possível)',
        impacto_financeiro: estimatedValue * 0.80,
        prazo_execucao: 2,
        probabilidade_sucesso: 30
      });
    }

    actions.push({
      tipo: 'descarte',
      descricao: 'Descarte controlado',
      impacto_financeiro: 0,
      prazo_execucao: 1,
      probabilidade_sucesso: 100
    });

    return actions;
  }

  /**
   * Calculate expiry priority based on days and value
   */
  private calculateExpiryPriority(daysToExpiry: number, estimatedValue: number): 'baixa' | 'media' | 'alta' | 'critica' {
    if (daysToExpiry <= 0) return 'critica';
    if (daysToExpiry <= 3) return 'alta';
    if (daysToExpiry <= 7 || estimatedValue > 1000) return 'media';
    return 'baixa';
  }

  /**
   * Get recommendation reason for batch
   */
  private getRecommendationReason(batch: any): string {
    if (batch.dias_para_vencer <= 7) return 'Vencimento iminente';
    if (batch.dias_para_vencer <= 30) return 'Próximo ao vencimento';
    if (batch.prioridade_uso <= 3) return 'Alta prioridade FIFO';
    return 'FIFO otimizado';
  }

  /**
   * Calculate FIFO economy (simplified)
   */
  private calculateFIFOEconomy(batches: any[]): number {
    // This would contain complex calculations
    // For now, returning a placeholder
    return batches.length * 50; // R$ 50 per batch in FIFO savings
  }

  /**
   * Calculate waste prevention value
   */
  private calculateWastePrevention(expiringBatches: any[]): number {
    return expiringBatches.reduce((total, batch) => {
      return total + (batch.quantidade_disponivel * (batch.custo_unitario || 0));
    }, 0);
  }

  /**
   * Generate FIFO recommendations
   */
  private generateFIFORecommendations(batches: any[]): FIFORecommendation[] {
    const recommendations: FIFORecommendation[] = [];

    batches.forEach(batch => {
      if (batch.dias_para_vencer <= 7) {
        recommendations.push({
          tipo: 'usar_prioritario',
          lote_id: batch.id,
          numero_lote: batch.numero_lote,
          dias_para_vencer: batch.dias_para_vencer,
          quantidade_disponivel: batch.quantidade_disponivel,
          acao_recomendada: 'Usar prioritariamente em até 3 dias',
          urgencia: 'critica',
          impacto_financeiro: batch.quantidade_disponivel * (batch.custo_unitario || 0)
        });
      } else if (batch.dias_para_vencer <= 30) {
        recommendations.push({
          tipo: 'promocao_uso',
          lote_id: batch.id,
          numero_lote: batch.numero_lote,
          dias_para_vencer: batch.dias_para_vencer,
          quantidade_disponivel: batch.quantidade_disponivel,
          acao_recomendada: 'Promover uso em procedimentos adequados',
          urgencia: 'media',
          impacto_financeiro: batch.quantidade_disponivel * (batch.custo_unitario || 0) * 0.8
        });
      }
    });

    return recommendations;
  }

  /**
   * Log batch movement
   */
  private async logBatchMovement(movement: Omit<BatchMovement, 'id' | 'data_movimento' | 'responsavel' | 'auditoria_completa'>): Promise<void> {
    try {
      await this.supabase
        .from('movimentacoes_lote')
        .insert({
          ...movement,
          data_movimento: new Date().toISOString(),
          auditoria_completa: true
        });
    } catch (error) {
      console.error('Error logging batch movement:', error);
    }
  }

  /**
   * Generate transfer number
   */
  private async generateTransferNumber(): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const { count } = await this.supabase
      .from('transferencias_internas')
      .select('*', { count: 'exact', head: true })
      .like('numero_transferencia', `TRF-${datePrefix}%`);

    const sequentialNumber = String((count || 0) + 1).padStart(4, '0');
    return `TRF-${datePrefix}-${sequentialNumber}`;
  }
}

// Export default instance
export const fifoManager = new FIFOManager();