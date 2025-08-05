// Brazilian Tax Calculation Engine
// Story 5.5: Core tax calculation logic for Brazilian healthcare clinics

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  taxCalculationRequestSchema,
  taxConfigurationSchema,
  serviceTaxCodeSchema,
  type TaxConfiguration,
  type ServiceTaxCode,
  type TaxCalculation,
  type TaxBreakdown,
} from "@/lib/types/brazilian-tax";

export class BrazilianTaxEngine {
  private supabase = createClientComponentClient();

  // Get clinic tax configuration
  async getTaxConfiguration(clinicId: string): Promise<TaxConfiguration | null> {
    try {
      const { data, error } = await this.supabase
        .from("tax_configuration")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("active", true)
        .single();

      if (error || !data) {
        console.error("Error fetching tax configuration:", error);
        return null;
      }

      return data as TaxConfiguration;
    } catch (error) {
      console.error("Tax configuration fetch error:", error);
      return null;
    }
  }

  // Get service tax code information
  async getServiceTaxCode(serviceCode: string): Promise<ServiceTaxCode | null> {
    try {
      const { data, error } = await this.supabase
        .from("service_tax_codes")
        .select("*")
        .eq("codigo_servico", serviceCode)
        .eq("ativo", true)
        .single();

      if (error || !data) {
        console.error("Error fetching service tax code:", error);
        return null;
      }

      return data as ServiceTaxCode;
    } catch (error) {
      console.error("Service tax code fetch error:", error);
      return null;
    }
  }

  // Calculate taxes for a given amount and configuration
  async calculateTaxes(request: {
    clinic_id: string;
    valor_base: number;
    tipo_servico: string;
    codigo_servico?: string;
    customer_info?: any;
    regime_tributario?: string;
  }): Promise<TaxCalculation> {
    try {
      // Validate request
      const validatedRequest = taxCalculationRequestSchema.parse(request);

      // Get tax configuration
      const taxConfig = await this.getTaxConfiguration(validatedRequest.clinic_id);
      if (!taxConfig) {
        throw new Error("Tax configuration not found for clinic");
      }

      // Get service tax code information if provided
      let serviceTaxCode: ServiceTaxCode | null = null;
      if (validatedRequest.codigo_servico) {
        serviceTaxCode = await this.getServiceTaxCode(validatedRequest.codigo_servico);
      }

      // Calculate taxes based on regime
      const regime = validatedRequest.regime_tributario || taxConfig.regime_tributario;
      let taxBreakdown: TaxBreakdown;

      switch (regime) {
        case "simples_nacional":
          taxBreakdown = this.calculateSimplesNacional(
            validatedRequest.valor_base,
            taxConfig,
            serviceTaxCode,
          );
          break;

        case "lucro_presumido":
          taxBreakdown = this.calculateLucroPresumido(
            validatedRequest.valor_base,
            taxConfig,
            serviceTaxCode,
          );
          break;

        case "lucro_real":
          taxBreakdown = this.calculateLucroReal(
            validatedRequest.valor_base,
            taxConfig,
            serviceTaxCode,
          );
          break;

        default:
          throw new Error(`Unknown tax regime: ${regime}`);
      }

      // Calculate totals
      const totalTaxes = Object.values(taxBreakdown).reduce((sum, value) => sum + value, 0);
      const netValue = validatedRequest.valor_base - totalTaxes;

      const calculation: TaxCalculation = {
        valor_base: validatedRequest.valor_base,
        regime_tributario: regime,
        tax_breakdown: taxBreakdown,
        total_taxes: totalTaxes,
        valor_liquido: netValue,
        effective_rate: (totalTaxes / validatedRequest.valor_base) * 100,
        calculated_at: new Date().toISOString(),
        service_code: validatedRequest.codigo_servico,
        service_type: validatedRequest.tipo_servico,
      };

      return calculation;
    } catch (error) {
      console.error("Tax calculation error:", error);
      throw error;
    }
  }

