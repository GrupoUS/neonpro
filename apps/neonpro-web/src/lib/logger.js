// Simple logger utility for the application
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
exports.Logger = exports.logger = void 0;
var Logger = /** @class */ (() => {
  function Logger() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }
  Logger.prototype.formatMessage = (level, message, context) => {
    var timestamp = new Date().toISOString();
    var contextStr = context ? " ".concat(JSON.stringify(context)) : "";
    return "["
      .concat(timestamp, "] ")
      .concat(level.toUpperCase(), ": ")
      .concat(message)
      .concat(contextStr);
  };
  Logger.prototype.info = function (message, context) {
    var formatted = this.formatMessage("info", message, context);
    console.log(formatted);
  };
  Logger.prototype.warn = function (message, context) {
    var formatted = this.formatMessage("warn", message, context);
    console.warn(formatted);
  };
  Logger.prototype.error = function (message, error, context) {
    var errorContext =
      error instanceof Error
        ? __assign(__assign({}, context), { error: error.message, stack: error.stack })
        : __assign(__assign({}, context), { error: error });
    var formatted = this.formatMessage("error", message, errorContext);
    console.error(formatted);
  };
  Logger.prototype.debug = function (message, context) {
    if (this.isDevelopment) {
      var formatted = this.formatMessage("debug", message, context);
      console.debug(formatted);
    }
  };
  // Create a child logger with additional context
  Logger.prototype.child = function (defaultContext) {
    return {
      info: (message, context) =>
        this.info(message, __assign(__assign({}, defaultContext), context)),
      warn: (message, context) =>
        this.warn(message, __assign(__assign({}, defaultContext), context)),
      error: (message, error, context) =>
        this.error(message, error, __assign(__assign({}, defaultContext), context)),
      debug: (message, context) =>
        this.debug(message, __assign(__assign({}, defaultContext), context)),
    };
  };
  return Logger;
})();
exports.Logger = Logger;
// Export a singleton instance
exports.logger = new Logger();
