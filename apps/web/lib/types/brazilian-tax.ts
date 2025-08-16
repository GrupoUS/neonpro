// Brazilian Tax System Types
// Story 5.5: Comprehensive types for Brazilian tax compliance

// Tax Regime Types
export type TaxRegime = 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
export type SimplesNacionalAnexo = 'I' | 'II' | 'III' | 'IV' | 'V';
export type DocumentType = 'nfe' | 'nfce' | 'nfse';
export type DocumentModel = '55' | '65' | '57';
export type NFEStatus = 'draft' | 'authorized' | 'cancelled' | 'rejected';
export type ComplianceReportType =
  | 'sped_ecd'
  | 'sped_ecf'
  | 'livro_registro'
  | 'dctf'
  | 'defis';
export type SubmissionStatus = 'pending' | 'sent' | 'accepted' | 'rejected';
export type CalculationMethod = 'automatic' | 'manual' | 'imported';
export type EntryOrigin = 'system' | 'manual' | 'imported';
export type TaxationPIS = 'cumulativo' | 'nao_cumulativo';

// Address Interface for Brazilian Standards
export type BrazilianAddress = {
  logradouro: string; // Street name
  numero: string; // Street number
  complemento?: string; // Additional address info
  bairro: string; // Neighborhood
  cidade: string; // City
  uf: string; // State (2 letters)
  cep: string; // Postal code (XXXXX-XXX)
};

// Tax Configuration Interface
export type TaxConfiguration = {
  id: string;
  clinic_id: string;

  // Brazilian Tax Identification
  cnpj: string; // XX.XXX.XXX/XXXX-XX
  inscricao_estadual?: string; // State registration
  inscricao_municipal?: string; // Municipal registration

  // Tax Regime
  regime_tributario: TaxRegime;
  optante_simples_nacional: boolean;

  // Tax Rates (percentages)
  icms_rate: number; // ICMS - State tax on goods/services
  iss_rate: number; // ISS - Municipal service tax
  pis_rate: number; // PIS - Social contribution
  cofins_rate: number; // COFINS - Social contribution
  irpj_rate: number; // IRPJ - Corporate income tax
  csll_rate: number; // CSLL - Social contribution on net profit

  // Simples Nacional
  simples_nacional_anexo: SimplesNacionalAnexo;
  simples_nacional_rate: number;

  // Address
  endereco: BrazilianAddress;

  // Status
  active: boolean;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};

// Tax Calculation Details
export type TaxCalculationDetail = {
  base_calculo: number; // Calculation base
  aliquota: number; // Tax rate
  valor: number; // Tax amount
  situacao_tributaria?: string; // Tax situation code
  codigo_municipio?: string; // Municipal code (for ISS)
  anexo?: SimplesNacionalAnexo; // Simples Nacional annex
};

// Service Item for NFe
export type ServiceItem = {
  codigo: string; // Service code
  descricao: string; // Service description
  quantidade: number; // Quantity
  valor_unitario: number; // Unit price
  valor_total: number; // Total value
  codigo_servico?: string; // Tax service code
  iss_retido?: boolean; // ISS withheld
  discriminacao?: string; // Detailed description
};

// Customer Information for NFe
export type CustomerInfo = {
  cnpj_cpf: string; // CNPJ or CPF
  nome: string; // Name
  endereco: BrazilianAddress;
  inscricao_estadual?: string;
  email?: string;
  telefone?: string;
};

// NFe Document Interface
export type NFEDocument = {
  id: string;
  clinic_id: string;
  invoice_id?: string;

  // NFe Identification
  numero_nfe: number; // NFe number
  serie_nfe: number; // NFe series
  chave_acesso?: string; // 44-digit access key

  // Document Information
  tipo_documento: DocumentType;
  modelo_documento: DocumentModel;
  natureza_operacao: string;

  // Tax Information
  valor_total: number;
  valor_base_calculo?: number;
  valor_icms: number;
  valor_iss: number;
  valor_pis: number;
  valor_cofins: number;

  // Customer
  cliente_cnpj_cpf?: string;
  cliente_nome?: string;
  cliente_endereco?: BrazilianAddress;

  // Services
  servicos: ServiceItem[];

  // Status and Workflow
  status: NFEStatus;
  data_emissao: string;
  data_autorizacao?: string;
  protocolo_autorizacao?: string;

  // Files
  xml_content?: string;
  pdf_url?: string;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
};

// Tax Calculation Interface
export type TaxCalculation = {
  id: string;
  clinic_id: string;
  invoice_id?: string;
  nfe_id?: string;

  // Base Information
  valor_base: number;
  tipo_servico: string;
  codigo_servico?: string;

  // Individual Tax Calculations
  icms_calculation: TaxCalculationDetail;
  iss_calculation: TaxCalculationDetail;
  pis_calculation: TaxCalculationDetail;
  cofins_calculation: TaxCalculationDetail;
  simples_nacional_calculation: TaxCalculationDetail;

  // Total
  total_impostos: number;

  // Metadata
  calculation_date: string;
  calculation_method: CalculationMethod;

  // Audit
  created_at: string;
  updated_at: string;
};

