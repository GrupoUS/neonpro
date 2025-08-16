// Brazilian Tax System Validation Schemas
// Story 5.5: Comprehensive validation for Brazilian tax compliance

import { z } from 'zod';

// Brazilian Document Validators
export const cnpjSchema = z
  .string()
  .regex(
    /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  )
  .refine((cnpj) => {
    // Remove formatting
    const digits = cnpj.replace(/[^\d]/g, '');

    // Check if all digits are the same
    if (digits.split('').every((digit) => digit === digits[0])) {
      return false;
    }

    // Validate CNPJ check digits
    let sum = 0;
    let weight = 2;

    // First check digit
    for (let i = 11; i >= 0; i--) {
      sum += Number.parseInt(digits[i], 10) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (Number.parseInt(digits[12], 10) !== firstCheck) {
      return false;
    }

    // Second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += Number.parseInt(digits[i], 10) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }

    const secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return Number.parseInt(digits[13], 10) === secondCheck;
  }, 'CNPJ inválido');

export const cpfSchema = z
  .string()
  .regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    'CPF deve estar no formato XXX.XXX.XXX-XX',
  )
  .refine((cpf) => {
    const digits = cpf.replace(/[^\d]/g, '');

    // Check if all digits are the same
    if (digits.split('').every((digit) => digit === digits[0])) {
      return false;
    }

    // Validate CPF check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(digits[i], 10) * (10 - i);
    }
    let remainder = sum % 11;
    const firstCheck = remainder < 2 ? 0 : 11 - remainder;

    if (Number.parseInt(digits[9], 10) !== firstCheck) {
      return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(digits[i], 10) * (11 - i);
    }
    remainder = sum % 11;
    const secondCheck = remainder < 2 ? 0 : 11 - remainder;

    return Number.parseInt(digits[10], 10) === secondCheck;
  }, 'CPF inválido');

export const cnpjCpfSchema = z
  .string()
  .refine((value) => {
    const digits = value.replace(/[^\d]/g, '');
    return digits.length === 11 || digits.length === 14;
  }, 'Deve ser um CNPJ ou CPF válido')
  .refine((value) => {
    const digits = value.replace(/[^\d]/g, '');
    if (digits.length === 11) {
      return cpfSchema.safeParse(
        value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
      ).success;
    }
    return cnpjSchema.safeParse(
      value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
    ).success;
  }, 'CNPJ ou CPF inválido');

export const cepSchema = z
  .string()
  .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato XXXXX-XXX');

export const ufSchema = z
  .string()
  .length(2, 'UF deve ter 2 caracteres')
  .regex(/^[A-Z]{2}$/, 'UF deve conter apenas letras maiúsculas')
  .refine((uf) => {
    const validUFs = [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ];
    return validUFs.includes(uf);
  }, 'UF inválida');

// Address Schema
export const brazilianAddressSchema = z.object({
  logradouro: z
    .string()
    .min(1, 'Logradouro é obrigatório')
    .max(100, 'Logradouro muito longo'),
  numero: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo'),
  complemento: z.string().max(50, 'Complemento muito longo').optional(),
  bairro: z
    .string()
    .min(1, 'Bairro é obrigatório')
    .max(50, 'Bairro muito longo'),
  cidade: z
    .string()
    .min(1, 'Cidade é obrigatória')
    .max(50, 'Cidade muito longa'),
  uf: ufSchema,
  cep: cepSchema,
});

