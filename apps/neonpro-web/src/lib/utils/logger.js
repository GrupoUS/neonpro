"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
// lib/utils/logger.ts
var LogLevel;
(function (LogLevel) {
  LogLevel["ERROR"] = "error";
  LogLevel["WARN"] = "warn";
  LogLevel["INFO"] = "info";
  LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var Logger = /** @class */ (function () {
  function Logger() {}
  Logger.log = function (level, message, metadata) {
    var entry = {
      level: level,
      message: message,
      timestamp: new Date(),
      metadata: metadata,
    };
    console.log(JSON.stringify(entry));
  };
  Logger.error = function (message, metadata) {
    this.log(LogLevel.ERROR, message, metadata);
  };
  Logger.warn = function (message, metadata) {
    this.log(LogLevel.WARN, message, metadata);
  };
  Logger.info = function (message, metadata) {
    this.log(LogLevel.INFO, message, metadata);
  };
  Logger.debug = function (message, metadata) {
    this.log(LogLevel.DEBUG, message, metadata);
  };
  return Logger;
})();
exports.Logger = Logger;
// Export a default instance that matches the expected interface
exports.logger = {
  error: function (message, metadata) {
    return Logger.error(message, metadata);
  },
  warn: function (message, metadata) {
    return Logger.warn(message, metadata);
  },
  info: function (message, metadata) {
    return Logger.info(message, metadata);
  },
  debug: function (message, metadata) {
    return Logger.debug(message, metadata);
  },
};
