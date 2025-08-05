"use strict";
// System Integration Types
// Types for advanced patient search, quick access, and system integration features
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
exports.SegmentError =
  exports.QuickAccessError =
  exports.SearchError =
  exports.SystemIntegrationError =
    void 0;
// Error Types
var SystemIntegrationError = /** @class */ (function (_super) {
  __extends(SystemIntegrationError, _super);
  function SystemIntegrationError(message, code, details) {
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.details = details;
    _this.name = "SystemIntegrationError";
    return _this;
  }
  return SystemIntegrationError;
})(Error);
exports.SystemIntegrationError = SystemIntegrationError;
var SearchError = /** @class */ (function (_super) {
  __extends(SearchError, _super);
  function SearchError(message, details) {
    var _this = _super.call(this, message, "SEARCH_ERROR", details) || this;
    _this.name = "SearchError";
    return _this;
  }
  return SearchError;
})(SystemIntegrationError);
exports.SearchError = SearchError;
var QuickAccessError = /** @class */ (function (_super) {
  __extends(QuickAccessError, _super);
  function QuickAccessError(message, details) {
    var _this = _super.call(this, message, "QUICK_ACCESS_ERROR", details) || this;
    _this.name = "QuickAccessError";
    return _this;
  }
  return QuickAccessError;
})(SystemIntegrationError);
exports.QuickAccessError = QuickAccessError;
var SegmentError = /** @class */ (function (_super) {
  __extends(SegmentError, _super);
  function SegmentError(message, details) {
    var _this = _super.call(this, message, "SEGMENT_ERROR", details) || this;
    _this.name = "SegmentError";
    return _this;
  }
  return SegmentError;
})(SystemIntegrationError);
exports.SegmentError = SegmentError;
