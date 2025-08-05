Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
// utils/supabase/server.ts - Alias for lib/supabase/server.ts
var server_1 = require("@/lib/supabase/server");
Object.defineProperty(exports, "createClient", {
  enumerable: true,
  get: () => server_1.createClient,
});
