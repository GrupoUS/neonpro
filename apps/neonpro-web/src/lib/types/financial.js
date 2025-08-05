"use strict";
/**
 * Financial Management Types
 * Created: January 27, 2025
 * Purpose: TypeScript interfaces for invoice generation and payment tracking
 * Standards: Brazilian NFSe compliance + Shadow validation
 */
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFSeError =
  exports.PaymentProcessingError =
  exports.ShadowValidationError =
  exports.FinancialError =
    void 0;
// Error Types
var FinancialError = /** @class */ (function (_super) {
  __extends(FinancialError, _super);
  function FinancialError(message, code, details) {
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.details = details;
    _this.name = "FinancialError";
    return _this;
  }
  return FinancialError;
})(Error);
exports.FinancialError = FinancialError;
var ShadowValidationError = /** @class */ (function (_super) {
  __extends(ShadowValidationError, _super);
  function ShadowValidationError(message, variance, tolerance, details) {
    var _this = _super.call(this, message, "SHADOW_VALIDATION_FAILED", details) || this;
    _this.variance = variance;
    _this.tolerance = tolerance;
    _this.name = "ShadowValidationError";
    return _this;
  }
  return ShadowValidationError;
})(FinancialError);
exports.ShadowValidationError = ShadowValidationError;
var PaymentProcessingError = /** @class */ (function (_super) {
  __extends(PaymentProcessingError, _super);
  function PaymentProcessingError(message, payment_id, processor_error, details) {
    var _this = _super.call(this, message, "PAYMENT_PROCESSING_FAILED", details) || this;
    _this.payment_id = payment_id;
    _this.processor_error = processor_error;
    _this.name = "PaymentProcessingError";
    return _this;
  }
  return PaymentProcessingError;
})(FinancialError);
exports.PaymentProcessingError = PaymentProcessingError;
var NFSeError = /** @class */ (function (_super) {
  __extends(NFSeError, _super);
  function NFSeError(message, invoice_id, nfse_error_code, details) {
    var _this = _super.call(this, message, "NFSE_GENERATION_FAILED", details) || this;
    _this.invoice_id = invoice_id;
    _this.nfse_error_code = nfse_error_code;
    _this.name = "NFSeError";
    return _this;
  }
  return NFSeError;
})(FinancialError);
exports.NFSeError = NFSeError;
// All types are already exported individually above
