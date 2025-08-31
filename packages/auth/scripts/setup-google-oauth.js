// Script para configurar e testar OAuth do Google
// Usage: node scripts/setup-google-oauth.js

import { config } from "dotenv";
config({ path: ".env.local" });

const currentConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
};

if (currentConfig.googleClientId === "your_google_client_id_here") {
} else {
}
if (currentConfig.googleClientId === "your_google_client_id_here") {
} else {
}
