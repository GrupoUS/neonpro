/**
 * Financial System Types and Interfaces
 * Story 4.1: Automated Invoice Generation + Payment Tracking
 *
 * This module provides comprehensive type definitions for the financial management system:
 * - Brazilian compliance types (NFSe, PIX, Boleto)
 * - Payment gateway integrations
 * - Tax calculation and reporting
 * - LGPD-compliant data structures
 * - Financial analytics and reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAX_REGIMES =
  exports.BRAZILIAN_STATES =
  exports.PAYMENT_GATEWAYS =
  exports.INVOICE_STATUSES =
  exports.PAYMENT_METHOD_TYPES =
    void 0;
// Constants
exports.PAYMENT_METHOD_TYPES = ["pix", "boleto", "credit_card", "debit_card", "cash", "insurance"];
exports.INVOICE_STATUSES = [
  "draft",
  "pending",
  "sent",
  "viewed",
  "partial",
  "paid",
  "overdue",
  "cancelled",
];
exports.PAYMENT_GATEWAYS = ["mercado_pago", "pagseguro", "stripe", "cielo", "rede", "getnet"];
exports.BRAZILIAN_STATES = [
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
exports.TAX_REGIMES = ["simples_nacional", "lucro_presumido", "lucro_real"];
