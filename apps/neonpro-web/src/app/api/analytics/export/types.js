"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportErrorCode = exports.DEFAULT_EXPORT_OPTIONS = exports.FILE_EXTENSIONS = exports.CONTENT_TYPES = exports.SUPPORTED_TYPES = exports.SUPPORTED_FORMATS = void 0;
// Validation Schemas (for runtime validation)
exports.SUPPORTED_FORMATS = ['csv', 'excel', 'pdf', 'json'];
exports.SUPPORTED_TYPES = ['cohort', 'forecast', 'insights', 'dashboard', 'realtime'];
exports.CONTENT_TYPES = {
    csv: 'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    json: 'application/json'
};
exports.FILE_EXTENSIONS = {
    csv: '.csv',
    excel: '.xlsx',
    pdf: '.pdf',
    json: '.json'
};
// Default Export Options
exports.DEFAULT_EXPORT_OPTIONS = {
    includeHeader: true,
    includeFooter: true,
    orientation: 'portrait',
    compression: false
};
// Error Codes
var ExportErrorCode;
(function (ExportErrorCode) {
    ExportErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    ExportErrorCode["INVALID_TYPE"] = "INVALID_TYPE";
    ExportErrorCode["MISSING_DATA"] = "MISSING_DATA";
    ExportErrorCode["GENERATION_FAILED"] = "GENERATION_FAILED";
    ExportErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    ExportErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ExportErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ExportErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
})(ExportErrorCode || (exports.ExportErrorCode = ExportErrorCode = {}));
