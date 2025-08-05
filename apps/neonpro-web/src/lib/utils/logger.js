Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
// lib/utils/logger.ts
var LogLevel;
((LogLevel) => {
  LogLevel.ERROR = "error";
  LogLevel.WARN = "warn";
  LogLevel.INFO = "info";
  LogLevel.DEBUG = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var Logger = /** @class */ (() => {
  function Logger() {}
  Logger.log = (level, message, metadata) => {
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
  error: (message, metadata) => Logger.error(message, metadata),
  warn: (message, metadata) => Logger.warn(message, metadata),
  info: (message, metadata) => Logger.info(message, metadata),
  debug: (message, metadata) => Logger.debug(message, metadata),
};
