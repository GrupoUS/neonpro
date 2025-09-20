// Simple test without TypeScript to check imports
console.log('Testing logger imports...');

try {
  import('../packages/shared/src/services/winston-logging/index.js').then(({ enhancedLogger }) => {
    console.log('✅ Logger imported successfully');
    
    enhancedLogger.info('Test message from simple test');
    console.log('✅ Logger works!');
  }).catch(error => {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
  });
} catch (error) {
  console.error('❌ Test setup failed:', error.message);
  console.error('Stack:', error.stack);
}