// Utils package exports

// Currency utilities (main exports)
export * from './lib/currency/brl';

// Additional re-exports for direct access
export { formatBRL, maskBRLInput, parseBRLInput } from './lib/currency/brl';

// UI utilities  
export * from './lib/utils';

// Logging utilities  
export * from './logging/logger';
export * from './logging/redact';

// CLI utilities
export * from './cli';

// Placeholder exports for future utilities
export const auth = {};
export const components = {};
export const analytics = {};
export const performance = {};
export const compliance = {};
