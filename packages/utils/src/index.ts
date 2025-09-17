// Utils package exports

// Logging utilities
export * from './logging/logger';
export * from './logging/redact';

// CLI utilities
export * from './cli';

// UI utilities
export * from './lib/currency/brl';
export * from './lib/utils';
export * from './lib/br/identifiers';

// Re-export specific functions for clarity
export {
  formatBRL,
  maskBRLInput,
  parseBRL
} from './lib/currency/brl';

export {
  formatBRPhone,
  formatCPF,
  validateCPF,
  validateBrazilianPhone,
  validateCPFMask,
  validateBRPhoneMask,
  cleanDocument
} from './lib/br/identifiers';

export {
  cn,
  formatDate,
  formatDateTime,
  debounce,
  throttle
} from './lib/utils';

// Placeholder exports - will be populated with actual utilities
export const auth = {};
export const components = {};
export const analytics = {};
export const performance = {};
export const compliance = {};
