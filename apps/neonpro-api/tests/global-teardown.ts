// Global type declarations for tests
declare global {
  var testConfig: any;
  var __HEALTHCARE_DB__: any;
  var __REDIS_SERVER__: any;
  var __TEST_FASTIFY__: any;
  var mockServices: any;
  var testSeeds: any;
}

export default async function globalTeardown() {
  // Limpeza global após todos os testes
  console.log("🧹 Limpando ambiente de testes...");

  // Estatísticas finais dos testes
  if ((global as any).mockServices) {
    console.log("📊 Estatísticas dos testes:");
    console.log(`   📧 Notificações enviadas:`, (global as any).mockServices.notifications);
    console.log(`   💳 Pagamentos processados:`, (global as any).mockServices.payments);
    console.log(`   🧾 Impostos calculados:`, (global as any).mockServices.taxes);
  }

  // Limpeza de recursos
  if ((global as any).testSeeds) {
    console.log("🗑️  Limpando dados de teste...");
    (global as any).testSeeds = undefined;
  }

  if ((global as any).healthcareTestUtils) {
    (global as any).healthcareTestUtils = undefined;
  }

  if ((global as any).mockServices) {
    (global as any).mockServices = undefined;
  }

  // Forçar garbage collection se disponível
  if ((global as any).gc) {
    (global as any).gc();
  }

  console.log("✅ Limpeza concluída com sucesso!");
}
