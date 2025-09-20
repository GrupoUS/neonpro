// Simple test to check import resolution
try {
  const service = require("./src/services/ai-chat-service");
  console.log("SUCCESS: ai-chat-service imported", Object.keys(service));
} catch (e) {
  console.error("ERROR importing ai-chat-service:", e.message);
}

try {
  const service = require("./src/services/ai-chat-service.ts");
  console.log("SUCCESS: ai-chat-service.ts imported", Object.keys(service));
} catch (e) {
  console.error("ERROR importing ai-chat-service.ts:", e.message);
}
