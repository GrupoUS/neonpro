/**
 * Script para configurar automaticamente as URLs de redirect no Supabase
 * Uso: node configure-supabase-auth.js
 *
 * Requer as variáveis de ambiente:
 * - SUPABASE_SERVICE_ROLE_KEY
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SITE_URL (produção) ou http://localhost:3000 (dev)
 */

const SUPABASE_PROJECT_ID = "gfkskrkbnawkuppazkpt";
const PRODUCTION_URL = "https://neonpro.vercel.app";

// URLs de redirect necessárias
const getRedirectURLs = (_siteUrl) => [
  // Produção
  `${PRODUCTION_URL}/auth/callback`,
  `${PRODUCTION_URL}/auth/popup-callback`,
  `${PRODUCTION_URL}/dashboard`,
  `${PRODUCTION_URL}/login`,

  // Desenvolvimento
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/popup-callback",
  "http://localhost:3000/dashboard",
  "http://localhost:3000/login",

  // Preview deployments (Vercel)
  "https://neonpro-*.vercel.app/auth/callback",
  "https://neonpro-*.vercel.app/auth/popup-callback",
];

// Configuração do Google OAuth
const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authorizedOrigins: [
    PRODUCTION_URL,
    "http://localhost:3000",
    `https://${SUPABASE_PROJECT_ID}.supabase.co`,
  ],
  redirectUris: [
    `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/callback`,
    `${PRODUCTION_URL}/auth/callback`,
    `${PRODUCTION_URL}/auth/popup-callback`,
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/auth/popup-callback",
  ],
};
getRedirectURLs(PRODUCTION_URL).forEach((_url) => {});
googleOAuthConfig.authorizedOrigins.forEach((_origin) => {});
googleOAuthConfig.redirectUris.forEach((_uri) => {});