// Tax Configuration Schema
export const taxConfigurationSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),

  // Brazilian Tax Identification
  cnpj: cnpjSchema,
  inscricao_estadual: z
    .string()
    .max(20, 'Inscrição estadual muito longa')
    .optional(),
  inscricao_municipal: z
    .string()
    .max(20, 'Inscrição municipal muito longa')
    .optional(),

  // Tax Regime
  regime_tributario: z.enum(
    ['simples_nacional', 'lucro_presumido', 'lucro_real'],
    {
      errorMap: () => ({ message: 'Regime tributário inválido' }),
    },
  ),
  optante_simples_nacional: z.boolean(),

  // Tax Rates (0-100%)
  icms_rate: z
    .number()
    .min(0, 'Taxa ICMS não pode ser negativa')
    .max(100, 'Taxa ICMS não pode exceder 100%'),
  iss_rate: z
    .number()
    .min(0, 'Taxa ISS não pode ser negativa')
    .max(25, 'Taxa ISS não pode exceder 25%'),
  pis_rate: z
    .number()
    .min(0, 'Taxa PIS não pode ser negativa')
    .max(10, 'Taxa PIS não pode exceder 10%'),
  cofins_rate: z
    .number()
    .min(0, 'Taxa COFINS não pode ser negativa')
    .max(15, 'Taxa COFINS não pode exceder 15%'),
  irpj_rate: z
    .number()
    .min(0, 'Taxa IRPJ não pode ser negativa')
    .max(40, 'Taxa IRPJ não pode exceder 40%'),
  csll_rate: z
    .number()
    .min(0, 'Taxa CSLL não pode ser negativa')
    .max(15, 'Taxa CSLL não pode exceder 15%'),

  // Simples Nacional
  simples_nacional_anexo: z.enum(['I', 'II', 'III', 'IV', 'V'], {
    errorMap: () => ({ message: 'Anexo do Simples Nacional inválido' }),
  }),
  simples_nacional_rate: z
    .number()
    .min(0, 'Taxa Simples Nacional não pode ser negativa')
    .max(35, 'Taxa Simples Nacional não pode exceder 35%'),

  // Address
  endereco: brazilianAddressSchema,

  // Status
  active: z.boolean().default(true),
});

// Service Item Schema
export const serviceItemSchema = z
  .object({
    codigo: z
      .string()
      .min(1, 'Código do serviço é obrigatório')
      .max(20, 'Código muito longo'),
    descricao: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(200, 'Descrição muito longa'),
    quantidade: z.number().positive('Quantidade deve ser positiva'),
    valor_unitario: z.number().positive('Valor unitário deve ser positivo'),
    valor_total: z.number().positive('Valor total deve ser positivo'),
    codigo_servico: z
      .string()
      .max(10, 'Código de serviço muito longo')
      .optional(),
    iss_retido: z.boolean().optional(),
    discriminacao: z.string().max(500, 'Discriminação muito longa').optional(),
  })
  .refine(
    (data) => {
      const calculatedTotal = data.quantidade * data.valor_unitario;
      return Math.abs(calculatedTotal - data.valor_total) < 0.01;
    },
    {
      message: 'Valor total deve ser igual a quantidade × valor unitário',
      path: ['valor_total'],
    },
  );

// Customer Info Schema
export const customerInfoSchema = z.object({
  cnpj_cpf: cnpjCpfSchema,
  nome: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  endereco: brazilianAddressSchema,
  inscricao_estadual: z
    .string()
    .max(20, 'Inscrição estadual muito longa')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().max(20, 'Telefone muito longo').optional(),
});

