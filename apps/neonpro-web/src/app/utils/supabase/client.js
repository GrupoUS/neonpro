Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.createLegacyClient = createClient;
exports.createOptimizedClient = createOptimizedClient;
// app/utils/supabase/client.ts
// Updated client with proper error handling
var ssr_1 = require("@supabase/ssr");
function createClient() {
  var supabaseUrl = process.env.SUPABASE_URL;
  var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    throw new Error("Supabase configuration is missing");
  }
  return (0, ssr_1.createBrowserClient)(supabaseUrl, supabaseAnonKey);
}
// Simplified optimized client for now
function createOptimizedClient(clinicId) {
  return createClient();
}
