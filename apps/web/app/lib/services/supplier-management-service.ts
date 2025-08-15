// =====================================================================================
// SUPPLIER MANAGEMENT SERVICE
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  ContractRenewalAlert,
  ContractStatus,
  CreateContractRequest,
  CreateEvaluationRequest,
  CreateQualityIssueRequest,
  CreateSupplierRequest,
  EvaluationType,
  IssueStatus,
  PerformanceGrade,
  QualityIssuesSummary,
  Supplier,
  SupplierAnalytics,
  SupplierCommunication,
  SupplierComparison,
  SupplierContact,
  SupplierContract,
  SupplierDashboardData,
  SupplierEvaluation,
  SupplierFilters,
  SupplierListResponse,
  SupplierPerformance,
  SupplierQualityIssue,
  SupplierRating,
  SupplierStatus,
  UpdateSupplierRequest,
} from '@/app/types/suppliers';

export class SupplierManagementService {
  private readonly supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  private async getSupabaseClient(): Promise<SupabaseClient> {
    return this.supabase;
  }

  // =====================================================================================
  // SUPPLIER CRUD OPERATIONS
  // =====================================================================================

  async createSupplier(
    clinicId: string,
    supplierData: CreateSupplierRequest
  ): Promise<Supplier> {
    const supabase = await this.getSupabaseClient();

    // Generate unique supplier code if not provided or verify uniqueness
    const supplierCode = supplierData.supplier_code;
    const { data: existingCode } = await supabase
      .from('suppliers')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('supplier_code', supplierCode)
      .single();

    if (existingCode) {
      throw new Error(`Código de fornecedor '${supplierCode}' já existe`);
    }

    const supplierToCreate = {
      ...supplierData,
      clinic_id: clinicId,
      supplier_code: supplierCode,
      status: 'active' as SupplierStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierToCreate])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao criar fornecedor: ${error.message}`);
    }

    return data as Supplier;
  }

  async getSupplier(
    clinicId: string,
    supplierId: string
  ): Promise<Supplier | null> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('id', supplierId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
    }

    return data as Supplier | null;
  }

  async updateSupplier(
    clinicId: string,
    supplierId: string,
    updates: UpdateSupplierRequest
  ): Promise<Supplier> {
    const supabase = await this.getSupabaseClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('clinic_id', clinicId)
      .eq('id', supplierId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
    }

    return data as Supplier;
  }

  async deleteSupplier(clinicId: string, supplierId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();

    // Check for dependencies
    const { data: contracts } = await supabase
      .from('supplier_contracts')
      .select('id')
      .eq('supplier_id', supplierId)
      .eq('status', 'active')
      .limit(1);

    if (contracts && contracts.length > 0) {
      throw new Error('Não é possível excluir fornecedor com contratos ativos');
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('clinic_id', clinicId)
      .eq('id', supplierId);

    if (error) {
      throw new Error(`Erro ao excluir fornecedor: ${error.message}`);
    }
  }

  async listSuppliers(
    clinicId: string,
    filters?: SupplierFilters,
    page = 1,
    limit = 50
  ): Promise<SupplierListResponse> {
    const supabase = await this.getSupabaseClient();

    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('clinic_id', clinicId);

    // Apply filters
    if (filters) {
      if (filters.supplier_type && filters.supplier_type.length > 0) {
        query = query.in('supplier_type', filters.supplier_type);
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.is_preferred !== undefined) {
        query = query.eq('is_preferred', filters.is_preferred);
      }

      if (filters.is_critical !== undefined) {
        query = query.eq('is_critical', filters.is_critical);
      }

      if (filters.performance_score_min !== undefined) {
        query = query.gte('performance_score', filters.performance_score_min);
      }

      if (filters.performance_score_max !== undefined) {
        query = query.lte('performance_score', filters.performance_score_max);
      }

      if (filters.search) {
        query = query.or(
          `supplier_name.ilike.%${filters.search}%,supplier_code.ilike.%${filters.search}%`
        );
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by name
    query = query.order('supplier_name');

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao listar fornecedores: ${error.message}`);
    }

    return {
      suppliers: data as Supplier[],
      total: count || 0,
      page,
      limit,
      filters,
    };
  }

  // =====================================================================================
  // CONTRACT MANAGEMENT
  // =====================================================================================

  async createContract(
    contractData: CreateContractRequest
  ): Promise<SupplierContract> {
    const supabase = await this.getSupabaseClient();

    // Check if contract number is unique for the supplier
    const { data: existingContract } = await supabase
      .from('supplier_contracts')
      .select('id')
      .eq('supplier_id', contractData.supplier_id)
      .eq('contract_number', contractData.contract_number)
      .single();

    if (existingContract) {
      throw new Error(
        `Número de contrato '${contractData.contract_number}' já existe para este fornecedor`
      );
    }

    const contractToCreate = {
      ...contractData,
      status: 'draft' as ContractStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_contracts')
      .insert([contractToCreate])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar contrato: ${error.message}`);
    }

    return data as SupplierContract;
  }

  async getContract(contractId: string): Promise<SupplierContract | null> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('supplier_contracts')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('id', contractId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar contrato: ${error.message}`);
    }

    return data as SupplierContract | null;
  }

  async updateContract(
    contractId: string,
    updates: Partial<CreateContractRequest>
  ): Promise<SupplierContract> {
    const supabase = await this.getSupabaseClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_contracts')
      .update(updateData)
      .eq('id', contractId)
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar contrato: ${error.message}`);
    }

    return data as SupplierContract;
  }

  async getSupplierContracts(supplierId: string): Promise<SupplierContract[]> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('supplier_contracts')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar contratos: ${error.message}`);
    }

    return data as SupplierContract[];
  }

  async getContractRenewalAlerts(
    clinicId: string,
    daysAhead = 90
  ): Promise<ContractRenewalAlert[]> {
    const supabase = await this.getSupabaseClient();

    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('contract_renewal_alerts')
      .select('*')
      .eq('clinic_id', clinicId)
      .lte('end_date', alertDate.toISOString())
      .order('days_until_expiration');

    if (error) {
      throw new Error(`Erro ao buscar alertas de renovação: ${error.message}`);
    }

    return data as ContractRenewalAlert[];
  }

  // =====================================================================================
  // CONTACT MANAGEMENT
  // =====================================================================================

  async createContact(contactData: any): Promise<SupplierContact> {
    const supabase = await this.getSupabaseClient();

    const contactToCreate = {
      ...contactData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_contacts')
      .insert([contactToCreate])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`);
    }

    return data as SupplierContact;
  }

  async getSupplierContacts(supplierId: string): Promise<SupplierContact[]> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('supplier_contacts')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('supplier_id', supplierId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('contact_name');

    if (error) {
      throw new Error(`Erro ao buscar contatos: ${error.message}`);
    }

    return data as SupplierContact[];
  }

  async updateContact(
    contactId: string,
    updates: Partial<any>
  ): Promise<SupplierContact> {
    const supabase = await this.getSupabaseClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_contacts')
      .update(updateData)
      .eq('id', contactId)
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar contato: ${error.message}`);
    }

    return data as SupplierContact;
  }

  // =====================================================================================
  // PERFORMANCE TRACKING
  // =====================================================================================

  async calculateSupplierPerformance(
    supplierId: string,
    periodStart: string,
    periodEnd: string,
    evaluationType: EvaluationType
  ): Promise<SupplierPerformance> {
    const supabase = await this.getSupabaseClient();

    // Get performance data from various sources
    const [ordersData, qualityData, financialData] = await Promise.all([
      this.getDeliveryPerformanceData(supplierId, periodStart, periodEnd),
      this.getQualityPerformanceData(supplierId, periodStart, periodEnd),
      this.getFinancialPerformanceData(supplierId, periodStart, periodEnd),
    ]);

    // Calculate performance scores
    const deliveryScore = this.calculateDeliveryScore(ordersData);
    const qualityScore = this.calculateQualityScore(qualityData);
    const overallScore = (deliveryScore + qualityScore) / 2;

    const performanceData = {
      supplier_id: supplierId,
      period_start: periodStart,
      period_end: periodEnd,
      evaluation_type: evaluationType,

      // Delivery Performance
      total_orders: ordersData.totalOrders,
      on_time_deliveries: ordersData.onTimeDeliveries,
      late_deliveries: ordersData.lateDeliveries,
      avg_delivery_days: ordersData.avgDeliveryDays,
      delivery_performance_score: deliveryScore,

      // Quality Performance
      total_items_received: qualityData.totalItems,
      defective_items: qualityData.defectiveItems,
      returned_items: qualityData.returnedItems,
      quality_score: qualityScore,

      // Financial Performance
      total_order_value: financialData.totalOrderValue,
      total_invoiced: financialData.totalInvoiced,
      total_paid: financialData.totalPaid,
      avg_payment_delay_days: financialData.avgPaymentDelay,
      cost_savings: financialData.costSavings,

      // Overall Performance
      overall_score: overallScore,
      performance_grade: this.calculatePerformanceGrade(overallScore),

      calculated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_performance')
      .insert([performanceData])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao calcular performance: ${error.message}`);
    }

    return data as SupplierPerformance;
  }

  async createEvaluation(
    evaluationData: CreateEvaluationRequest
  ): Promise<SupplierEvaluation> {
    const supabase = await this.getSupabaseClient();

    // Calculate weighted score and grade
    const weights = {
      delivery_reliability: 0.25,
      product_quality: 0.25,
      customer_service: 0.15,
      pricing_competitiveness: 0.15,
      technical_support: 0.1,
      documentation_quality: 0.1,
    };

    const weightedScore =
      evaluationData.delivery_reliability * weights.delivery_reliability +
      evaluationData.product_quality * weights.product_quality +
      evaluationData.customer_service * weights.customer_service +
      evaluationData.pricing_competitiveness * weights.pricing_competitiveness +
      evaluationData.technical_support * weights.technical_support +
      evaluationData.documentation_quality * weights.documentation_quality;

    const finalGrade = this.calculatePerformanceGrade(weightedScore);

    const evaluationToCreate = {
      ...evaluationData,
      evaluation_date: new Date().toISOString(),
      weighted_score: Number(weightedScore.toFixed(2)),
      final_grade: finalGrade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_evaluations')
      .insert([evaluationToCreate])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar avaliação: ${error.message}`);
    }

    return data as SupplierEvaluation;
  }

  async getSupplierEvaluations(
    supplierId: string
  ): Promise<SupplierEvaluation[]> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('supplier_evaluations')
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .eq('supplier_id', supplierId)
      .order('evaluation_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar avaliações: ${error.message}`);
    }

    return data as SupplierEvaluation[];
  }

  // =====================================================================================
  // QUALITY ISSUE MANAGEMENT
  // =====================================================================================

  async createQualityIssue(
    issueData: CreateQualityIssueRequest
  ): Promise<SupplierQualityIssue> {
    const supabase = await this.getSupabaseClient();

    const issueToCreate = {
      ...issueData,
      issue_date: new Date().toISOString(),
      status: 'open' as IssueStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_quality_issues')
      .insert([issueToCreate])
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar issue de qualidade: ${error.message}`);
    }

    return data as SupplierQualityIssue;
  }

  async updateQualityIssue(
    issueId: string,
    updates: Partial<CreateQualityIssueRequest & { status: IssueStatus }>
  ): Promise<SupplierQualityIssue> {
    const supabase = await this.getSupabaseClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_quality_issues')
      .update(updateData)
      .eq('id', issueId)
      .select(`
        *,
        supplier:suppliers(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar issue: ${error.message}`);
    }

    return data as SupplierQualityIssue;
  }

  async getQualityIssuesSummary(
    clinicId: string
  ): Promise<QualityIssuesSummary[]> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('quality_issues_summary')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('open_issues', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar resumo de issues: ${error.message}`);
    }

    return data as QualityIssuesSummary[];
  }

  // =====================================================================================
  // COMMUNICATION MANAGEMENT
  // =====================================================================================

  async createCommunication(
    communicationData: any
  ): Promise<SupplierCommunication> {
    const supabase = await this.getSupabaseClient();

    const communicationToCreate = {
      ...communicationData,
      communication_date: new Date().toISOString(),
      status: 'sent' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('supplier_communications')
      .insert([communicationToCreate])
      .select(`
        *,
        supplier:suppliers(*),
        contact:supplier_contacts(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar comunicação: ${error.message}`);
    }

    return data as SupplierCommunication;
  }

  async getSupplierCommunications(
    supplierId: string
  ): Promise<SupplierCommunication[]> {
    const supabase = await this.getSupabaseClient();

    const { data, error } = await supabase
      .from('supplier_communications')
      .select(`
        *,
        supplier:suppliers(*),
        contact:supplier_contacts(*)
      `)
      .eq('supplier_id', supplierId)
      .order('communication_date', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar comunicações: ${error.message}`);
    }

    return data as SupplierCommunication[];
  }

  // =====================================================================================
  // DASHBOARD AND ANALYTICS
  // =====================================================================================

  async getDashboardData(clinicId: string): Promise<SupplierDashboardData> {
    const supabase = await this.getSupabaseClient();

    // Get basic supplier counts
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select(
        'id, supplier_type, status, is_preferred, is_critical, performance_score'
      )
      .eq('clinic_id', clinicId);

    const totalSuppliers = suppliers?.length || 0;
    const activeSuppliers =
      suppliers?.filter((s) => s.status === 'active').length || 0;
    const preferredSuppliers =
      suppliers?.filter((s) => s.is_preferred).length || 0;
    const criticalSuppliers =
      suppliers?.filter((s) => s.is_critical).length || 0;

    const avgPerformanceScore = suppliers?.length
      ? suppliers.reduce((sum, s) => sum + (s.performance_score || 0), 0) /
        suppliers.length
      : 0;

    // Get suppliers by type
    const suppliersByType =
      suppliers?.reduce((acc: any, supplier: any) => {
        acc[supplier.supplier_type] = (acc[supplier.supplier_type] || 0) + 1;
        return acc;
      }, {} as any) || ({} as any);

    // Get contract renewal alerts
    const contractAlerts = await this.getContractRenewalAlerts(clinicId);

    // Get recent communications
    const { data: recentCommunications } = await supabase
      .from('supplier_communications')
      .select(`
        *,
        supplier:suppliers(*),
        contact:supplier_contacts(*)
      `)
      .eq('supplier.clinic_id', clinicId)
      .order('communication_date', { ascending: false })
      .limit(10);

    // Get quality issues count
    const { data: qualityIssues, count: openQualityIssues } = await supabase
      .from('supplier_quality_issues')
      .select('*', { count: 'exact' })
      .eq('supplier.clinic_id', clinicId)
      .eq('status', 'open');

    return {
      total_suppliers: totalSuppliers,
      active_suppliers: activeSuppliers,
      preferred_suppliers: preferredSuppliers,
      critical_suppliers: criticalSuppliers,
      avg_performance_score: Number(avgPerformanceScore.toFixed(2)),
      suppliers_by_type: suppliersByType as any,
      suppliers_by_rating: {} as Record<SupplierRating, number>,
      contract_renewals_due: contractAlerts.length,
      open_quality_issues: openQualityIssues || 0,
      recent_communications:
        (recentCommunications as SupplierCommunication[]) || [],
      top_performing_suppliers: [],
      contract_alerts: contractAlerts,
    };
  }

  async getSupplierAnalytics(
    _clinicId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<SupplierAnalytics> {
    const _supabase = await this.getSupabaseClient();

    // This would require complex queries joining with orders, invoices, etc.
    // For now, return basic structure
    return {
      period_start: periodStart,
      period_end: periodEnd,
      total_spend: 0,
      supplier_count: 0,
      avg_performance_score: 0,
      cost_savings: 0,
      top_categories: [],
      performance_trends: [],
      quality_metrics: {
        total_issues: 0,
        critical_issues: 0,
        avg_resolution_time: 0,
        issue_trends: [],
      },
    };
  }

  async compareSuppliers(supplierIds: string[]): Promise<SupplierComparison> {
    const supabase = await this.getSupabaseClient();

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .in('id', supplierIds);

    if (error) {
      throw new Error(
        `Erro ao buscar fornecedores para comparação: ${error.message}`
      );
    }

    // This would include complex performance metrics comparison
    return {
      suppliers: suppliers as Supplier[],
      comparison_criteria: [],
      performance_metrics: {},
      recommendations: [],
    };
  }

  // =====================================================================================
  // HELPER METHODS
  // =====================================================================================

  private async getDeliveryPerformanceData(
    _supplierId: string,
    _periodStart: string,
    _periodEnd: string
  ): Promise<any> {
    // This would query actual orders/deliveries data
    return {
      totalOrders: 0,
      onTimeDeliveries: 0,
      lateDeliveries: 0,
      avgDeliveryDays: 0,
    };
  }

  private async getQualityPerformanceData(
    supplierId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<any> {
    const supabase = await this.getSupabaseClient();

    const { data: qualityIssues } = await supabase
      .from('supplier_quality_issues')
      .select('*')
      .eq('supplier_id', supplierId)
      .gte('issue_date', periodStart)
      .lte('issue_date', periodEnd);

    return {
      totalItems: 1000, // This would come from actual orders
      defectiveItems: qualityIssues?.length || 0,
      returnedItems:
        qualityIssues?.filter((i) => i.issue_type === 'defective_product')
          .length || 0,
    };
  }

  private async getFinancialPerformanceData(
    _supplierId: string,
    _periodStart: string,
    _periodEnd: string
  ): Promise<any> {
    // This would query actual financial data
    return {
      totalOrderValue: 0,
      totalInvoiced: 0,
      totalPaid: 0,
      avgPaymentDelay: 0,
      costSavings: 0,
    };
  }

  private calculateDeliveryScore(data: any): number {
    if (data.totalOrders === 0) {
      return 10;
    }
    const onTimePercentage = (data.onTimeDeliveries / data.totalOrders) * 100;
    return Math.min(10, Math.max(0, onTimePercentage / 10));
  }

  private calculateQualityScore(data: any): number {
    if (data.totalItems === 0) {
      return 10;
    }
    const defectivePercentage = (data.defectiveItems / data.totalItems) * 100;
    return Math.min(10, Math.max(0, 10 - defectivePercentage));
  }

  private calculatePerformanceGrade(score: number): PerformanceGrade {
    if (score >= 9.5) {
      return 'A+';
    }
    if (score >= 9.0) {
      return 'A';
    }
    if (score >= 8.5) {
      return 'B+';
    }
    if (score >= 8.0) {
      return 'B';
    }
    if (score >= 7.5) {
      return 'C+';
    }
    if (score >= 7.0) {
      return 'C';
    }
    if (score >= 6.0) {
      return 'D';
    }
    return 'F';
  }
}
