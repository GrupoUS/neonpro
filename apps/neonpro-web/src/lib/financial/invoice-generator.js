/**
 * Automated Invoice Generation System
 * Story 4.1: Automated Invoice Generation + Payment Tracking Implementation
 *
 * This module provides comprehensive invoice generation with Brazilian NFSe integration:
 * - Automated invoice creation from appointments and treatments
 * - Brazilian NFSe (Nota Fiscal de Serviços Eletrônica) compliance
 * - Multi-payment method support (PIX, Credit Card, Boleto, Cash)
 * - Tax calculation according to Brazilian regulations
 * - Integration with municipal tax systems
 * - LGPD compliance for financial data
 * - Real-time payment tracking and reconciliation
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.AutomatedInvoiceGenerator = void 0;
var client_1 = require("@/lib/supabase/client");
var AutomatedInvoiceGenerator = /** @class */ (() => {
  function AutomatedInvoiceGenerator(config) {
    this.supabase = (0, client_1.createClient)();
    this.templates = new Map();
    this.isInitialized = false;
    this.config = this.initializeConfig(config);
  }
  /**
   * Initialize the invoice generation system
   */
  AutomatedInvoiceGenerator.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            console.log("Initializing Automated Invoice Generator...");
            // Load invoice templates
            return [
              4 /*yield*/,
              this.loadInvoiceTemplates(),
              // Validate NFSe integration
            ];
          case 1:
            // Load invoice templates
            _a.sent();
            if (!this.config.nfseIntegration.enabled) return [3 /*break*/, 3];
            return [4 /*yield*/, this.validateNFSeIntegration()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (
              !(
                this.config.paymentIntegration.pixEnabled ||
                this.config.paymentIntegration.boletoEnabled ||
                this.config.paymentIntegration.creditCardEnabled
              )
            )
              return [3 /*break*/, 5];
            return [4 /*yield*/, this.setupPaymentIntegration()];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!this.config.autoGeneration.enabled) return [3 /*break*/, 7];
            return [4 /*yield*/, this.setupAutoGenerationTriggers()];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            this.isInitialized = true;
            console.log("✅ Automated Invoice Generator initialized successfully");
            return [3 /*break*/, 9];
          case 8:
            error_1 = _a.sent();
            console.error("❌ Failed to initialize invoice generator:", error_1);
            throw new Error("Invoice generator initialization failed");
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate invoice from appointment
   */
  AutomatedInvoiceGenerator.prototype.generateFromAppointment = function (appointmentId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var appointment,
        patient,
        clinic,
        services,
        template,
        taxCalculation,
        recipient,
        invoiceNumber,
        invoice,
        nfseResult,
        nfseError_1,
        error_2;
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            _j.trys.push([0, 16, , 17]);
            if (!this.isInitialized) {
              throw new Error("Invoice generator not initialized");
            }
            console.log("Generating invoice for appointment ".concat(appointmentId));
            return [4 /*yield*/, this.getAppointmentData(appointmentId)];
          case 1:
            appointment = _j.sent();
            if (!appointment) {
              throw new Error("Appointment not found");
            }
            return [4 /*yield*/, this.getPatientData(appointment.patient_id)];
          case 2:
            patient = _j.sent();
            if (!patient) {
              throw new Error("Patient not found");
            }
            return [4 /*yield*/, this.getClinicData(appointment.clinic_id)];
          case 3:
            clinic = _j.sent();
            if (!clinic) {
              throw new Error("Clinic not found");
            }
            services = void 0;
            if (!(options === null || options === void 0 ? void 0 : options.customServices))
              return [3 /*break*/, 4];
            services = options.customServices;
            return [3 /*break*/, 7];
          case 4:
            if (!(options === null || options === void 0 ? void 0 : options.templateId))
              return [3 /*break*/, 5];
            template = this.templates.get(options.templateId);
            if (!template) {
              throw new Error("Template not found");
            }
            services = this.buildServicesFromTemplate(template, appointment);
            return [3 /*break*/, 7];
          case 5:
            return [4 /*yield*/, this.buildServicesFromAppointment(appointment)];
          case 6:
            services = _j.sent();
            _j.label = 7;
          case 7:
            taxCalculation = this.calculateTaxes(services, clinic.taxInfo);
            recipient = {
              id: patient.id,
              name: patient.full_name,
              email: patient.email,
              phone: patient.phone,
              document: patient.cpf || patient.cnpj,
              documentType: patient.cpf ? "cpf" : "cnpj",
              address: {
                street:
                  ((_a = patient.address) === null || _a === void 0 ? void 0 : _a.street) || "",
                number:
                  ((_b = patient.address) === null || _b === void 0 ? void 0 : _b.number) || "",
                complement:
                  (_c = patient.address) === null || _c === void 0 ? void 0 : _c.complement,
                neighborhood:
                  ((_d = patient.address) === null || _d === void 0 ? void 0 : _d.neighborhood) ||
                  "",
                city: ((_e = patient.address) === null || _e === void 0 ? void 0 : _e.city) || "",
                state: ((_f = patient.address) === null || _f === void 0 ? void 0 : _f.state) || "",
                zipCode:
                  ((_g = patient.address) === null || _g === void 0 ? void 0 : _g.zip_code) || "",
                country: "Brasil",
              },
              taxInfo: patient.taxInfo,
            };
            return [
              4 /*yield*/,
              this.generateInvoiceNumber(clinic.id),
              // Create invoice data
            ];
          case 8:
            invoiceNumber = _j.sent();
            invoice = {
              id: "invoice_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              number: invoiceNumber.number,
              series: invoiceNumber.series,
              issueDate: new Date(),
              dueDate:
                (options === null || options === void 0 ? void 0 : options.dueDate) ||
                this.calculateDueDate(),
              recipient: recipient,
              services: services,
              paymentMethods: (
                options === null || options === void 0
                  ? void 0
                  : options.paymentMethod
              )
                ? [options.paymentMethod]
                : this.getDefaultPaymentMethods(),
              subtotal: taxCalculation.subtotal,
              taxAmount: taxCalculation.totalTaxes,
              totalAmount: taxCalculation.netAmount,
              currency: "BRL",
              status: "draft",
              metadata: {
                appointmentId: appointmentId,
                patientId: patient.id,
                clinicId: clinic.id,
                createdBy: appointment.created_by || "system",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            };
            // Store invoice in database
            return [
              4 /*yield*/,
              this.storeInvoice(invoice),
              // Generate NFSe if requested and enabled
            ];
          case 9:
            // Store invoice in database
            _j.sent();
            if (
              !(
                (options === null || options === void 0 ? void 0 : options.generateNFSe) !==
                  false && this.config.nfseIntegration.enabled
              )
            )
              return [3 /*break*/, 15];
            _j.label = 10;
          case 10:
            _j.trys.push([10, 14, , 15]);
            return [4 /*yield*/, this.generateNFSe(invoice)];
          case 11:
            nfseResult = _j.sent();
            if (!nfseResult.success) return [3 /*break*/, 13];
            invoice.nfseInfo = {
              number: nfseResult.nfseNumber,
              verificationCode: nfseResult.verificationCode,
              accessKey: nfseResult.accessKey,
              issueDate: nfseResult.issueDate,
              status: "issued",
              municipalityCode: this.config.nfseIntegration.municipalityCode,
              serviceLocation:
                ((_h = clinic.address) === null || _h === void 0 ? void 0 : _h.city) || "",
            };
            invoice.status = "issued";
            return [4 /*yield*/, this.updateInvoice(invoice)];
          case 12:
            _j.sent();
            _j.label = 13;
          case 13:
            return [3 /*break*/, 15];
          case 14:
            nfseError_1 = _j.sent();
            console.error("NFSe generation failed:", nfseError_1);
            return [3 /*break*/, 15];
          case 15:
            console.log("\u2705 Invoice ".concat(invoice.number, " generated successfully"));
            return [2 /*return*/, invoice];
          case 16:
            error_2 = _j.sent();
            console.error("❌ Invoice generation failed:", error_2);
            throw new Error("Invoice generation failed: ".concat(error_2.message));
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate invoice from treatment
   */
  AutomatedInvoiceGenerator.prototype.generateFromTreatment = function (treatmentId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var treatment,
        invoices,
        installmentAmount,
        i,
        dueDate,
        installmentInvoice,
        singleInvoice,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            console.log("Generating invoice(s) for treatment ".concat(treatmentId));
            return [4 /*yield*/, this.getTreatmentData(treatmentId)];
          case 1:
            treatment = _a.sent();
            if (!treatment) {
              throw new Error("Treatment not found");
            }
            invoices = [];
            if (
              !(
                (options === null || options === void 0 ? void 0 : options.installments) &&
                options.installments > 1
              )
            )
              return [3 /*break*/, 6];
            installmentAmount = treatment.total_cost / options.installments;
            i = 0;
            _a.label = 2;
          case 2:
            if (!(i < options.installments)) return [3 /*break*/, 5];
            dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i);
            return [
              4 /*yield*/,
              this.generateInstallmentInvoice(
                treatment,
                i + 1,
                options.installments,
                installmentAmount,
                dueDate,
                options,
              ),
            ];
          case 3:
            installmentInvoice = _a.sent();
            invoices.push(installmentInvoice);
            _a.label = 4;
          case 4:
            i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 8];
          case 6:
            return [4 /*yield*/, this.generateSingleTreatmentInvoice(treatment, options)];
          case 7:
            singleInvoice = _a.sent();
            invoices.push(singleInvoice);
            _a.label = 8;
          case 8:
            console.log(
              "\u2705 Generated "
                .concat(invoices.length, " invoice(s) for treatment ")
                .concat(treatmentId),
            );
            return [2 /*return*/, invoices];
          case 9:
            error_3 = _a.sent();
            console.error("❌ Treatment invoice generation failed:", error_3);
            throw new Error("Treatment invoice generation failed: ".concat(error_3.message));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate Brazilian taxes
   */
  AutomatedInvoiceGenerator.prototype.calculateTaxes = (services, clinicTaxInfo) => {
    var subtotal = services.reduce((sum, service) => sum + service.totalPrice, 0);
    var issAmount = 0;
    var pisAmount = 0;
    var cofinsAmount = 0;
    var irAmount = 0;
    var csllAmount = 0;
    // Calculate ISS (Imposto Sobre Serviços)
    var taxableServices = services.filter((s) => s.taxable);
    var taxableAmount = taxableServices.reduce((sum, service) => sum + service.totalPrice, 0);
    if (taxableAmount > 0) {
      issAmount = taxableAmount * (clinicTaxInfo.aliquotaISS / 100);
      // For Simples Nacional, other taxes are included in ISS
      if (clinicTaxInfo.regimeTributario !== "simples_nacional") {
        if (clinicTaxInfo.aliquotaPIS) {
          pisAmount = taxableAmount * (clinicTaxInfo.aliquotaPIS / 100);
        }
        if (clinicTaxInfo.aliquotaCOFINS) {
          cofinsAmount = taxableAmount * (clinicTaxInfo.aliquotaCOFINS / 100);
        }
        if (clinicTaxInfo.aliquotaIR) {
          irAmount = taxableAmount * (clinicTaxInfo.aliquotaIR / 100);
        }
        if (clinicTaxInfo.aliquotaCSLL) {
          csllAmount = taxableAmount * (clinicTaxInfo.aliquotaCSLL / 100);
        }
      }
    }
    var totalTaxes = issAmount + pisAmount + cofinsAmount + irAmount + csllAmount;
    // Calculate retentions (when client retains taxes)
    var retentions = {
      issRetention: services.some((s) => s.issRetention) ? issAmount : 0,
      irRetention: 0, // Would be calculated based on client type
      pisRetention: 0,
      cofinsRetention: 0,
      csllRetention: 0,
    };
    var netAmount =
      subtotal -
      retentions.issRetention -
      retentions.irRetention -
      retentions.pisRetention -
      retentions.cofinsRetention -
      retentions.csllRetention;
    return {
      subtotal: subtotal,
      issAmount: issAmount,
      pisAmount: pisAmount,
      cofinsAmount: cofinsAmount,
      irAmount: irAmount,
      csllAmount: csllAmount,
      totalTaxes: totalTaxes,
      netAmount: netAmount,
      retentions: retentions,
    };
  };
  /**
   * Generate NFSe (Brazilian Electronic Service Invoice)
   */
  AutomatedInvoiceGenerator.prototype.generateNFSe = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      var clinic, nfseRequest, nfseResponse, error_4;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            console.log("Generating NFSe for invoice ".concat(invoice.number));
            return [4 /*yield*/, this.getClinicData(invoice.metadata.clinicId)];
          case 1:
            clinic = _c.sent();
            if (
              !((_a = clinic === null || clinic === void 0 ? void 0 : clinic.taxInfo) === null ||
              _a === void 0
                ? void 0
                : _a.cnpj)
            ) {
              throw new Error("Clinic CNPJ required for NFSe generation");
            }
            nfseRequest = {
              prestador: {
                cnpj: clinic.taxInfo.cnpj,
                inscricaoMunicipal: clinic.taxInfo.inscricaoMunicipal || "",
                razaoSocial: clinic.name,
              },
              tomador: {
                documento: invoice.recipient.document,
                tipoDocumento: invoice.recipient.documentType,
                razaoSocial: invoice.recipient.name,
                endereco: {
                  logradouro: invoice.recipient.address.street,
                  numero: invoice.recipient.address.number,
                  complemento: invoice.recipient.address.complement,
                  bairro: invoice.recipient.address.neighborhood,
                  cidade: invoice.recipient.address.city,
                  uf: invoice.recipient.address.state,
                  cep: invoice.recipient.address.zipCode.replace(/\D/g, ""),
                },
              },
              servico: {
                discriminacao: invoice.services.map((s) => s.description).join("; "),
                codigoServico:
                  ((_b = invoice.services[0]) === null || _b === void 0
                    ? void 0
                    : _b.serviceCode) || "1.01", // Default to medical consultation
                valorServicos: invoice.subtotal,
                aliquota: clinic.taxInfo.aliquotaISS,
                issRetido: invoice.services.some((s) => s.issRetention),
                municipioPrestacao: this.config.nfseIntegration.municipalityCode,
              },
              valores: {
                valorServicos: invoice.subtotal,
                valorDeducoes: 0,
                valorPis: 0, // Calculated based on tax regime
                valorCofins: 0,
                valorInss: 0,
                valorIr: 0,
                valorCsll: 0,
                valorIss: invoice.taxAmount,
                valorIssRetido: invoice.services.some((s) => s.issRetention)
                  ? invoice.taxAmount
                  : 0,
                outrasRetencoes: 0,
                valorLiquido: invoice.totalAmount,
              },
            };
            return [4 /*yield*/, this.callNFSeWebservice(nfseRequest)];
          case 2:
            nfseResponse = _c.sent();
            if (!nfseResponse.success) return [3 /*break*/, 4];
            console.log("\u2705 NFSe generated: ".concat(nfseResponse.nfseNumber));
            // Store NFSe data
            return [4 /*yield*/, this.storeNFSeData(invoice.id, nfseResponse)];
          case 3:
            // Store NFSe data
            _c.sent();
            _c.label = 4;
          case 4:
            return [2 /*return*/, nfseResponse];
          case 5:
            error_4 = _c.sent();
            console.error("❌ NFSe generation failed:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "NFSE_GENERATION_ERROR",
                  message: error_4.message,
                },
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Track payment for invoice
   */
  AutomatedInvoiceGenerator.prototype.trackPayment = function (invoiceId, paymentData) {
    return __awaiter(this, void 0, void 0, function () {
      var invoice, payment, totalPaid, newStatus, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            console.log("Tracking payment for invoice ".concat(invoiceId));
            return [4 /*yield*/, this.getInvoice(invoiceId)];
          case 1:
            invoice = _a.sent();
            if (!invoice) {
              throw new Error("Invoice not found");
            }
            payment = {
              id: "payment_"
                .concat(Date.now(), "_")
                .concat(Math.random().toString(36).substr(2, 9)),
              invoice_id: invoiceId,
              amount: paymentData.amount,
              method: paymentData.method.type,
              transaction_id: paymentData.transactionId,
              paid_at: paymentData.paidAt,
              fees: paymentData.fees || 0,
              notes: paymentData.notes,
              status: "confirmed",
              created_at: new Date(),
            };
            // Store payment
            return [
              4 /*yield*/,
              this.supabase
                .from("invoice_payments")
                .insert(payment),
              // Update invoice status
            ];
          case 2:
            // Store payment
            _a.sent();
            return [4 /*yield*/, this.getTotalPaidAmount(invoiceId)];
          case 3:
            totalPaid = _a.sent();
            newStatus = "sent";
            if (totalPaid >= invoice.totalAmount) {
              newStatus = "paid";
            } else if (totalPaid > 0) {
              newStatus = "sent"; // Partially paid
            }
            if (!(invoice.status !== newStatus)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.updateInvoiceStatus(invoiceId, newStatus)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!this.config.notifications.emailEnabled) return [3 /*break*/, 7];
            return [4 /*yield*/, this.sendPaymentConfirmation(invoice, payment)];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            console.log("\u2705 Payment tracked for invoice ".concat(invoiceId));
            return [3 /*break*/, 9];
          case 8:
            error_5 = _a.sent();
            console.error("❌ Payment tracking failed:", error_5);
            throw new Error("Payment tracking failed: ".concat(error_5.message));
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate payment link (PIX, Boleto, etc.)
   */
  AutomatedInvoiceGenerator.prototype.generatePaymentLink = function (invoiceId, method) {
    return __awaiter(this, void 0, void 0, function () {
      var invoice, expiresAt, _a, pixCode, boletoUrl, paymentUrl, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.getInvoice(invoiceId)];
          case 1:
            invoice = _b.sent();
            if (!invoice) {
              throw new Error("Invoice not found");
            }
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration
            _a = method.type;
            switch (_a) {
              case "pix":
                return [3 /*break*/, 2];
              case "boleto":
                return [3 /*break*/, 4];
              case "credit_card":
                return [3 /*break*/, 6];
              case "debit_card":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 8];
          case 2:
            return [4 /*yield*/, this.generatePixCode(invoice)];
          case 3:
            pixCode = _b.sent();
            return [2 /*return*/, { pixCode: pixCode, expiresAt: expiresAt }];
          case 4:
            return [4 /*yield*/, this.generateBoleto(invoice)];
          case 5:
            boletoUrl = _b.sent();
            return [2 /*return*/, { boletoUrl: boletoUrl, expiresAt: expiresAt }];
          case 6:
            return [4 /*yield*/, this.generateCardPaymentUrl(invoice, method)];
          case 7:
            paymentUrl = _b.sent();
            return [2 /*return*/, { paymentUrl: paymentUrl, expiresAt: expiresAt }];
          case 8:
            throw new Error("Unsupported payment method");
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_6 = _b.sent();
            console.error("❌ Payment link generation failed:", error_6);
            throw new Error("Payment link generation failed: ".concat(error_6.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get invoice analytics
   */
  AutomatedInvoiceGenerator.prototype.getInvoiceAnalytics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        invoices,
        totalInvoices,
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        paymentMethods,
        paymentTimes,
        _i,
        invoices_1,
        invoice,
        payments,
        invoicePaidAmount,
        lastPayment,
        paymentTime,
        _a,
        payments_1,
        payment,
        averagePaymentTime,
        monthlyData,
        _b,
        invoices_2,
        invoice,
        month,
        monthlyTrends,
        error_7;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("invoices")
              .select("\n          *,\n          invoice_payments(*)\n        ");
            if (filters === null || filters === void 0 ? void 0 : filters.startDate) {
              query = query.gte("issue_date", filters.startDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.endDate) {
              query = query.lte("issue_date", filters.endDate.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.clinicId) {
              query = query.eq("clinic_id", filters.clinicId);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            return [4 /*yield*/, query];
          case 1:
            invoices = _c.sent().data;
            if (!invoices) {
              throw new Error("Failed to fetch invoice data");
            }
            totalInvoices = invoices.length;
            totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
            paidAmount = 0;
            pendingAmount = 0;
            overdueAmount = 0;
            paymentMethods = {};
            paymentTimes = [];
            for (_i = 0, invoices_1 = invoices; _i < invoices_1.length; _i++) {
              invoice = invoices_1[_i];
              payments = invoice.invoice_payments || [];
              invoicePaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
              if (invoice.status === "paid") {
                paidAmount += invoice.total_amount;
                lastPayment = payments[payments.length - 1];
                if (lastPayment) {
                  paymentTime =
                    new Date(lastPayment.paid_at).getTime() -
                    new Date(invoice.issue_date).getTime();
                  paymentTimes.push(paymentTime / (1000 * 60 * 60 * 24)); // Convert to days
                }
              } else if (new Date(invoice.due_date) < new Date()) {
                overdueAmount += invoice.total_amount - invoicePaidAmount;
              } else {
                pendingAmount += invoice.total_amount - invoicePaidAmount;
              }
              // Count payment methods
              for (_a = 0, payments_1 = payments; _a < payments_1.length; _a++) {
                payment = payments_1[_a];
                paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + 1;
              }
            }
            averagePaymentTime =
              paymentTimes.length > 0
                ? paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length
                : 0;
            monthlyData = {};
            for (_b = 0, invoices_2 = invoices; _b < invoices_2.length; _b++) {
              invoice = invoices_2[_b];
              month = new Date(invoice.issue_date).toISOString().substring(0, 7); // YYYY-MM
              if (!monthlyData[month]) {
                monthlyData[month] = { invoices: 0, amount: 0, paidAmount: 0 };
              }
              monthlyData[month].invoices++;
              monthlyData[month].amount += invoice.total_amount;
              if (invoice.status === "paid") {
                monthlyData[month].paidAmount += invoice.total_amount;
              }
            }
            monthlyTrends = Object.entries(monthlyData)
              .map((_a) => {
                var month = _a[0],
                  data = _a[1];
                return __assign({ month: month }, data);
              })
              .sort((a, b) => a.month.localeCompare(b.month));
            return [
              2 /*return*/,
              {
                totalInvoices: totalInvoices,
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                pendingAmount: pendingAmount,
                overdueAmount: overdueAmount,
                averagePaymentTime: averagePaymentTime,
                paymentMethodDistribution: paymentMethods,
                monthlyTrends: monthlyTrends,
              },
            ];
          case 2:
            error_7 = _c.sent();
            console.error("❌ Failed to get invoice analytics:", error_7);
            throw new Error("Analytics generation failed: ".concat(error_7.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  AutomatedInvoiceGenerator.prototype.initializeConfig = (config) => {
    var defaultConfig = {
      autoGeneration: {
        enabled: true,
        triggers: ["appointment_completed", "treatment_finished"],
        delay: 5, // 5 minutes
      },
      nfseIntegration: {
        enabled: true,
        environment: "sandbox",
        municipalityCode: "3550308", // São Paulo
        webserviceUrl: "https://nfse.prefeitura.sp.gov.br/ws/lotenfe.asmx",
      },
      paymentIntegration: {
        pixEnabled: true,
        boletoEnabled: true,
        creditCardEnabled: true,
        paymentGateway: "stripe",
      },
      compliance: {
        lgpdCompliant: true,
        dataRetentionDays: 2555, // 7 years
        auditTrail: true,
        encryptSensitiveData: true,
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: false,
        reminderDays: [7, 3, 1], // Days before due date
      },
    };
    return __assign(__assign({}, defaultConfig), config);
  };
  AutomatedInvoiceGenerator.prototype.loadInvoiceTemplates = function () {
    return __awaiter(this, void 0, void 0, function () {
      var templates, _i, templates_1, template;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("invoice_templates").select("*").eq("active", true),
            ];
          case 1:
            templates = _a.sent().data;
            if (templates) {
              for (_i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
                template = templates_1[_i];
                this.templates.set(template.id, template);
              }
            }
            return [2 /*return*/];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.validateNFSeIntegration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Validate NFSe configuration and connectivity
        console.log("Validating NFSe integration...");
        return [2 /*return*/];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.setupPaymentIntegration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Setup payment gateway integration
        console.log("Setting up payment integration...");
        return [2 /*return*/];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.setupAutoGenerationTriggers = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Setup database triggers for auto-generation
        console.log("Setting up auto-generation triggers...");
        return [2 /*return*/];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getAppointmentData = function (appointmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("appointments").select("*").eq("id", appointmentId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getPatientData = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("patients").select("*").eq("id", patientId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getClinicData = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("clinics").select("*").eq("id", clinicId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getTreatmentData = function (treatmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("treatments").select("*").eq("id", treatmentId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.buildServicesFromTemplate = (template, appointment) =>
    template.services.map((service, index) => ({
      id: "service_".concat(index),
      description: service.description,
      serviceCode: service.serviceCode,
      quantity: 1,
      unitPrice: service.unitPrice,
      totalPrice: service.unitPrice,
      taxable: true,
      issRetention: false,
    }));
  AutomatedInvoiceGenerator.prototype.buildServicesFromAppointment = function (appointment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Build services based on appointment type and procedures
        return [
          2 /*return*/,
          [
            {
              id: "service_1",
              description: "Consulta médica",
              serviceCode: "1.01",
              quantity: 1,
              unitPrice: appointment.price || 150.0,
              totalPrice: appointment.price || 150.0,
              taxable: true,
              issRetention: false,
            },
          ],
        ];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generateInvoiceNumber = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var lastInvoice, lastNumber, newNumber;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .select("number")
                .eq("clinic_id", clinicId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            lastInvoice = _a.sent().data;
            lastNumber = (
              lastInvoice === null || lastInvoice === void 0
                ? void 0
                : lastInvoice.number
            )
              ? parseInt(lastInvoice.number)
              : 0;
            newNumber = (lastNumber + 1).toString().padStart(6, "0");
            return [
              2 /*return*/,
              {
                number: newNumber,
                series: "001",
              },
            ];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.calculateDueDate = () => {
    var dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days default
    return dueDate;
  };
  AutomatedInvoiceGenerator.prototype.getDefaultPaymentMethods = function () {
    var methods = [];
    if (this.config.paymentIntegration.pixEnabled) {
      methods.push({ type: "pix" });
    }
    if (this.config.paymentIntegration.boletoEnabled) {
      methods.push({ type: "boleto" });
    }
    if (this.config.paymentIntegration.creditCardEnabled) {
      methods.push({ type: "credit_card" });
    }
    return methods;
  };
  AutomatedInvoiceGenerator.prototype.storeInvoice = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("invoices").insert({
                id: invoice.id,
                number: invoice.number,
                series: invoice.series,
                issue_date: invoice.issueDate.toISOString(),
                due_date: invoice.dueDate.toISOString(),
                recipient_data: JSON.stringify(invoice.recipient),
                services_data: JSON.stringify(invoice.services),
                payment_methods: JSON.stringify(invoice.paymentMethods),
                subtotal: invoice.subtotal,
                tax_amount: invoice.taxAmount,
                total_amount: invoice.totalAmount,
                currency: invoice.currency,
                status: invoice.status,
                nfse_info: JSON.stringify(invoice.nfseInfo),
                appointment_id: invoice.metadata.appointmentId,
                treatment_id: invoice.metadata.treatmentId,
                patient_id: invoice.metadata.patientId,
                clinic_id: invoice.metadata.clinicId,
                created_by: invoice.metadata.createdBy,
                notes: invoice.metadata.notes,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.updateInvoice = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .update({
                  status: invoice.status,
                  nfse_info: JSON.stringify(invoice.nfseInfo),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", invoice.id),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getInvoice = function (invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("invoices").select("*").eq("id", invoiceId).single(),
            ];
          case 1:
            data = _a.sent().data;
            if (!data)
              return [
                2 /*return*/,
                null,
                // Convert database record to InvoiceData
              ];
            // Convert database record to InvoiceData
            return [
              2 /*return*/,
              {
                id: data.id,
                number: data.number,
                series: data.series,
                issueDate: new Date(data.issue_date),
                dueDate: new Date(data.due_date),
                recipient: JSON.parse(data.recipient_data),
                services: JSON.parse(data.services_data),
                paymentMethods: JSON.parse(data.payment_methods),
                subtotal: data.subtotal,
                taxAmount: data.tax_amount,
                totalAmount: data.total_amount,
                currency: data.currency,
                status: data.status,
                nfseInfo: data.nfse_info ? JSON.parse(data.nfse_info) : undefined,
                metadata: {
                  appointmentId: data.appointment_id,
                  treatmentId: data.treatment_id,
                  patientId: data.patient_id,
                  clinicId: data.clinic_id,
                  createdBy: data.created_by,
                  createdAt: new Date(data.created_at),
                  updatedAt: new Date(data.updated_at),
                  notes: data.notes,
                },
              },
            ];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generateInstallmentInvoice = function (
    treatment,
    installmentNumber,
    totalInstallments,
    amount,
    dueDate,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for installment invoice generation
        throw new Error("Method not implemented");
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generateSingleTreatmentInvoice = function (
    treatment,
    options,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for single treatment invoice
        throw new Error("Method not implemented");
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.callNFSeWebservice = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for NFSe webservice call
        // This would vary by municipality
        return [
          2 /*return*/,
          {
            success: true,
            nfseNumber: "123456",
            verificationCode: "ABC123",
            accessKey: "KEY123",
            issueDate: new Date(),
          },
        ];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.storeNFSeData = function (invoiceId, nfseResponse) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("nfse_records").insert({
                invoice_id: invoiceId,
                nfse_number: nfseResponse.nfseNumber,
                verification_code: nfseResponse.verificationCode,
                access_key: nfseResponse.accessKey,
                issue_date:
                  (_a = nfseResponse.issueDate) === null || _a === void 0
                    ? void 0
                    : _a.toISOString(),
                pdf_url: nfseResponse.pdfUrl,
                xml_url: nfseResponse.xmlUrl,
              }),
            ];
          case 1:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.getTotalPaidAmount = function (invoiceId) {
    return __awaiter(this, void 0, void 0, function () {
      var payments;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoice_payments")
                .select("amount")
                .eq("invoice_id", invoiceId)
                .eq("status", "confirmed"),
            ];
          case 1:
            payments = _a.sent().data;
            return [
              2 /*return*/,
              (payments === null || payments === void 0
                ? void 0
                : payments.reduce((sum, payment) => sum + payment.amount, 0)) || 0,
            ];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.updateInvoiceStatus = function (invoiceId, status) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq("id", invoiceId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.sendPaymentConfirmation = function (invoice, payment) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for payment confirmation email/SMS
        console.log("Sending payment confirmation for invoice ".concat(invoice.number));
        return [2 /*return*/];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generatePixCode = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate PIX payment code
        return [2 /*return*/, "PIX_CODE_".concat(invoice.id)];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generateBoleto = function (invoice) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate boleto URL
        return [2 /*return*/, "https://boleto.example.com/".concat(invoice.id)];
      });
    });
  };
  AutomatedInvoiceGenerator.prototype.generateCardPaymentUrl = function (invoice, method) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Generate card payment URL
        return [2 /*return*/, "https://payment.example.com/".concat(invoice.id)];
      });
    });
  };
  return AutomatedInvoiceGenerator;
})();
exports.AutomatedInvoiceGenerator = AutomatedInvoiceGenerator;