// NFE Document Schema
export const nfeDocumentSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),
  invoice_id: z.string().uuid('ID da fatura inválido').optional(),

  // NFe Identification
  numero_nfe: z
    .number()
    .int('Número NFe deve ser inteiro')
    .positive('Número NFe deve ser positivo'),
  serie_nfe: z
    .number()
    .int('Série NFe deve ser inteiro')
    .positive('Série NFe deve ser positiva')
    .default(1),

  // Document Information
  tipo_documento: z.enum(['nfe', 'nfce', 'nfse'], {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  modelo_documento: z.enum(['55', '65', '57'], {
    errorMap: () => ({ message: 'Modelo de documento inválido' }),
  }),
  natureza_operacao: z
    .string()
    .min(1, 'Natureza da operação é obrigatória')
    .max(100, 'Natureza da operação muito longa'),

  // Tax Information
  valor_total: z.number().positive('Valor total deve ser positivo'),
  valor_base_calculo: z
    .number()
    .nonnegative('Base de cálculo não pode ser negativa')
    .optional(),
  valor_icms: z
    .number()
    .nonnegative('Valor ICMS não pode ser negativo')
    .default(0),
  valor_iss: z
    .number()
    .nonnegative('Valor ISS não pode ser negativo')
    .default(0),
  valor_pis: z
    .number()
    .nonnegative('Valor PIS não pode ser negativo')
    .default(0),
  valor_cofins: z
    .number()
    .nonnegative('Valor COFINS não pode ser negativo')
    .default(0),

  // Customer
  cliente_cnpj_cpf: cnpjCpfSchema.optional(),
  cliente_nome: z.string().max(200, 'Nome do cliente muito longo').optional(),
  cliente_endereco: brazilianAddressSchema.optional(),

  // Services
  servicos: z
    .array(serviceItemSchema)
    .min(1, 'Pelo menos um serviço é obrigatório'),

  // Status
  status: z
    .enum(['draft', 'authorized', 'cancelled', 'rejected'], {
      errorMap: () => ({ message: 'Status inválido' }),
    })
    .default('draft'),
});

// Tax Calculation Request Schema
export const taxCalculationRequestSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),
  valor_base: z.number().positive('Valor base deve ser positivo'),
  tipo_servico: z
    .string()
    .min(1, 'Tipo de serviço é obrigatório')
    .max(100, 'Tipo de serviço muito longo'),
  codigo_servico: z
    .string()
    .max(10, 'Código de serviço muito longo')
    .optional(),
  customer_info: customerInfoSchema.optional(),
  regime_tributario: z
    .enum(['simples_nacional', 'lucro_presumido', 'lucro_real'])
    .optional(),
});

// NFE Generation Request Schema
export const nfeGenerationRequestSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),
  invoice_id: z.string().uuid('ID da fatura inválido').optional(),
  customer: customerInfoSchema,
  services: z
    .array(serviceItemSchema)
    .min(1, 'Pelo menos um serviço é obrigatório'),
  natureza_operacao: z
    .string()
    .max(100, 'Natureza da operação muito longa')
    .optional(),
  observacoes: z.string().max(1000, 'Observações muito longas').optional(),
});

// SPED Entry Schema
export const spedEntrySchema = z
  .object({
    clinic_id: z.string().uuid('ID da clínica inválido'),

    // SPED Information
    periodo_apuracao: z
      .string()
      .regex(/^\d{4}-\d{2}-01$/, 'Período deve estar no formato YYYY-MM-01'),
    tipo_escrituracao: z.enum(['ECD', 'ECF', 'EFD'], {
      errorMap: () => ({ message: 'Tipo de escrituração inválido' }),
    }),

    // Entry Details
    codigo_conta: z
      .string()
      .min(1, 'Código da conta é obrigatório')
      .max(20, 'Código da conta muito longo'),
    descricao_conta: z
      .string()
      .min(1, 'Descrição da conta é obrigatória')
      .max(200, 'Descrição muito longa'),
    valor_debito: z
      .number()
      .nonnegative('Valor débito não pode ser negativo')
      .default(0),
    valor_credito: z
      .number()
      .nonnegative('Valor crédito não pode ser negativo')
      .default(0),

    // Document References
    numero_documento: z
      .string()
      .max(50, 'Número do documento muito longo')
      .optional(),
    data_documento: z
      .string()
      .datetime('Data do documento inválida')
      .optional(),
    historico: z.string().max(500, 'Histórico muito longo').optional(),

    // Tax Information
    cfop: z.string().max(10, 'CFOP muito longo').optional(),
    cst_pis: z.string().max(5, 'CST PIS muito longo').optional(),
    cst_cofins: z.string().max(5, 'CST COFINS muito longo').optional(),

    // Classification
    natureza_operacao: z
      .string()
      .max(100, 'Natureza da operação muito longa')
      .optional(),
    origem_lancamento: z
      .enum(['system', 'manual', 'imported'], {
        errorMap: () => ({ message: 'Origem do lançamento inválida' }),
      })
      .default('system'),
  })
  .refine(
    (data) => {
      // Either debit or credit must be greater than zero, but not both
      return data.valor_debito > 0 !== data.valor_credito > 0;
    },
    {
      message: 'Lançamento deve ter valor a débito OU a crédito, não ambos',
      path: ['valor_debito'],
    },
  );

