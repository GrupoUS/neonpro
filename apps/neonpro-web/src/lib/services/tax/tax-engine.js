// Brazilian Tax Calculation Engine
// Story 5.5: Core tax calculation logic for Brazilian healthcare clinics
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.brazilianTaxEngine = exports.BrazilianTaxEngine = void 0;
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var brazilian_tax_1 = require("@/lib/types/brazilian-tax");
var BrazilianTaxEngine = /** @class */ (() => {
  function BrazilianTaxEngine() {
    this.supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  }
  // Get clinic tax configuration
  BrazilianTaxEngine.prototype.getTaxConfiguration = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("tax_configuration")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("active", true)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              console.error("Error fetching tax configuration:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_1 = _b.sent();
            console.error("Tax configuration fetch error:", error_1);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get service tax code information
  BrazilianTaxEngine.prototype.getServiceTaxCode = function (serviceCode) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("service_tax_codes")
                .select("*")
                .eq("codigo_servico", serviceCode)
                .eq("ativo", true)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              console.error("Error fetching service tax code:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_2 = _b.sent();
            console.error("Service tax code fetch error:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Calculate taxes for a given amount and configuration
  BrazilianTaxEngine.prototype.calculateTaxes = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var validatedRequest,
        taxConfig,
        serviceTaxCode,
        regime,
        taxBreakdown,
        totalTaxes,
        netValue,
        calculation,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            validatedRequest = brazilian_tax_1.taxCalculationRequestSchema.parse(request);
            return [4 /*yield*/, this.getTaxConfiguration(validatedRequest.clinic_id)];
          case 1:
            taxConfig = _a.sent();
            if (!taxConfig) {
              throw new Error("Tax configuration not found for clinic");
            }
            serviceTaxCode = null;
            if (!validatedRequest.codigo_servico) return [3 /*break*/, 3];
            return [4 /*yield*/, this.getServiceTaxCode(validatedRequest.codigo_servico)];
          case 2:
            serviceTaxCode = _a.sent();
            _a.label = 3;
          case 3:
            regime = validatedRequest.regime_tributario || taxConfig.regime_tributario;
            taxBreakdown = void 0;
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
                throw new Error("Unknown tax regime: ".concat(regime));
            }
            totalTaxes = Object.values(taxBreakdown).reduce((sum, value) => sum + value, 0);
            netValue = validatedRequest.valor_base - totalTaxes;
            calculation = {
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
            return [2 /*return*/, calculation];
          case 4:
            error_3 = _a.sent();
            console.error("Tax calculation error:", error_3);
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Calculate taxes under Simples Nacional regime
  BrazilianTaxEngine.prototype.calculateSimplesNacional = (
    valorBase,
    taxConfig,
    serviceTaxCode,
  ) => {
    var breakdown = {
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
    var simplesRate = taxConfig.simples_nacional_rate / 100;
    breakdown.simples_nacional = valorBase * simplesRate;
    // ISS may be charged separately if municipality requires
    if (serviceTaxCode && serviceTaxCode.iss_aliquota_minima > 0) {
      // Check if ISS is included in Simples or charged separately
      // For healthcare services, often charged separately
      var issRate = taxConfig.iss_rate / 100;
      breakdown.iss = valorBase * issRate;
    }
    return breakdown;
  };
  // Calculate taxes under Lucro Presumido regime
  BrazilianTaxEngine.prototype.calculateLucroPresumido = (valorBase, taxConfig, serviceTaxCode) => {
    var breakdown = {
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
    var issRate = taxConfig.iss_rate / 100;
    breakdown.iss = valorBase * issRate;
    // PIS and COFINS (cumulative regime for Lucro Presumido)
    var pisRate = taxConfig.pis_rate / 100;
    var cofinsRate = taxConfig.cofins_rate / 100;
    breakdown.pis = valorBase * pisRate;
    breakdown.cofins = valorBase * cofinsRate;
    // IRPJ and CSLL (calculated on presumed profit)
    // For healthcare services, presumed profit is typically 32%
    var presumedProfitRate = 0.32;
    var presumedProfit = valorBase * presumedProfitRate;
    var irpjRate = taxConfig.irpj_rate / 100;
    var csllRate = taxConfig.csll_rate / 100;
    breakdown.irpj = presumedProfit * irpjRate;
    breakdown.csll = presumedProfit * csllRate;
    return breakdown;
  };
  // Calculate taxes under Lucro Real regime
  BrazilianTaxEngine.prototype.calculateLucroReal = (valorBase, taxConfig, serviceTaxCode) => {
    var breakdown = {
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
    var issRate = taxConfig.iss_rate / 100;
    breakdown.iss = valorBase * issRate;
    // PIS and COFINS (non-cumulative regime for Lucro Real)
    // Higher rates but with credit system
    var pisRate = Math.max(taxConfig.pis_rate, 1.65) / 100; // Minimum 1.65% for non-cumulative
    var cofinsRate = Math.max(taxConfig.cofins_rate, 7.6) / 100; // Minimum 7.6% for non-cumulative
    breakdown.pis = valorBase * pisRate;
    breakdown.cofins = valorBase * cofinsRate;
    // IRPJ and CSLL (calculated on actual profit)
    // For this calculation, we'll use a conservative approach
    // assuming 25% profit margin for healthcare services
    var profitMargin = 0.25;
    var estimatedProfit = valorBase * profitMargin;
    var irpjRate = taxConfig.irpj_rate / 100;
    var csllRate = taxConfig.csll_rate / 100;
    breakdown.irpj = estimatedProfit * irpjRate;
    breakdown.csll = estimatedProfit * csllRate;
    return breakdown;
  };
  // Get effective tax rate for a clinic
  BrazilianTaxEngine.prototype.getEffectiveTaxRate = function (clinicId_1, serviceType_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, serviceType, valorBase) {
      var calculation, error_4;
      if (valorBase === void 0) {
        valorBase = 1000;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.calculateTaxes({
                clinic_id: clinicId,
                valor_base: valorBase,
                tipo_servico: serviceType,
              }),
            ];
          case 1:
            calculation = _a.sent();
            return [2 /*return*/, calculation.effective_rate];
          case 2:
            error_4 = _a.sent();
            console.error("Effective tax rate calculation error:", error_4);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Calculate taxes for multiple services
  BrazilianTaxEngine.prototype.calculateBulkTaxes = function (requests) {
    return __awaiter(this, void 0, void 0, function () {
      var calculations, _i, requests_1, request, calculation, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            calculations = [];
            (_i = 0), (requests_1 = requests);
            _a.label = 1;
          case 1:
            if (!(_i < requests_1.length)) return [3 /*break*/, 6];
            request = requests_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.calculateTaxes(request)];
          case 3:
            calculation = _a.sent();
            calculations.push(calculation);
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Bulk tax calculation error for request:", request, error_5);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, calculations];
        }
      });
    });
  };
  // Validate tax calculation setup
  BrazilianTaxEngine.prototype.validateTaxSetup = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var errors, warnings, taxConfig, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            errors = [];
            warnings = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, this.getTaxConfiguration(clinicId)];
          case 2:
            taxConfig = _a.sent();
            if (!taxConfig) {
              errors.push("Tax configuration not found");
              return [2 /*return*/, { isValid: false, errors: errors, warnings: warnings }];
            }
            // Validate configuration
            try {
              brazilian_tax_1.taxConfigurationSchema.parse(taxConfig);
            } catch (validationError) {
              errors.push("Tax configuration validation failed: ".concat(validationError.message));
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
            return [
              2 /*return*/,
              {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings,
              },
            ];
          case 3:
            error_6 = _a.sent();
            console.error("Tax setup validation error:", error_6);
            return [
              2 /*return*/,
              {
                isValid: false,
                errors: ["Failed to validate tax setup"],
                warnings: warnings,
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get tax summary for reporting
  BrazilianTaxEngine.prototype.getTaxSummary = function (clinicId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var summary;
      return __generator(this, (_a) => {
        try {
          summary = {
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
          return [2 /*return*/, summary];
        } catch (error) {
          console.error("Tax summary calculation error:", error);
          throw error;
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Calculate taxes for multiple services at once
   */
  BrazilianTaxEngine.calculateTaxes = function (calculations, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, calculations_1, calculation, result, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            results = [];
            (_i = 0), (calculations_1 = calculations);
            _a.label = 1;
          case 1:
            if (!(_i < calculations_1.length)) return [3 /*break*/, 6];
            calculation = calculations_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.calculateServiceTax(calculation.service_type, calculation.amount, clinicId, {
                customerCnpjCpf: calculation.customer_cnpj_cpf,
                customerCity: calculation.customer_city,
                description: calculation.description,
              }),
            ];
          case 3:
            result = _a.sent();
            results.push(result);
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
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
              error: error_7 instanceof Error ? error_7.message : "Erro no cálculo",
            });
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, results];
        }
      });
    });
  };
  return BrazilianTaxEngine;
})();
exports.BrazilianTaxEngine = BrazilianTaxEngine;
// Export the tax engine
exports.brazilianTaxEngine = new BrazilianTaxEngine();
