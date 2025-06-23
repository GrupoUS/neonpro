#!/usr/bin/env node

/**
 * Script para verificar configuração do Google OAuth
 * Execute com: node scripts/verify-oauth-config.js
 */

// Cores ANSI
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  blue: (text) =>
    console.log(`${colors.blue}${colors.bright}${text}${colors.reset}`),
  green: (text) => console.log(`${colors.green}${text}${colors.reset}`),
  yellow: (text) => console.log(`${colors.yellow}${text}${colors.reset}`),
  red: (text) => console.log(`${colors.red}${text}${colors.reset}`),
  cyan: (text) => console.log(`${colors.cyan}${text}${colors.reset}`),
  gray: (text) => console.log(`${colors.gray}${text}${colors.reset}`),
};

log.blue("\n🔍 VERIFICAÇÃO DE CONFIGURAÇÃO GOOGLE OAUTH\n");

// Verificar variáveis de ambiente
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

log.yellow("📋 Verificando variáveis de ambiente:\n");

let allEnvVarsPresent = true;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    log.green(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    log.red(`❌ ${varName}: NÃO ENCONTRADA`);
    allEnvVarsPresent = false;
  }
});

// URLs que devem estar configuradas no Google Console
const productionUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://seu-projeto-neonpro.vercel.app";
const supabaseProjectRef =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /https:\/\/(.+)\.supabase\.co/
  )?.[1] || "gfkskrkbnawkuppazkpt";

log.yellow("\n📍 URLs para configurar no Google Console:\n");
log.cyan("Authorized JavaScript origins:");
console.log(`  - ${productionUrl}`);
console.log(`  - http://localhost:3000`);
console.log(`  - http://127.0.0.1:3000`);

log.cyan("\nAuthorized redirect URIs:");
console.log(`  - ${productionUrl}/auth/callback`);
console.log(`  - http://localhost:3000/auth/callback`);
console.log(`  - http://127.0.0.1:3000/auth/callback`);
console.log(`  - https://${supabaseProjectRef}.supabase.co/auth/v1/callback`);

// URLs para Supabase Dashboard
log.yellow("\n🔐 Configuração no Supabase Dashboard:\n");
log.cyan("Site URL:");
console.log(`  ${productionUrl}`);

log.cyan("\nRedirect URLs (use wildcards):");
console.log(`  - ${productionUrl}/**`);
console.log(`  - http://localhost:3000/**`);
console.log(`  - http://127.0.0.1:3000/**`);
console.log(`  - https://*.vercel.app/**`);

// Instruções finais
if (!allEnvVarsPresent) {
  log.red("\n⚠️  ATENÇÃO: Variáveis de ambiente faltando!");
  log.yellow("Configure as variáveis faltantes no arquivo .env.local\n");
} else {
  log.green("\n✅ Todas as variáveis de ambiente estão configuradas!");
}

log.blue("\n📝 PRÓXIMOS PASSOS:\n");
console.log("1. Copie as URLs acima para o Google Console");
console.log("2. Configure as URLs no Supabase Dashboard");
console.log("3. Aguarde 5 minutos para propagação");
console.log("4. Teste o login localmente primeiro");
console.log("5. Depois teste em produção\n");

log.gray("Documentação completa em: GOOGLE_OAUTH_FIX_GUIDE.md\n");
