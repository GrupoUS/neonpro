// Logger utility
// Provides structured logging functionality

export const logger = {
  info: (message: string, meta?: any) => {
    console.log("[INFO]", message, meta ? JSON.stringify(meta) : "");
  },
  warn: (message: string, meta?: any) => {
    console.warn("[WARN]", message, meta ? JSON.stringify(meta) : "");
  },
  error: (message: string, meta?: any) => {
    console.error("[ERROR]", message, meta ? JSON.stringify(meta) : "");
  },
  debug: (message: string, meta?: any) => {
    console.debug("[DEBUG]", message, meta ? JSON.stringify(meta) : "");
  },
};

export const placeholder = true;
export default placeholder;
