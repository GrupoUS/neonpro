// Simple test to check import resolution
try {
  const service = require('./src/services/ai-chat-service');
  console.log('SUCCESS: ai-chat-service imported', Object.keys(_service));
} catch (e) {
  console.error('ERROR importing ai-chat-_service:', e.message);
}

try {
  const service = require('./src/services/ai-chat-service.ts');
  console.log('SUCCESS: ai-chat-service.ts imported', Object.keys(_service));
} catch (e) {
  console.error('ERROR importing ai-chat-service.ts:', e.message);
}
