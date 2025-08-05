/**
 * Photo Recognition System Types
 * TypeScript definitions for the patient photo recognition and management system
 *
 * @author APEX Master Developer
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        (Array.isArray({ __proto__: [] }) &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError(`Class extends value ${String(b)} is not a constructor or null`);
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
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationError =
  exports.QualityError =
  exports.PrivacyViolationError =
  exports.PhotoRecognitionError =
    void 0;
// Error Types
var PhotoRecognitionError = /** @class */ ((_super) => {
  __extends(PhotoRecognitionError, _super);
  function PhotoRecognitionError(message, code, details) {
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.details = details;
    _this.name = "PhotoRecognitionError";
    return _this;
  }
  return PhotoRecognitionError;
})(Error);
exports.PhotoRecognitionError = PhotoRecognitionError;
var PrivacyViolationError = /** @class */ ((_super) => {
  __extends(PrivacyViolationError, _super);
  function PrivacyViolationError(message, details) {
    var _this = _super.call(this, message, "PRIVACY_VIOLATION", details) || this;
    _this.name = "PrivacyViolationError";
    return _this;
  }
  return PrivacyViolationError;
})(PhotoRecognitionError);
exports.PrivacyViolationError = PrivacyViolationError;
var QualityError = /** @class */ ((_super) => {
  __extends(QualityError, _super);
  function QualityError(message, issues, details) {
    var _this =
      _super.call(this, message, "QUALITY_ERROR", __assign({ issues: issues }, details)) || this;
    _this.name = "QualityError";
    return _this;
  }
  return QualityError;
})(PhotoRecognitionError);
exports.QualityError = QualityError;
var VerificationError = /** @class */ ((_super) => {
  __extends(VerificationError, _super);
  function VerificationError(message, details) {
    var _this = _super.call(this, message, "VERIFICATION_ERROR", details) || this;
    _this.name = "VerificationError";
    return _this;
  }
  return VerificationError;
})(PhotoRecognitionError);
exports.VerificationError = VerificationError;
