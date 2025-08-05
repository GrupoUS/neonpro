"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
// lib/supabase/client.ts
var ssr_1 = require("@supabase/ssr");
function createClient() {
    var supabaseUrl = process.env.SUPABASE_URL;
    var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl) {
        throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!supabaseAnonKey) {
        throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return (0, ssr_1.createBrowserClient)(supabaseUrl, supabaseAnonKey);
}
