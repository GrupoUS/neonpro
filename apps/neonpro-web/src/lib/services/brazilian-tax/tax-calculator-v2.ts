/**
 * Brazilian Tax Calculator Service - Simplified Version
 * Comprehensive tax calculation engine for healthcare/aesthetic clinics
 * Supports all Brazilian tax regimes and compliance requirements
 */

import type {
  SimplesNacionalAnexo,
  TaxCalculation,
  TaxCalculationDetail,
  TaxCalculationRequest,
  TaxCalculationResponse,
  TaxRegime,
} from "../../types/brazilian-tax";

/**
 * Tax calculation configuration
 */
interface TaxCalculationConfig {
  includeSimples: boolean;
  includeISS: boolean;
  includePISCOFINS: boolean;
  includeICMS: boolean;
  roundValues: boolean;
  precision: number;
}

const DEFAULT_CONFIG: TaxCalculationConfig = {
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
const SIMPLES_NACIONAL_RATES: Record<string, Array<{ min: number; max: number; rate: number }>> = {
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
const ISS_RATES: Record<string, number> = {
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
const PIS_COFINS_RATES: Record<string, { pis: number; cofins: number }> = {
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
export class BrazilianTaxCalculatorService {
  /**
   * Calculate all taxes for a given service transaction
   */
  static calculateTaxes(
    request: TaxCalculationRequest,
    config: Partial<TaxCalculationConfig> = {},
  ): TaxCalculationResponse {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Determine tax regime
    const regime = request.regime_tributario || "simples_nacional";

    // Calculate individual taxes
    const icms = this.calculateICMS(request, finalConfig);
    const iss = this.calculateISS(request, finalConfig);
    const pis = this.calculatePIS(request, regime, finalConfig);
    const cofins = this.calculateCOFINS(request, regime, finalConfig);
    const simplesNacional = this.calculateSimplesNacional(request, finalConfig);

    // Calculate totals
    const totalImpostos = icms.valor + iss.valor + pis.valor + cofins.valor + simplesNacional.valor;
    const aliquotaEfetiva = request.valor_base > 0 ? totalImpostos / request.valor_base : 0;

    // Create main calculation object
    const calculation: TaxCalculation = {
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
      calculation,
      breakdown: {
        icms,
        iss,
        pis,
        cofins,
        simples_nacional: simplesNacional,
      },
      total_impostos: totalImpostos,
      aliquota_efetiva: aliquotaEfetiva,
    };
  }

  /**
   * Calculate ICMS (generally not applicable for healthcare services)
   */
  private static calculateICMS(
    request: TaxCalculationRequest,
    config: TaxCalculationConfig,
  ): TaxCalculationDetail {
    // Healthcare services typically exempt from ICMS
    return {
      base_calculo: 0,
      aliquota: 0,
      valor: 0,
    };
  }

  /**
   * Calculate ISS (Service Tax)
   */
  private static calculateISS(
    request: TaxCalculationRequest,
    config: TaxCalculationConfig,
  ): TaxCalculationDetail {
    if (!config.includeISS) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    // Get ISS rate for service type
    const rate = ISS_RATES[request.tipo_servico] || ISS_RATES.default;

    const baseCalculo = request.valor_base;
    const valor = baseCalculo * rate;

    return {
      base_calculo: baseCalculo,
      aliquota: rate,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  }

  /**
   * Calculate PIS
   */
  private static calculatePIS(
    request: TaxCalculationRequest,
    regime: TaxRegime,
    config: TaxCalculationConfig,
  ): TaxCalculationDetail {
    if (!config.includePISCOFINS || regime === "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    const rates = PIS_COFINS_RATES[regime];
    if (!rates) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    const baseCalculo = request.valor_base;
    const valor = baseCalculo * rates.pis;

    return {
      base_calculo: baseCalculo,
      aliquota: rates.pis,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  }

  /**
   * Calculate COFINS
   */
  private static calculateCOFINS(
    request: TaxCalculationRequest,
    regime: TaxRegime,
    config: TaxCalculationConfig,
  ): TaxCalculationDetail {
    if (!config.includePISCOFINS || regime === "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    const rates = PIS_COFINS_RATES[regime];
    if (!rates) {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    const baseCalculo = request.valor_base;
    const valor = baseCalculo * rates.cofins;

    return {
      base_calculo: baseCalculo,
      aliquota: rates.cofins,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
    };
  }

  /**
   * Calculate Simples Nacional
   */
  private static calculateSimplesNacional(
    request: TaxCalculationRequest,
    config: TaxCalculationConfig,
  ): TaxCalculationDetail {
    const regime = request.regime_tributario;

    if (!config.includeSimples || regime !== "simples_nacional") {
      return {
        base_calculo: 0,
        aliquota: 0,
        valor: 0,
      };
    }

    // Determine annexo based on service type
    const anexo = this.determineSimplexAnexo(request.tipo_servico);

    // For this example, assume annual revenue of R$ 500,000 (mid-range)
    // In production, this would come from the clinic's actual revenue data
    const estimatedAnnualRevenue = 500000;
    const rate = this.getSimplesNacionalRate(anexo, estimatedAnnualRevenue);

    const baseCalculo = request.valor_base;
    const valor = baseCalculo * rate;

    return {
      base_calculo: baseCalculo,
      aliquota: rate,
      valor: config.roundValues ? this.roundValue(valor, config.precision) : valor,
      anexo: anexo,
    };
  }

  /**
   * Determine Simples Nacional annexo based on service type
   */
  private static determineSimplexAnexo(serviceType: string): SimplesNacionalAnexo {
    // Healthcare professional services typically fall under Anexo V
    const anexoVServices = [
      "medical_consultation",
      "dental_services",
      "physical_therapy",
      "nutrition_consultation",
      "psychology_consultation",
    ];

    // Other services typically fall under Anexo III
    return anexoVServices.includes(serviceType) ? "V" : "III";
  }

  /**
   * Get Simples Nacional rate based on annexo and annual revenue
   */
  private static getSimplesNacionalRate(
    anexo: SimplesNacionalAnexo,
    annualRevenue: number,
  ): number {
    const brackets = SIMPLES_NACIONAL_RATES[anexo];

    if (!brackets) {
      return 0.06; // Default rate if annexo not found
    }

    for (const bracket of brackets) {
      if (annualRevenue >= bracket.min && annualRevenue <= bracket.max) {
        return bracket.rate;
      }
    }

    // If above maximum bracket, use highest rate
    return brackets[brackets.length - 1].rate;
  }

  /**
   * Calculate due date based on tax regime
   */
  private static calculateDueDate(regime: TaxRegime): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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
  }

  /**
   * Generate calculation notes
   */
  private static generateCalculationNotes(
    regime: TaxRegime,
    request: TaxCalculationRequest,
  ): string {
    const notes = [
      `Cálculo automático para regime ${regime}`,
      `Tipo de serviço: ${request.tipo_servico}`,
      `Valor base: R$ ${request.valor_base.toFixed(2)}`,
    ];

    if (request.codigo_servico) {
      notes.push(`Código de serviço: ${request.codigo_servico}`);
    }

    return notes.join("; ");
  }

  /**
   * Generate unique calculation ID
   */
  private static generateCalculationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `calc_${timestamp}_${random}`;
  }

  /**
   * Round value to specified precision
   */
  private static roundValue(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Batch calculate taxes for multiple services
   */
  static batchCalculateTaxes(
    requests: TaxCalculationRequest[],
    config: Partial<TaxCalculationConfig> = {},
  ): Map<string, TaxCalculationResponse> {
    const results = new Map<string, TaxCalculationResponse>();

    requests.forEach((request, index) => {
      const key = `${request.clinic_id}_${index}`;
      const result = this.calculateTaxes(request, config);
      results.set(key, result);
    });

    return results;
  }

  /**
   * Estimate annual tax liability
   */
  static estimateAnnualTax(
    monthlyRevenue: number,
    regime: TaxRegime,
    serviceType: string,
  ): {
    annual_revenue: number;
    estimated_taxes: number;
    effective_rate: number;
    breakdown: {
      simples?: number;
      iss: number;
      pis?: number;
      cofins?: number;
    };
  } {
    const annualRevenue = monthlyRevenue * 12;

    const sampleRequest: TaxCalculationRequest = {
      clinic_id: "sample",
      valor_base: monthlyRevenue,
      tipo_servico: serviceType,
      regime_tributario: regime,
    };

    const calculation = this.calculateTaxes(sampleRequest);
    const monthlyTax = calculation.total_impostos;
    const annualTax = monthlyTax * 12;

    return {
      annual_revenue: annualRevenue,
      estimated_taxes: annualTax,
      effective_rate: calculation.aliquota_efetiva,
      breakdown: {
        simples: calculation.breakdown.simples_nacional?.valor
          ? calculation.breakdown.simples_nacional.valor * 12
          : undefined,
        iss: calculation.breakdown.iss.valor * 12,
        pis: calculation.breakdown.pis.valor ? calculation.breakdown.pis.valor * 12 : undefined,
        cofins: calculation.breakdown.cofins.valor
          ? calculation.breakdown.cofins.valor * 12
          : undefined,
      },
    };
  }
}

export default BrazilianTaxCalculatorService;
