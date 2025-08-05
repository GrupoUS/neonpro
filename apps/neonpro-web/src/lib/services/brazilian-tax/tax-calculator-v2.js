"use strict";
/**
 * Brazilian Tax Calculator Service - Simplified Version
 * Comprehensive tax calculation engine for healthcare/aesthetic clinics
 * Supports all Brazilian tax regimes and compliance requirements
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrazilianTaxCalculatorService = void 0;
var DEFAULT_CONFIG = {
  includeSimples: true,
  includeISS: true,
  includePISCOFINS: true,
  includeICMS: false, // Services typically don't have ICMS
  roundValues: true,
  precision: 2,
};
/**
 * Simples Nacional tax rates by annexo and revenue brackets (2025)
 */
var SIMPLES_NACIONAL_RATES = {
  III: [
    { min: 0, max: 180000, rate: 0.06 },
    { min: 180000.01, max: 360000, rate: 0.112 },
    { min: 360000.01, max: 720000, rate: 0.135 },
    { min: 720000.01, max: 1800000, rate: 0.16 },
    { min: 1800000.01, max: 3600000, rate: 0.21 },
    { min: 3600000.01, max: 4800000, rate: 0.33 },
  ],
  V: [
    { min: 0, max: 180000, rate: 0.155 },
    { min: 180000.01, max: 360000, rate: 0.18 },
    { min: 360000.01, max: 720000, rate: 0.195 },
    { min: 720000.01, max: 1800000, rate: 0.205 },
    { min: 1800000.01, max: 3600000, rate: 0.23 },
    { min: 3600000.01, max: 4800000, rate: 0.305 },
  ],
};
/**
 * ISS rates by service type (typical ranges for healthcare/aesthetic services)
 */
var ISS_RATES = {
  medical_consultation: 0.02, // 2% - Medical consultations
  dental_services: 0.02, // 2% - Dental services
  aesthetic_treatment: 0.05, // 5% - Aesthetic treatments
  physical_therapy: 0.02, // 2% - Physical therapy
  nutrition_consultation: 0.02, // 2% - Nutrition consultation
  psychology_consultation: 0.02, // 2% - Psychology consultation
  laboratory_exams: 0.02, // 2% - Laboratory exams
  imaging_exams: 0.02, // 2% - Imaging exams
  surgical_procedures: 0.02, // 2% - Surgical procedures
  cosmetic_procedures: 0.05, // 5% - Cosmetic procedures
  wellness_services: 0.05, // 5% - Wellness and spa services
  default: 0.05, // 5% - Default for other services
};
/**
 * PIS/COFINS rates by tax regime
 */
var PIS_COFINS_RATES = {
  lucro_real: {
    pis: 0.0165, // 1.65%
    cofins: 0.076, // 7.6%
  },
  lucro_presumido: {
    pis: 0.0065, // 0.65%
    cofins: 0.03, // 3%
  },
  simples_nacional: {
    pis: 0, // Included in Simples
    cofins: 0, // Included in Simples
  },
};
/**
 * Main Tax Calculator Service
 */
