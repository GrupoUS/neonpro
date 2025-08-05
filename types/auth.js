"use strict";
/**
 * Authentication Types for NeonPro Healthcare Platform
 *
 * Comprehensive TypeScript definitions for authentication, MFA, and security features
 * with healthcare compliance requirements (LGPD, ANVISA, CFM).
 *
 * @version 1.0.0
 * @author NeonPro Development Team
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
exports.MFARateLimitError =
  exports.MFAVerificationError =
  exports.MFASetupError =
  exports.MFAError =
    void 0;
// Error Types
var MFAError = /** @class */ (function (_super) {
  __extends(MFAError, _super);
  function MFAError(message, code, statusCode, metadata) {
    if (statusCode === void 0) {
      statusCode = 400;
    }
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.statusCode = statusCode;
    _this.metadata = metadata;
    _this.name = "MFAError";
    return _this;
  }
  return MFAError;
})(Error);
exports.MFAError = MFAError;
var MFASetupError = /** @class */ (function (_super) {
  __extends(MFASetupError, _super);
  function MFASetupError(message, metadata) {
    var _this = _super.call(this, message, "MFA_SETUP_ERROR", 400, metadata) || this;
    _this.name = "MFASetupError";
    return _this;
  }
  return MFASetupError;
})(MFAError);
exports.MFASetupError = MFASetupError;
var MFAVerificationError = /** @class */ (function (_super) {
  __extends(MFAVerificationError, _super);
  function MFAVerificationError(message, metadata) {
    var _this = _super.call(this, message, "MFA_VERIFICATION_ERROR", 401, metadata) || this;
    _this.name = "MFAVerificationError";
    return _this;
  }
  return MFAVerificationError;
})(MFAError);
exports.MFAVerificationError = MFAVerificationError;
var MFARateLimitError = /** @class */ (function (_super) {
  __extends(MFARateLimitError, _super);
  function MFARateLimitError(message, lockedUntil, metadata) {
    var _this =
      _super.call(
        this,
        message,
        "MFA_RATE_LIMIT_ERROR",
        429,
        __assign(__assign({}, metadata), { lockedUntil: lockedUntil }),
      ) || this;
    _this.name = "MFARateLimitError";
    return _this;
  }
  return MFARateLimitError;
})(MFAError);
exports.MFARateLimitError = MFARateLimitError;
