// 🔍 Search System Types - Smart Search + NLP Integration
// NeonPro - Sistema de Busca Inteligente com Processamento de Linguagem Natural
// Quality Standard: ≥9.5/10 (BMad Enhanced)
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SEARCH_CONFIG =
  exports.SearchPermissionError =
  exports.VectorSearchError =
  exports.SearchIndexError =
  exports.NLPProcessingError =
  exports.SearchError =
    void 0;
// Error Types
var SearchError = /** @class */ ((_super) => {
  __extends(SearchError, _super);
  function SearchError(message, code, details) {
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.details = details;
    _this.name = "SearchError";
    return _this;
  }
  return SearchError;
})(Error);
exports.SearchError = SearchError;
var NLPProcessingError = /** @class */ ((_super) => {
  __extends(NLPProcessingError, _super);
  function NLPProcessingError(message, details) {
    var _this = _super.call(this, message, "NLP_PROCESSING_ERROR", details) || this;
    _this.name = "NLPProcessingError";
    return _this;
  }
  return NLPProcessingError;
})(SearchError);
exports.NLPProcessingError = NLPProcessingError;
var SearchIndexError = /** @class */ ((_super) => {
  __extends(SearchIndexError, _super);
  function SearchIndexError(message, details) {
    var _this = _super.call(this, message, "SEARCH_INDEX_ERROR", details) || this;
    _this.name = "SearchIndexError";
    return _this;
  }
  return SearchIndexError;
})(SearchError);
exports.SearchIndexError = SearchIndexError;
var VectorSearchError = /** @class */ ((_super) => {
  __extends(VectorSearchError, _super);
  function VectorSearchError(message, details) {
    var _this = _super.call(this, message, "VECTOR_SEARCH_ERROR", details) || this;
    _this.name = "VectorSearchError";
    return _this;
  }
  return VectorSearchError;
})(SearchError);
exports.VectorSearchError = VectorSearchError;
var SearchPermissionError = /** @class */ ((_super) => {
  __extends(SearchPermissionError, _super);
  function SearchPermissionError(message, details) {
    var _this = _super.call(this, message, "SEARCH_PERMISSION_ERROR", details) || this;
    _this.name = "SearchPermissionError";
    return _this;
  }
  return SearchPermissionError;
})(SearchError);
exports.SearchPermissionError = SearchPermissionError;
// Export default configuration
exports.DEFAULT_SEARCH_CONFIG = {
  nlpProvider: "openai",
  searchEngine: "elasticsearch",
  vectorDatabase: "supabase",
  embeddingModel: "text-embedding-3-small",
  maxQueryLength: 500,
  maxResults: 50,
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  auditEnabled: true,
  debugMode: false,
  fallbackToTraditionalSearch: true,
  similarityThreshold: 0.7,
  relevanceThreshold: 0.5,
  supportedLanguages: ["pt", "en"],
};
