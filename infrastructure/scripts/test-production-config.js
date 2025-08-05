#!/usr/bin/env node

/**
 * Script para testar configurações de produção
 * Verifica conectividade com Supabase e URLs de callback
 */

const https = require("node:https");
const fs = require("node:fs");

console.log("🧪 TESTE DE CONFIGURAÇÃO DE PRODUÇÃO");
console.log("=".repeat(50));

// Ler variáveis de ambiente
const envFile = ".env.local";
let supabaseUrl = "";
let supabaseKey = "";

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8");
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

console.log("\n🔧 1. VERIFICANDO VARIÁVEIS DE AMBIENTE");
console.log(`Supabase URL: ${supabaseUrl ? "✅ Configurada" : "❌ Não encontrada"}`);
console.log(`Supabase Key: ${supabaseKey ? "✅ Configurada" : "❌ Não encontrada"}`);

// Função para testar URL
function testUrl(url, description) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      console.log(`✅ ${description}: ${response.statusCode}`);
      resolve(true);
    });

    request.on("error", (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve(false);
    });

    request.setTimeout(5000, () => {
      console.log(`⏱️ ${description}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

// Função principal de teste
async function runTests() {
  console.log("\n🌐 2. TESTANDO CONECTIVIDADE");

  if (supabaseUrl) {
    await testUrl(supabaseUrl, "Supabase Base URL");
    await testUrl(`${supabaseUrl}/auth/v1/settings`, "Supabase Auth Settings");
  }

  console.log("\n🚀 3. TESTANDO URLs DE PRODUÇÃO");
  await testUrl("https://neonpro.vercel.app", "Site Principal");
  await testUrl("https://neonpro.vercel.app/login", "Página de Login");

  console.log("\n📋 4. CONFIGURAÇÕES NECESSÁRIAS");
  console.log("\n🔧 Supabase Dashboard:");
  console.log("Site URL: https://neonpro.vercel.app");
  console.log("Redirect URLs:");
  console.log("  - https://neonpro.vercel.app/auth/callback");
  console.log("  - https://neonpro.vercel.app/auth/popup-callback");

  console.log("\n🔐 Google Console:");
  console.log("Authorized redirect URIs:");
  if (supabaseUrl) {
    console.log(`  - ${supabaseUrl}/auth/v1/callback`);
  }
  console.log("  - https://neonpro.vercel.app/auth/popup-callback");

  console.log("\n⚡ Vercel Dashboard:");
  console.log("Environment Variables:");
  console.log(`  - NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  console.log(
    `  - NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey ? "[CONFIGURADA]" : "[NÃO CONFIGURADA]"}`,
  );

  console.log("\n✅ TESTE CONCLUÍDO");
  console.log("\n🔄 PRÓXIMO PASSO: Configure as URLs acima e faça redeploy no Vercel");
}

runTests().catch(console.error);
