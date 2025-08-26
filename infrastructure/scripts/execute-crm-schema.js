// Script para executar o schema CRM no Supabase usando MCP
require("dotenv").config({ path: "../.env.local" });

// Configurações do Supabase - USAR VARIÁVEIS DE AMBIENTE
const _supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL ||
	"https://gfkskrkbnawkuppazkpt.supabase.co";
const _supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;
const _projectRef =
	process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0] ||
	"gfkskrkbnawkuppazkpt";

// Para executar: node execute-crm-schema.js