  // Calculate taxes under Simples Nacional regime
  private calculateSimplesNacional(
    valorBase: number,
    taxConfig: TaxConfiguration,
    serviceTaxCode?: ServiceTaxCode | null,
  ): TaxBreakdown {
    const breakdown: TaxBreakdown = {
      icms: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      simples_nacional: 0,
      inss: 0,
      outros: 0,
    };

    // Simples Nacional unified rate
    const simplesRate = taxConfig.simples_nacional_rate / 100;
    breakdown.simples_nacional = valorBase * simplesRate;

    // ISS may be charged separately if municipality requires
    if (serviceTaxCode && serviceTaxCode.iss_aliquota_minima > 0) {
      // Check if ISS is included in Simples or charged separately
      // For healthcare services, often charged separately
      const issRate = taxConfig.iss_rate / 100;
      breakdown.iss = valorBase * issRate;
    }

    return breakdown;
  }

  // Calculate taxes under Lucro Presumido regime
  private calculateLucroPresumido(
    valorBase: number,
    taxConfig: TaxConfiguration,
    serviceTaxCode?: ServiceTaxCode | null,
  ): TaxBreakdown {
    const breakdown: TaxBreakdown = {
      icms: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      simples_nacional: 0,
      inss: 0,
      outros: 0,
    };

    // ISS (municipal tax on services)
    const issRate = taxConfig.iss_rate / 100;
    breakdown.iss = valorBase * issRate;

    // PIS and COFINS (cumulative regime for Lucro Presumido)
    const pisRate = taxConfig.pis_rate / 100;
    const cofinsRate = taxConfig.cofins_rate / 100;
    breakdown.pis = valorBase * pisRate;
    breakdown.cofins = valorBase * cofinsRate;

    // IRPJ and CSLL (calculated on presumed profit)
    // For healthcare services, presumed profit is typically 32%
    const presumedProfitRate = 0.32;
    const presumedProfit = valorBase * presumedProfitRate;

    const irpjRate = taxConfig.irpj_rate / 100;
    const csllRate = taxConfig.csll_rate / 100;
    breakdown.irpj = presumedProfit * irpjRate;
    breakdown.csll = presumedProfit * csllRate;

    return breakdown;
  }

  // Calculate taxes under Lucro Real regime
  private calculateLucroReal(
    valorBase: number,
    taxConfig: TaxConfiguration,
    serviceTaxCode?: ServiceTaxCode | null,
  ): TaxBreakdown {
    const breakdown: TaxBreakdown = {
      icms: 0,
      iss: 0,
      pis: 0,
      cofins: 0,
      irpj: 0,
      csll: 0,
      simples_nacional: 0,
      inss: 0,
      outros: 0,
    };

    // ISS (municipal tax on services)
    const issRate = taxConfig.iss_rate / 100;
    breakdown.iss = valorBase * issRate;

    // PIS and COFINS (non-cumulative regime for Lucro Real)
    // Higher rates but with credit system
    const pisRate = Math.max(taxConfig.pis_rate, 1.65) / 100; // Minimum 1.65% for non-cumulative
    const cofinsRate = Math.max(taxConfig.cofins_rate, 7.6) / 100; // Minimum 7.6% for non-cumulative
    breakdown.pis = valorBase * pisRate;
    breakdown.cofins = valorBase * cofinsRate;

    // IRPJ and CSLL (calculated on actual profit)
    // For this calculation, we'll use a conservative approach
    // assuming 25% profit margin for healthcare services
    const profitMargin = 0.25;
    const estimatedProfit = valorBase * profitMargin;

    const irpjRate = taxConfig.irpj_rate / 100;
    const csllRate = taxConfig.csll_rate / 100;
    breakdown.irpj = estimatedProfit * irpjRate;
    breakdown.csll = estimatedProfit * csllRate;

    return breakdown;
  }

  // Get effective tax rate for a clinic
  async getEffectiveTaxRate(
    clinicId: string,
    serviceType: string,
    valorBase: number = 1000,
  ): Promise<number> {
    try {
      const calculation = await this.calculateTaxes({
        clinic_id: clinicId,
        valor_base: valorBase,
        tipo_servico: serviceType,
      });

      return calculation.effective_rate;
    } catch (error) {
      console.error("Effective tax rate calculation error:", error);
      return 0;
    }
  }

