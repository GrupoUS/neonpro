Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
// utils/supabase/client.ts
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
function createClient() {
  return (0, auth_helpers_nextjs_1.createClientComponentClient)();
}
