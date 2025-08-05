// Brazilian Tax System Validation Schemas
// Story 5.5: Comprehensive validation for Brazilian tax compliance
Object.defineProperty(exports, "__esModule", { value: true });
exports.nfeCreateRequestSchema =
  exports.bulkTaxCalculationRequestSchema =
  exports.serviceTaxCodeSchema =
  exports.taxComplianceReportSchema =
  exports.spedEntrySchema =
  exports.nfeGenerationRequestSchema =
  exports.taxCalculationRequestSchema =
  exports.nfeDocumentSchema =
  exports.customerInfoSchema =
  exports.serviceItemSchema =
  exports.taxConfigurationSchema =
  exports.brazilianAddressSchema =
  exports.ufSchema =
  exports.cepSchema =
  exports.cnpjCpfSchema =
  exports.cpfSchema =
  exports.cnpjSchema =
    void 0;
var zod_1 = require("zod");
// Brazilian Document Validators
exports.cnpjSchema = zod_1.z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX")
  .refine((cnpj) => {
    // Remove formatting
    var digits = cnpj.replace(/[^\d]/g, "");
    // Check if all digits are the same
    if (digits.split("").every((digit) => digit === digits[0])) {
      return false;
    }
    // Validate CNPJ check digits
    var sum = 0;
    var weight = 2;
    // First check digit
    for (var i = 11; i >= 0; i--) {
      sum += parseInt(digits[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    var firstCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(digits[12]) !== firstCheck) return false;
    // Second check digit
    sum = 0;
    weight = 2;
    for (var i = 12; i >= 0; i--) {
      sum += parseInt(digits[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    var secondCheck = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(digits[13]) === secondCheck;
  }, "CNPJ inválido");
exports.cpfSchema = zod_1.z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .refine((cpf) => {
    var digits = cpf.replace(/[^\d]/g, "");
    // Check if all digits are the same
    if (digits.split("").every((digit) => digit === digits[0])) {
      return false;
    }
    // Validate CPF check digits
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    var remainder = sum % 11;
    var firstCheck = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(digits[9]) !== firstCheck) return false;
    sum = 0;
    for (var i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = sum % 11;
    var secondCheck = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(digits[10]) === secondCheck;
  }, "CPF inválido");
exports.cnpjCpfSchema = zod_1.z
  .string()
  .refine((value) => {
    var digits = value.replace(/[^\d]/g, "");
    return digits.length === 11 || digits.length === 14;
  }, "Deve ser um CNPJ ou CPF válido")
  .refine((value) => {
    var digits = value.replace(/[^\d]/g, "");
    if (digits.length === 11) {
      return exports.cpfSchema.safeParse(
        value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
      ).success;
    } else {
      return exports.cnpjSchema.safeParse(
        value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"),
      ).success;
    }
  }, "CNPJ ou CPF inválido");
exports.cepSchema = zod_1.z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato XXXXX-XXX");
exports.ufSchema = zod_1.z
  .string()
  .length(2, "UF deve ter 2 caracteres")
  .regex(/^[A-Z]{2}$/, "UF deve conter apenas letras maiúsculas")
  .refine((uf) => {
    var validUFs = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];
    return validUFs.includes(uf);
  }, "UF inválida");
// Address Schema
exports.brazilianAddressSchema = zod_1.z.object({
  logradouro: zod_1.z
    .string()
    .min(1, "Logradouro é obrigatório")
    .max(100, "Logradouro muito longo"),
  numero: zod_1.z.string().min(1, "Número é obrigatório").max(10, "Número muito longo"),
  complemento: zod_1.z.string().max(50, "Complemento muito longo").optional(),
  bairro: zod_1.z.string().min(1, "Bairro é obrigatório").max(50, "Bairro muito longo"),
  cidade: zod_1.z.string().min(1, "Cidade é obrigatória").max(50, "Cidade muito longa"),
  uf: exports.ufSchema,
  cep: exports.cepSchema,
});
// Tax Configuration Schema
exports.taxConfigurationSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  // Brazilian Tax Identification
  cnpj: exports.cnpjSchema,
  inscricao_estadual: zod_1.z.string().max(20, "Inscrição estadual muito longa").optional(),
  inscricao_municipal: zod_1.z.string().max(20, "Inscrição municipal muito longa").optional(),
  // Tax Regime
  regime_tributario: zod_1.z.enum(["simples_nacional", "lucro_presumido", "lucro_real"], {
    errorMap: () => ({ message: "Regime tributário inválido" }),
  }),
  optante_simples_nacional: zod_1.z.boolean(),
  // Tax Rates (0-100%)
  icms_rate: zod_1.z
    .number()
    .min(0, "Taxa ICMS não pode ser negativa")
    .max(100, "Taxa ICMS não pode exceder 100%"),
  iss_rate: zod_1.z
    .number()
    .min(0, "Taxa ISS não pode ser negativa")
    .max(25, "Taxa ISS não pode exceder 25%"),
  pis_rate: zod_1.z
    .number()
    .min(0, "Taxa PIS não pode ser negativa")
    .max(10, "Taxa PIS não pode exceder 10%"),
  cofins_rate: zod_1.z
    .number()
    .min(0, "Taxa COFINS não pode ser negativa")
    .max(15, "Taxa COFINS não pode exceder 15%"),
  irpj_rate: zod_1.z
    .number()
    .min(0, "Taxa IRPJ não pode ser negativa")
    .max(40, "Taxa IRPJ não pode exceder 40%"),
  csll_rate: zod_1.z
    .number()
    .min(0, "Taxa CSLL não pode ser negativa")
    .max(15, "Taxa CSLL não pode exceder 15%"),
  // Simples Nacional
  simples_nacional_anexo: zod_1.z.enum(["I", "II", "III", "IV", "V"], {
    errorMap: () => ({ message: "Anexo do Simples Nacional inválido" }),
  }),
  simples_nacional_rate: zod_1.z
    .number()
    .min(0, "Taxa Simples Nacional não pode ser negativa")
    .max(35, "Taxa Simples Nacional não pode exceder 35%"),
  // Address
  endereco: exports.brazilianAddressSchema,
  // Status
  active: zod_1.z.boolean().default(true),
});
// Service Item Schema
exports.serviceItemSchema = zod_1.z
  .object({
    codigo: zod_1.z
      .string()
      .min(1, "Código do serviço é obrigatório")
      .max(20, "Código muito longo"),
    descricao: zod_1.z.string().min(1, "Descrição é obrigatória").max(200, "Descrição muito longa"),
    quantidade: zod_1.z.number().positive("Quantidade deve ser positiva"),
    valor_unitario: zod_1.z.number().positive("Valor unitário deve ser positivo"),
    valor_total: zod_1.z.number().positive("Valor total deve ser positivo"),
    codigo_servico: zod_1.z.string().max(10, "Código de serviço muito longo").optional(),
    iss_retido: zod_1.z.boolean().optional(),
    discriminacao: zod_1.z.string().max(500, "Discriminação muito longa").optional(),
  })
  .refine(
    (data) => {
      var calculatedTotal = data.quantidade * data.valor_unitario;
      return Math.abs(calculatedTotal - data.valor_total) < 0.01;
    },
    {
      message: "Valor total deve ser igual a quantidade × valor unitário",
      path: ["valor_total"],
    },
  );
// Customer Info Schema
exports.customerInfoSchema = zod_1.z.object({
  cnpj_cpf: exports.cnpjCpfSchema,
  nome: zod_1.z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  endereco: exports.brazilianAddressSchema,
  inscricao_estadual: zod_1.z.string().max(20, "Inscrição estadual muito longa").optional(),
  email: zod_1.z.string().email("Email inválido").optional(),
  telefone: zod_1.z.string().max(20, "Telefone muito longo").optional(),
});
// NFE Document Schema
exports.nfeDocumentSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  invoice_id: zod_1.z.string().uuid("ID da fatura inválido").optional(),
  // NFe Identification
  numero_nfe: zod_1.z
    .number()
    .int("Número NFe deve ser inteiro")
    .positive("Número NFe deve ser positivo"),
  serie_nfe: zod_1.z
    .number()
    .int("Série NFe deve ser inteiro")
    .positive("Série NFe deve ser positiva")
    .default(1),
  // Document Information
  tipo_documento: zod_1.z.enum(["nfe", "nfce", "nfse"], {
    errorMap: () => ({ message: "Tipo de documento inválido" }),
  }),
  modelo_documento: zod_1.z.enum(["55", "65", "57"], {
    errorMap: () => ({ message: "Modelo de documento inválido" }),
  }),
  natureza_operacao: zod_1.z
    .string()
    .min(1, "Natureza da operação é obrigatória")
    .max(100, "Natureza da operação muito longa"),
  // Tax Information
  valor_total: zod_1.z.number().positive("Valor total deve ser positivo"),
  valor_base_calculo: zod_1.z
    .number()
    .nonnegative("Base de cálculo não pode ser negativa")
    .optional(),
  valor_icms: zod_1.z.number().nonnegative("Valor ICMS não pode ser negativo").default(0),
  valor_iss: zod_1.z.number().nonnegative("Valor ISS não pode ser negativo").default(0),
  valor_pis: zod_1.z.number().nonnegative("Valor PIS não pode ser negativo").default(0),
  valor_cofins: zod_1.z.number().nonnegative("Valor COFINS não pode ser negativo").default(0),
  // Customer
  cliente_cnpj_cpf: exports.cnpjCpfSchema.optional(),
  cliente_nome: zod_1.z.string().max(200, "Nome do cliente muito longo").optional(),
  cliente_endereco: exports.brazilianAddressSchema.optional(),
  // Services
  servicos: zod_1.z.array(exports.serviceItemSchema).min(1, "Pelo menos um serviço é obrigatório"),
  // Status
  status: zod_1.z
    .enum(["draft", "authorized", "cancelled", "rejected"], {
      errorMap: () => ({ message: "Status inválido" }),
    })
    .default("draft"),
});
// Tax Calculation Request Schema
exports.taxCalculationRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  valor_base: zod_1.z.number().positive("Valor base deve ser positivo"),
  tipo_servico: zod_1.z
    .string()
    .min(1, "Tipo de serviço é obrigatório")
    .max(100, "Tipo de serviço muito longo"),
  codigo_servico: zod_1.z.string().max(10, "Código de serviço muito longo").optional(),
  customer_info: exports.customerInfoSchema.optional(),
  regime_tributario: zod_1.z.enum(["simples_nacional", "lucro_presumido", "lucro_real"]).optional(),
});
// NFE Generation Request Schema
exports.nfeGenerationRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  invoice_id: zod_1.z.string().uuid("ID da fatura inválido").optional(),
  customer: exports.customerInfoSchema,
  services: zod_1.z.array(exports.serviceItemSchema).min(1, "Pelo menos um serviço é obrigatório"),
  natureza_operacao: zod_1.z.string().max(100, "Natureza da operação muito longa").optional(),
  observacoes: zod_1.z.string().max(1000, "Observações muito longas").optional(),
});
// SPED Entry Schema
exports.spedEntrySchema = zod_1.z
  .object({
    clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
    // SPED Information
    periodo_apuracao: zod_1.z
      .string()
      .regex(/^\d{4}-\d{2}-01$/, "Período deve estar no formato YYYY-MM-01"),
    tipo_escrituracao: zod_1.z.enum(["ECD", "ECF", "EFD"], {
      errorMap: () => ({ message: "Tipo de escrituração inválido" }),
    }),
    // Entry Details
    codigo_conta: zod_1.z
      .string()
      .min(1, "Código da conta é obrigatório")
      .max(20, "Código da conta muito longo"),
    descricao_conta: zod_1.z
      .string()
      .min(1, "Descrição da conta é obrigatória")
      .max(200, "Descrição muito longa"),
    valor_debito: zod_1.z.number().nonnegative("Valor débito não pode ser negativo").default(0),
    valor_credito: zod_1.z.number().nonnegative("Valor crédito não pode ser negativo").default(0),
    // Document References
    numero_documento: zod_1.z.string().max(50, "Número do documento muito longo").optional(),
    data_documento: zod_1.z.string().datetime("Data do documento inválida").optional(),
    historico: zod_1.z.string().max(500, "Histórico muito longo").optional(),
    // Tax Information
    cfop: zod_1.z.string().max(10, "CFOP muito longo").optional(),
    cst_pis: zod_1.z.string().max(5, "CST PIS muito longo").optional(),
    cst_cofins: zod_1.z.string().max(5, "CST COFINS muito longo").optional(),
    // Classification
    natureza_operacao: zod_1.z.string().max(100, "Natureza da operação muito longa").optional(),
    origem_lancamento: zod_1.z
      .enum(["system", "manual", "imported"], {
        errorMap: () => ({ message: "Origem do lançamento inválida" }),
      })
      .default("system"),
  })
  .refine(
    (data) => {
      // Either debit or credit must be greater than zero, but not both
      return data.valor_debito > 0 !== data.valor_credito > 0;
    },
    {
      message: "Lançamento deve ter valor a débito OU a crédito, não ambos",
      path: ["valor_debito"],
    },
  );
