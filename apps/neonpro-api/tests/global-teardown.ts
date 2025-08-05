export default async function globalTeardown() {
  // Limpeza global após todos os testes
  console.log("🧹 Limpando ambiente de testes...");

  // Estatísticas finais dos testes
  if (global.mockServices) {
    console.log("📊 Estatísticas dos testes:");
    console.log(`   📧 Notificações enviadas:`, global.mockServices.notifications);
    console.log(`   💳 Pagamentos processados:`, global.mockServices.payments);
    console.log(`   🧾 Impostos calculados:`, global.mockServices.taxes);
  }

  // Limpeza de recursos
  if (global.testSeeds) {
    console.log("🗑️  Limpando dados de teste...");
    delete global.testSeeds;
  }

  if (global.healthcareTestUtils) {
    delete global.healthcareTestUtils;
  }

  if (global.mockServices) {
    delete global.mockServices;
  }

  // Forçar garbage collection se disponível
  if (global.gc) {
    global.gc();
  }

  console.log("✅ Limpeza concluída com sucesso!");
}