// SPED Entry Interface
export type SPEDEntry = {
  id: string;
  clinic_id: string;

  // SPED Information
  periodo_apuracao: string; // YYYY-MM-DD format
  tipo_escrituracao: string; // ECD, ECF, EFD

  // Entry Details
  codigo_conta: string; // Chart of accounts code
  descricao_conta: string; // Account description
  valor_debito: number; // Debit amount
  valor_credito: number; // Credit amount

  // Document References
  numero_documento?: string;
  data_documento?: string;
  historico?: string;

  // Tax Information
  cfop?: string; // Operation/Service Tax Code
  cst_pis?: string; // PIS tax situation
  cst_cofins?: string; // COFINS tax situation

  // Classification
  natureza_operacao?: string;
  origem_lancamento: EntryOrigin;

  // Validation
  validado: boolean;
  data_validacao?: string;

  // Audit
  created_at: string;
  updated_at: string;
};

// Compliance Report Interface
export type TaxComplianceReport = {
  id: string;
  clinic_id: string;

  // Report Information
  tipo_relatorio: ComplianceReportType;
  periodo_referencia: string;
  descricao?: string;

  // Report Data
  conteudo_relatorio: Record<string, any>;
  arquivo_gerado?: string;
  hash_arquivo?: string;

  // Submission
  status_envio: SubmissionStatus;
  data_envio?: string;
  protocolo_receita?: string;

  // Validation
  validacoes_executadas: string[];
  erros_encontrados: string[];

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
};

// Service Tax Code Interface
export type ServiceTaxCode = {
  codigo_servico: string; // Format: XX.XX
  descricao_servico: string;
  categoria?: string;

  // Tax Configuration
  iss_aliquota_minima: number;
  iss_aliquota_maxima: number;
  tributacao_pis_cofins: TaxationPIS;

  // Healthcare Specific
  aplicavel_saude: boolean;
  observacoes?: string;

  // Status
  ativo: boolean;

  // Audit
  created_at: string;
  updated_at: string;
};

// Tax Calculation Request
export type TaxCalculationRequest = {
  clinic_id: string;
  valor_base: number;
  tipo_servico: string;
  codigo_servico?: string;
  customer_info?: CustomerInfo;
  regime_tributario?: TaxRegime;
};

// Tax Calculation Response
export type TaxCalculationResponse = {
  calculation: TaxCalculation;
  breakdown: {
    icms: TaxCalculationDetail;
    iss: TaxCalculationDetail;
    pis: TaxCalculationDetail;
    cofins: TaxCalculationDetail;
    simples_nacional?: TaxCalculationDetail;
  };
  total_impostos: number;
  aliquota_efetiva: number; // Effective tax rate
};

// NFe Generation Request
export type NFEGenerationRequest = {
  clinic_id: string;
  invoice_id?: string;
  customer: CustomerInfo;
  services: ServiceItem[];
  natureza_operacao?: string;
  observacoes?: string;
};

// NFe Generation Response
export type NFEGenerationResponse = {
  nfe: NFEDocument;
  xml_content: string;
  chave_acesso: string;
  qr_code?: string;
  validation_errors?: string[];
};

// Tax Dashboard Data
export type TaxDashboardData = {
  periodo: string;
  total_faturamento: number;
  total_impostos: number;
  aliquota_efetiva: number;

  // By Tax Type
  impostos_por_tipo: {
    icms: number;
    iss: number;
    pis: number;
    cofins: number;
    simples_nacional: number;
  };

  // NFe Statistics
  nfe_emitidas: number;
  nfe_autorizadas: number;
  nfe_rejeitadas: number;

  // Compliance Status
  compliance_status: {
    sped_em_dia: boolean;
    ultimo_envio_sped?: string;
    proxima_obrigacao?: string;
  };

  // Trends
  trends: {
    faturamento_mes_anterior: number;
    impostos_mes_anterior: number;
    variacao_faturamento: number;
    variacao_impostos: number;
  };
};

// Export all types
export type {
  TaxRegime,
  SimplesNacionalAnexo,
  DocumentType,
  DocumentModel,
  NFEStatus,
  ComplianceReportType,
  SubmissionStatus,
  CalculationMethod,
  EntryOrigin,
  TaxationPIS,
  BrazilianAddress,
  TaxConfiguration,
  TaxCalculationDetail,
  ServiceItem,
  CustomerInfo,
  NFEDocument,
  TaxCalculation,
  SPEDEntry,
  TaxComplianceReport,
  ServiceTaxCode,
  TaxCalculationRequest,
  TaxCalculationResponse,
  NFEGenerationRequest,
  NFEGenerationResponse,
  TaxDashboardData,
};