// Tax Compliance Report Schema
export const taxComplianceReportSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),

  // Report Information
  tipo_relatorio: z.enum(
    ['sped_ecd', 'sped_ecf', 'livro_registro', 'dctf', 'defis'],
    {
      errorMap: () => ({ message: 'Tipo de relatório inválido' }),
    },
  ),
  periodo_referencia: z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, 'Período deve estar no formato YYYY-MM-01'),
  descricao: z.string().max(200, 'Descrição muito longa').optional(),

  // Report Data
  conteudo_relatorio: z.record(z.any()),

  // Submission
  status_envio: z
    .enum(['pending', 'sent', 'accepted', 'rejected'], {
      errorMap: () => ({ message: 'Status de envio inválido' }),
    })
    .default('pending'),
});

// Service Tax Code Schema
export const serviceTaxCodeSchema = z
  .object({
    codigo_servico: z
      .string()
      .regex(/^\d{2}\.\d{2}$/, 'Código deve estar no formato XX.XX'),
    descricao_servico: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(500, 'Descrição muito longa'),
    categoria: z.string().max(100, 'Categoria muito longa').optional(),

    // Tax Configuration
    iss_aliquota_minima: z
      .number()
      .min(0, 'Alíquota mínima não pode ser negativa')
      .max(25, 'Alíquota mínima não pode exceder 25%'),
    iss_aliquota_maxima: z
      .number()
      .min(0, 'Alíquota máxima não pode ser negativa')
      .max(25, 'Alíquota máxima não pode exceder 25%'),
    tributacao_pis_cofins: z.enum(['cumulativo', 'nao_cumulativo'], {
      errorMap: () => ({ message: 'Tributação PIS/COFINS inválida' }),
    }),

    // Healthcare Specific
    aplicavel_saude: z.boolean().default(true),
    observacoes: z.string().max(1000, 'Observações muito longas').optional(),

    // Status
    ativo: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return data.iss_aliquota_minima <= data.iss_aliquota_maxima;
    },
    {
      message: 'Alíquota mínima deve ser menor ou igual à máxima',
      path: ['iss_aliquota_maxima'],
    },
  );

// Bulk Tax Calculation Request Schema
export const bulkTaxCalculationRequestSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),
  calculations: z
    .array(
      z.object({
        service_type: z.string().min(1, 'Tipo de serviço é obrigatório'),
        amount: z.number().positive('Valor deve ser positivo'),
        description: z.string().optional(),
        customer_cnpj_cpf: cnpjCpfSchema.optional(),
        customer_city: z.string().optional(),
      }),
    )
    .min(1, 'Pelo menos um cálculo é necessário')
    .max(100, 'Máximo de 100 cálculos por lote'),
});

// NFe Create Request Schema
export const nfeCreateRequestSchema = z.object({
  clinic_id: z.string().uuid('ID da clínica inválido'),
  customer_data: customerInfoSchema,
  items: z.array(serviceItemSchema).min(1, 'Pelo menos um item é necessário'),
  payment_method: z
    .enum(['cash', 'card', 'bank_transfer', 'pix', 'check'], {
      errorMap: () => ({ message: 'Método de pagamento inválido' }),
    })
    .optional(),
  additional_info: z
    .string()
    .max(1000, 'Informações adicionais muito longas')
    .optional(),
});
