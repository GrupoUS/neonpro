Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerClient = void 0;
exports.createClient = createClient;
// lib/supabase/server.ts
var ssr_1 = require("@supabase/ssr");
var headers_1 = require("next/headers");
function createClient() {
  var supabaseUrl = process.env.SUPABASE_URL;
  var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  var cookieStore = (0, headers_1.cookies)();
  return (0, ssr_1.createServerClient)(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach((_a) => {
            var name = _a.name,
              value = _a.value,
              options = _a.options;
            return cookieStore.set(name, value, options);
          });
        } catch (_a) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
// Ensure createServerClient is exported
var client_1 = require("./client");
Object.defineProperty(exports, "createServerClient", {
  enumerable: true,
  get: () => client_1.createClient,
});
