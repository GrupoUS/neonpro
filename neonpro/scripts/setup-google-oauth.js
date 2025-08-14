// Script para configurar e testar OAuth do Google
// Usage: node scripts/setup-google-oauth.js

require("dotenv").config({ path: ".env.local" });

console.log("🔐 Configuração do OAuth Google para NeonPro");
console.log("=".repeat(50));

const currentConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
};

console.log("📊 CONFIGURAÇÃO ATUAL:");
console.log(`✅ Supabase URL: ${currentConfig.supabaseUrl}`);
console.log(
  `${currentConfig.hasAnonKey ? "✅" : "❌"} Anon Key: ${
    currentConfig.hasAnonKey ? "Configurada" : "Faltando"
  }`
);
console.log(
  `${currentConfig.hasServiceKey ? "✅" : "❌"} Service Key: ${
    currentConfig.hasServiceKey ? "Configurada" : "Faltando"
  }`
);
console.log(`📱 App URL: ${currentConfig.appUrl}`);
console.log(
  `🔑 Google Client ID: ${
    currentConfig.googleClientId === "your_google_client_id_here"
      ? "❌ Não configurado"
      : currentConfig.googleClientId
      ? "✅ Configurado"
      : "❌ Faltando"
  }`
);
console.log(
  `🔒 Google Client Secret: ${
    currentConfig.googleClientSecret === "your_google_client_secret_here"
      ? "❌ Não configurado"
      : currentConfig.googleClientSecret
      ? "✅ Configurado"
      : "❌ Faltando"
  }`
);

console.log("\n🔧 CONFIGURAÇÃO NECESSÁRIA:");

if (currentConfig.googleClientId === "your_google_client_id_here") {
  console.log("\n⚠️  GOOGLE OAUTH PRECISA SER CONFIGURADO:");
  console.log("");
  console.log("1. Acesse Google Cloud Console:");
  console.log("   https://console.cloud.google.com");
  console.log("");
  console.log("2. Crie/configure OAuth 2.0 Client ID:");
  console.log("   - Authorized JavaScript origins:");
  console.log(`     • ${currentConfig.supabaseUrl}`);
  console.log(`     • ${currentConfig.appUrl}`);
  console.log("");
  console.log("   - Authorized redirect URIs:");
  console.log(`     • ${currentConfig.supabaseUrl}/auth/v1/callback`);
  console.log(`     • ${currentConfig.appUrl}/auth/callback`);
  console.log("");
  console.log("3. Configure no Supabase:");
  console.log(
    `   https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/auth/providers`
  );
  console.log("");
  console.log("4. Atualize .env.local com as chaves reais");
} else {
  console.log("✅ Configurações de OAuth parecem estar definidas!");
}

console.log("\n🌐 URLS IMPORTANTES:");
console.log(
  `📋 Supabase Dashboard: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt`
);
console.log(
  `🔐 Auth Providers: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/auth/providers`
);
console.log(`🌍 Google Cloud Console: https://console.cloud.google.com`);

console.log("\n🧪 TESTE DE LOGIN:");
console.log(`🔗 Login URL: ${currentConfig.appUrl}/login`);
console.log(`🏠 Dashboard URL: ${currentConfig.appUrl}/dashboard`);

console.log("\n💡 PRÓXIMOS PASSOS:");
if (currentConfig.googleClientId === "your_google_client_id_here") {
  console.log("1. ⚙️  Configure Google OAuth (seguir instruções acima)");
  console.log("2. 🧪 Teste o login");
  console.log("3. 📱 Teste funcionalidades do AP");
} else {
  console.log("1. 🧪 Teste o login com Google");
  console.log("2. 📱 Teste todas as funcionalidades");
  console.log("3. 🚀 Deploy para produção se tudo estiver ok");
}