var BrazilianTaxCalculatorService = /** @class */ (function () {
  function BrazilianTaxCalculatorService() {}
  /**
   * Calculate all taxes for a given service transaction
   */
  BrazilianTaxCalculatorService.calculateTaxes = function (request, config) {
    if (config === void 0) {
      config = {};
    }
    var finalConfig = __assign(__assign({}, DEFAULT_CONFIG), config);
    // Determine tax regime
    var regime = request.regime_tributario || "simples_nacional";
    // Calculate individual taxes
    var icms = this.calculateICMS(request, finalConfig);
    var iss = this.calculateISS(request, finalConfig);
    var pis = this.calculatePIS(request, regime, finalConfig);
    var cofins = this.calculateCOFINS(request, regime, finalConfig);
    var simplesNacional = this.calculateSimplesNacional(request, finalConfig);
    // Calculate totals
    var totalImpostos = icms.valor + iss.valor + pis.valor + cofins.valor + simplesNacional.valor;
    var aliquotaEfetiva = request.valor_base > 0 ? totalImpostos / request.valor_base : 0;
    // Create main calculation object
    var calculation = {
      id: this.generateCalculationId(),
      clinic_id: request.clinic_id,
      valor_base: request.valor_base,
      tipo_servico: request.tipo_servico,
      codigo_servico: request.codigo_servico,
      icms_calculation: icms,
      iss_calculation: iss,
      pis_calculation: pis,
      cofins_calculation: cofins,
      simples_nacional_calculation: simplesNacional,
      total_impostos: totalImpostos,
      calculation_date: new Date().toISOString(),
      calculation_method: "automatic",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      calculation: calculation,
      breakdown: {
        icms: icms,
        iss: iss,
        pis: pis,
        cofins: cofins,
        simples_nacional: simplesNacional,
      },
      total_impostos: totalImpostos,
      aliquota_efetiva: aliquotaEfetiva,
    };
  };
  /**
   * Calculate ICMS (generally not applicable for healthcare services)
   */
  BrazilianTaxCalculatorService.calculateICMS = function (request, config) {
    // Healthcare services typically exempt from ICMS
    return {
      base_calculo: 0,
      aliquota: 0,
      valor: 0,
    };
  };
  /**
   * Calculate ISS (Service Tax)
   */
  BrazilianTaxCalculatorService.calculateISS = function (request, config) {
    if (!config.includeISS) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    // Get ISS rate for service type
    var rate = ISS_RATES[request.tipo_servico] || ISS_RATES.default;
    var baseCalculo = request.valor_base;
    var valor = baseCalculo * rate;
    return {
      base_calculo: baseCalculo,
      aliquota: rate,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  };
  /**
   * Calculate PIS
   */
  BrazilianTaxCalculatorService.calculatePIS = function (request, regime, config) {
    if (!config.includePISCOFINS || regime === "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    var rates = PIS_COFINS_RATES[regime];
    if (!rates) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    var baseCalculo = request.valor_base;
    var valor = baseCalculo * rates.pis;
    return {
      base_calculo: baseCalculo,
      aliquota: rates.pis,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  };
  /**
   * Calculate COFINS
   */
  BrazilianTaxCalculatorService.calculateCOFINS = function (request, regime, config) {
    if (!config.includePISCOFINS || regime === "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    var rates = PIS_COFINS_RATES[regime];
    if (!rates) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    var baseCalculo = request.valor_base;
    var valor = baseCalculo * rates.cofins;
    return {
      base_calculo: baseCalculo,
      aliquota: rates.cofins,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  };
  /**
   * Calculate Simples Nacional
   */
  BrazilianTaxCalculatorService.calculateSimplesNacional = function (request, config) {
    var regime = request.regime_tributario;
    if (!config.includeSimples || regime !== "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }
    // Determine annexo based on service type
    var anexo = this.determineSimplexAnexo(request.tipo_servico);
    // For this example, assume annual revenue of R$ 500,000 (mid-range)
    // In production, this would come from the clinic's actual revenue data
    var estimatedAnnualRevenue = 500000;
    var rate = this.getSimplesNacionalRate(anexo, estimatedAnnualRevenue);
    var baseCalculo = request.valor_base;
    var valor = baseCalculo * rate;
    return {
      base_calculo: baseCalculo,
      aliquota: rate,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
      anexo: anexo,
    };
  };
  /**
   * Determine Simples Nacional annexo based on service type
   */
  BrazilianTaxCalculatorService.determineSimplexAnexo = function (serviceType) {
    // Healthcare professional services typically fall under Anexo V
    var anexoVServices = [
      "medical_consultation",
      "dental_services",
      "physical_therapy",
      "nutrition_consultation",
      "psychology_consultation",
    ];
    // Other services typically fall under Anexo III
    return anexoVServices.includes(serviceType) ? "V" : "III";
  };
  /**
   * Get Simples Nacional rate based on annexo and annual revenue
   */
  BrazilianTaxCalculatorService.getSimplesNacionalRate = function (anexo, annualRevenue) {
    var brackets = SIMPLES_NACIONAL_RATES[anexo];
    if (!brackets) {
      return 0.06; // Default rate if annexo not found
    }
    for (var _i = 0, brackets_1 = brackets; _i < brackets_1.length; _i++) {
      var bracket = brackets_1[_i];
      if (annualRevenue >= bracket.min && annualRevenue <= bracket.max) {
        return bracket.rate;
      }
    }
    // If above maximum bracket, use highest rate
    return brackets[brackets.length - 1].rate;
  };
  /**
   * Calculate due date based on tax regime
   */
  BrazilianTaxCalculatorService.calculateDueDate = function (regime) {
    var now = new Date();
    var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    switch (regime) {
      case "simples_nacional":
        // DAS due on 20th of following month
        return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20).toISOString();
      case "lucro_real":
      case "lucro_presumido":
        // Various due dates, use 15th as default
        return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15).toISOString();
      default:
        return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15).toISOString();
    }
  };
  /**
   * Generate calculation notes
   */
  BrazilianTaxCalculatorService.generateCalculationNotes = function (regime, request) {
    var notes = [
      "C\u00E1lculo autom\u00E1tico para regime ".concat(regime),
      "Tipo de servi\u00E7o: ".concat(request.tipo_servico),
      "Valor base: R$ ".concat(request.valor_base.toFixed(2)),
    ];
    if (request.codigo_servico) {
      notes.push("C\u00F3digo de servi\u00E7o: ".concat(request.codigo_servico));
    }
    return notes.join("; ");
  };
  /**
   * Generate unique calculation ID
   */
  BrazilianTaxCalculatorService.generateCalculationId = function () {
    var timestamp = Date.now();
    var random = Math.random().toString(36).substring(2, 8);
    return "calc_".concat(timestamp, "_").concat(random);
  };
  /**
   * Round value to specified precision
   */
  BrazilianTaxCalculatorService.roundValue = function (value, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  };
  /**
   * Batch calculate taxes for multiple services
   */
  BrazilianTaxCalculatorService.batchCalculateTaxes = function (requests, config) {
    var _this = this;
    if (config === void 0) {
      config = {};
    }
    var results = new Map();
    requests.forEach(function (request, index) {
      var key = "".concat(request.clinic_id, "_").concat(index);
      var result = _this.calculateTaxes(request, config);
      results.set(key, result);
    });
    return results;
  };
  /**
   * Estimate annual tax liability
   */
  BrazilianTaxCalculatorService.estimateAnnualTax = function (monthlyRevenue, regime, serviceType) {
    var _a;
    var annualRevenue = monthlyRevenue * 12;
    var sampleRequest = {
      clinic_id: "sample",
      valor_base: monthlyRevenue,
      tipo_servico: serviceType,
      regime_tributario: regime,
    };
    var calculation = this.calculateTaxes(sampleRequest);
    var monthlyTax = calculation.total_impostos;
    var annualTax = monthlyTax * 12;
    return {
      annual_revenue: annualRevenue,
      estimated_taxes: annualTax,
      effective_rate: calculation.aliquota_efetiva,
      breakdown: {
        simples: (
          (_a = calculation.breakdown.simples_nacional) === null || _a === void 0
            ? void 0
            : _a.valor
        )
          ? calculation.breakdown.simples_nacional.valor * 12
          : undefined,
        iss: calculation.breakdown.iss.valor * 12,
        pis: calculation.breakdown.pis.valor ? calculation.breakdown.pis.valor * 12 : undefined,
        cofins: calculation.breakdown.cofins.valor
          ? calculation.breakdown.cofins.valor * 12
          : undefined,
      },
    };
  };
  return BrazilianTaxCalculatorService;
})();
exports.BrazilianTaxCalculatorService = BrazilianTaxCalculatorService;
exports.default = BrazilianTaxCalculatorService;
