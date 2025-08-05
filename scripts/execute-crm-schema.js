// Script para executar o schema CRM no Supabase usando MCP
require("dotenv").config({ path: "../.env.local" });

// Configurações do Supabase - USAR VARIÁVEIS DE AMBIENTE
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gfkskrkbnawkuppazkpt.supabase.co";
const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] || "gfkskrkbnawkuppazkpt";

console.log("🚀 Executando Schema CRM no Supabase via MCP...");
console.log("📊 URL:", supabaseUrl);
console.log("🔑 Project Ref:", projectRef);

// Para executar: node execute-crm-schema.js