// Tax Compliance Report Schema
exports.taxComplianceReportSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  // Report Information
  tipo_relatorio: zod_1.z.enum(["sped_ecd", "sped_ecf", "livro_registro", "dctf", "defis"], {
    errorMap: () => ({ message: "Tipo de relatório inválido" }),
  }),
  periodo_referencia: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, "Período deve estar no formato YYYY-MM-01"),
  descricao: zod_1.z.string().max(200, "Descrição muito longa").optional(),
  // Report Data
  conteudo_relatorio: zod_1.z.record(zod_1.z.any()),
  // Submission
  status_envio: zod_1.z
    .enum(["pending", "sent", "accepted", "rejected"], {
      errorMap: () => ({ message: "Status de envio inválido" }),
    })
    .default("pending"),
});
// Service Tax Code Schema
exports.serviceTaxCodeSchema = zod_1.z
  .object({
    codigo_servico: zod_1.z.string().regex(/^\d{2}\.\d{2}$/, "Código deve estar no formato XX.XX"),
    descricao_servico: zod_1.z
      .string()
      .min(1, "Descrição é obrigatória")
      .max(500, "Descrição muito longa"),
    categoria: zod_1.z.string().max(100, "Categoria muito longa").optional(),
    // Tax Configuration
    iss_aliquota_minima: zod_1.z
      .number()
      .min(0, "Alíquota mínima não pode ser negativa")
      .max(25, "Alíquota mínima não pode exceder 25%"),
    iss_aliquota_maxima: zod_1.z
      .number()
      .min(0, "Alíquota máxima não pode ser negativa")
      .max(25, "Alíquota máxima não pode exceder 25%"),
    tributacao_pis_cofins: zod_1.z.enum(["cumulativo", "nao_cumulativo"], {
      errorMap: () => ({ message: "Tributação PIS/COFINS inválida" }),
    }),
    // Healthcare Specific
    aplicavel_saude: zod_1.z.boolean().default(true),
    observacoes: zod_1.z.string().max(1000, "Observações muito longas").optional(),
    // Status
    ativo: zod_1.z.boolean().default(true),
  })
  .refine((data) => data.iss_aliquota_minima <= data.iss_aliquota_maxima, {
    message: "Alíquota mínima deve ser menor ou igual à máxima",
    path: ["iss_aliquota_maxima"],
  });
// Bulk Tax Calculation Request Schema
exports.bulkTaxCalculationRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  calculations: zod_1.z
    .array(
      zod_1.z.object({
        service_type: zod_1.z.string().min(1, "Tipo de serviço é obrigatório"),
        amount: zod_1.z.number().positive("Valor deve ser positivo"),
        description: zod_1.z.string().optional(),
        customer_cnpj_cpf: exports.cnpjCpfSchema.optional(),
        customer_city: zod_1.z.string().optional(),
      }),
    )
    .min(1, "Pelo menos um cálculo é necessário")
    .max(100, "Máximo de 100 cálculos por lote"),
});
// NFe Create Request Schema
exports.nfeCreateRequestSchema = zod_1.z.object({
  clinic_id: zod_1.z.string().uuid("ID da clínica inválido"),
  customer_data: exports.customerInfoSchema,
  items: zod_1.z.array(exports.serviceItemSchema).min(1, "Pelo menos um item é necessário"),
  payment_method: zod_1.z
    .enum(["cash", "card", "bank_transfer", "pix", "check"], {
      errorMap: () => ({ message: "Método de pagamento inválido" }),
    })
    .optional(),
  additional_info: zod_1.z.string().max(1000, "Informações adicionais muito longas").optional(),
});
