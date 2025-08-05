Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.withRateLimit = void 0;
// Security rate limiting utilities
var withRateLimit = (handler) => {
  return handler; // Stub implementation
};
exports.withRateLimit = withRateLimit;
exports.rateLimit = {
  check: () => true,
  reset: () => true,
};