  // Calculate taxes for multiple services
  async calculateBulkTaxes(
    requests: Array<{
      clinic_id: string;
      valor_base: number;
      tipo_servico: string;
      codigo_servico?: string;
    }>,
  ): Promise<TaxCalculation[]> {
    const calculations: TaxCalculation[] = [];

    for (const request of requests) {
      try {
        const calculation = await this.calculateTaxes(request);
        calculations.push(calculation);
      } catch (error) {
        console.error(`Bulk tax calculation error for request:`, request, error);
        // Continue with other calculations
      }
    }

    return calculations;
  }

  // Validate tax calculation setup
  async validateTaxSetup(clinicId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check tax configuration
      const taxConfig = await this.getTaxConfiguration(clinicId);
      if (!taxConfig) {
        errors.push("Tax configuration not found");
        return { isValid: false, errors, warnings };
      }

      // Validate configuration
      try {
        taxConfigurationSchema.parse(taxConfig);
      } catch (validationError: any) {
        errors.push(`Tax configuration validation failed: ${validationError.message}`);
      }

      // Check for common issues
      if (
        taxConfig.regime_tributario === "simples_nacional" &&
        !taxConfig.optante_simples_nacional
      ) {
        warnings.push("Tax regime is Simples Nacional but clinic is not marked as optant");
      }

      if (taxConfig.iss_rate === 0) {
        warnings.push("ISS rate is 0% - verify if this is correct for your municipality");
      }

      if (
        taxConfig.regime_tributario === "simples_nacional" &&
        taxConfig.simples_nacional_rate === 0
      ) {
        errors.push("Simples Nacional rate cannot be 0%");
      }

      // Check address completeness
      if (!taxConfig.endereco.cep || !taxConfig.endereco.uf) {
        errors.push("Incomplete address information in tax configuration");
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error("Tax setup validation error:", error);
      return {
        isValid: false,
        errors: ["Failed to validate tax setup"],
        warnings,
      };
    }
  }

  // Get tax summary for reporting
  async getTaxSummary(
    clinicId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    total_revenue: number;
    total_taxes: number;
    effective_rate: number;
    breakdown: TaxBreakdown;
    period: { start: string; end: string };
  }> {
    try {
      // This would typically query invoice/payment data
      // For now, we'll return a mock structure
      const summary = {
        total_revenue: 0,
        total_taxes: 0,
        effective_rate: 0,
        breakdown: {
          icms: 0,
          iss: 0,
          pis: 0,
          cofins: 0,
          irpj: 0,
          csll: 0,
          simples_nacional: 0,
          inss: 0,
          outros: 0,
        },
        period: {
          start: startDate,
          end: endDate,
        },
      };

      // TODO: Implement actual data aggregation from invoices/payments
      // This would involve:
      // 1. Query all invoices in date range
      // 2. Calculate taxes for each invoice
      // 3. Aggregate totals
      // 4. Calculate effective rates

      return summary;
    } catch (error) {
      console.error("Tax summary calculation error:", error);
      throw error;
    }
  }

  /**
   * Calculate taxes for multiple services at once
   */
  static async calculateTaxes(
    calculations: BulkTaxCalculationRequest["calculations"],
    clinicId: string,
  ): Promise<TaxCalculationResult[]> {
    const results: TaxCalculationResult[] = [];

    for (const calculation of calculations) {
      try {
        const result = await this.calculateServiceTax(
          calculation.service_type,
          calculation.amount,
          clinicId,
          {
            customerCnpjCpf: calculation.customer_cnpj_cpf,
            customerCity: calculation.customer_city,
            description: calculation.description,
          },
        );
        results.push(result);
      } catch (error) {
        // Continue with other calculations, add error result
        results.push({
          service_type: calculation.service_type,
          amount: calculation.amount,
          iss: 0,
          pis: 0,
          cofins: 0,
          inss: 0,
          irrf: 0,
          total_taxes: 0,
          net_amount: calculation.amount,
          error: error instanceof Error ? error.message : "Erro no cálculo",
        });
      }
    }

    return results;
  }
}

// Export the tax engine
export const brazilianTaxEngine = new BrazilianTaxEngine();
