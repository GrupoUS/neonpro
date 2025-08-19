/**
 * Global Jest Setup - Runs once before all tests
 * Used to suppress warnings and set global configurations
 */

module.exports = async () => {
  // Suppress console warnings during tests
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  console.warn = (...args) => {
    // Suppress specific Supabase warnings
    const message = args.join(' ');
    if (
      message.includes('Multiple GoTrueClient instances detected') ||
      message.includes('GoTrueClient') ||
      message.includes('Multiple instances of auth client') ||
      message.includes('duplicate auth client')
    ) {
      return; // Suppress these warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args) => {
    // Suppress specific Supabase errors during tests
    const message = args.join(' ');
    if (
      message.includes('Multiple GoTrueClient instances detected') ||
      message.includes('GoTrueClient') ||
      message.includes('Multiple instances of auth client') ||
      message.includes('duplicate auth client')
    ) {
      return; // Suppress these errors
    }
    originalConsoleError.apply(console, args);
  };

  // Set environment variables for tests
  process.env.NODE_ENV = 'test';
  process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
};
