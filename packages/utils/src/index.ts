// Utils package exports

// Logging utilities
export * from "./logging/logger";
export * from "./logging/redact";

// CLI utilities
export * from "./cli";

// Healthcare utilities
export * from "./healthcare-errors";

// UI utilities
export * from "./currency/brl";
export * from "./utils";
export * from "./br/identifiers";

// Re-export specific functions for clarity
export { formatBRL, maskBRLInput, parseBRL } from "./currency/brl";

export {
  formatBRPhone,
  formatCPF,
  validateCPF,
  validateBrazilianPhone,
  validateCPFMask,
  validateBRPhoneMask,
  cleanDocument,
} from "./br/identifiers";

export {
  cn,
  formatDate,
  formatDateTime,
  debounce,
  throttle,
} from "./utils";

// Placeholder exports - will be populated with actual utilities
export const _auth = {};
export const _components = {};
export const _analytics = {};
export const _performance = {};
export const _compliance = {
  lgpdCompliance: (input: string) => {
    // Use dynamic import to keep tree-shaking friendly and avoid CJS require in ESM builds
    // Note: callers should handle async if we switch to true dynamic import later
    // For now, keep sync require but fix double export typo
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { lgpdCompliance } = require("./lgpd");
    return lgpdCompliance(input);
  },
};
