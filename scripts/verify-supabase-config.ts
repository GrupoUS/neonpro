/**
 * Script para verificar a configuração do Supabase
 * Execute com: pnpm tsx scripts/verify-supabase-config.ts
 */

import { createClient } from "@supabase/supabase-js";

const EXPECTED_DOMAIN = "neonpro.vercel.app";
const PROJECT_ID = "gfkskrkbnawkuppazkpt";

// Cores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

function log(
  message: string,
  type: "success" | "error" | "warning" = "success"
) {
  const color =
    type === "success"
      ? colors.green
      : type === "error"
      ? colors.red
      : colors.yellow;
  console.log(
    `${color}${
      type === "success" ? "✓" : type === "error" ? "✗" : "⚠"
    } ${message}${colors.reset}`
  );
}

async function verifySupabaseConfig() {
  console.log("\n🔍 Verificando configuração do Supabase para NeonPro...\n");

  // 1. Verificar variáveis de ambiente
  console.log("1️⃣ Verificando variáveis de ambiente:");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!supabaseUrl) {
    log("NEXT_PUBLIC_SUPABASE_URL não está definida", "error");
  } else if (supabaseUrl.includes(PROJECT_ID)) {
    log(
      `NEXT_PUBLIC_SUPABASE_URL configurada corretamente: ${supabaseUrl}`,
      "success"
    );
  } else {
    log(`NEXT_PUBLIC_SUPABASE_URL parece incorreta: ${supabaseUrl}`, "warning");
  }

  if (!supabaseAnonKey) {
    log("NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida", "error");
  } else {
    log("NEXT_PUBLIC_SUPABASE_ANON_KEY está definida", "success");
  }

  if (!siteUrl) {
    log("NEXT_PUBLIC_SITE_URL não está definida", "warning");
    log("Defina como https://neonpro.vercel.app para produção", "warning");
  } else {
    log(`NEXT_PUBLIC_SITE_URL: ${siteUrl}`, "success");
  }

  // 2. Testar conexão com Supabase
  console.log("\n2️⃣ Testando conexão com Supabase:");

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        log(`Erro ao conectar: ${error.message}`, "error");
      } else {
        log("Conexão com Supabase estabelecida com sucesso", "success");
      }
    } catch (error: any) {
      log(`Erro inesperado: ${error.message}`, "error");
    }
  } else {
    log("Não foi possível testar a conexão (variáveis faltando)", "error");
  }

  // 3. URLs que devem estar configuradas no Supabase
  console.log(
    "\n3️⃣ URLs que devem estar configuradas no Dashboard do Supabase:"
  );
  console.log("\n📌 Site URL:");
  console.log(`   https://${EXPECTED_DOMAIN}`);

  console.log("\n📌 Redirect URLs (adicione TODAS):");
  const redirectUrls = [
    `https://${EXPECTED_DOMAIN}/auth/callback`,
    `https://${EXPECTED_DOMAIN}/auth/popup-callback`,
    `https://${EXPECTED_DOMAIN}/dashboard`,
    `https://${EXPECTED_DOMAIN}/login`,
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/auth/popup-callback",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/login",
    `https://${EXPECTED_DOMAIN.split(".")[0]}-*.vercel.app/auth/callback`,
    `https://${EXPECTED_DOMAIN.split(".")[0]}-*.vercel.app/auth/popup-callback`,
  ];

  redirectUrls.forEach((url) => console.log(`   ${url}`));

  // 4. URLs para Google Cloud Console
  console.log("\n4️⃣ URLs para configurar no Google Cloud Console:");
  console.log("\n📌 Authorized JavaScript origins:");
  const origins = [
    `https://${EXPECTED_DOMAIN}`,
    "http://localhost:3000",
    `https://${PROJECT_ID}.supabase.co`,
  ];
  origins.forEach((url) => console.log(`   ${url}`));

  console.log("\n📌 Authorized redirect URIs:");
  const googleRedirects = [
    `https://${PROJECT_ID}.supabase.co/auth/v1/callback`,
    `https://${EXPECTED_DOMAIN}/auth/callback`,
    `https://${EXPECTED_DOMAIN}/auth/popup-callback`,
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/auth/popup-callback",
  ];
  googleRedirects.forEach((url) => console.log(`   ${url}`));

  // 5. Links úteis
  console.log("\n5️⃣ Links úteis:");
  console.log(
    `\n🔗 Supabase Dashboard: https://app.supabase.com/project/${PROJECT_ID}`
  );
  console.log("🔗 Google Cloud Console: https://console.cloud.google.com/");
  console.log("🔗 Vercel Dashboard: https://vercel.com/dashboard");
  console.log(`🔗 Aplicação em Produção: https://${EXPECTED_DOMAIN}`);

  console.log(
    "\n✅ Verificação concluída! Siga as instruções acima para configurar corretamente.\n"
  );
}

// Executar verificação
verifySupabaseConfig().catch(console.error);
