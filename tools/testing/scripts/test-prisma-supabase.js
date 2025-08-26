// Teste de conexão Prisma + Supabase
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: "./apps/web/.env.local" });

async function testPrismaSupabaseConnection() {
  // Verificar variáveis de ambiente
  const dbUrl = process.env.DATABASE_URL;
  const _directUrl = process.env.DIRECT_URL;

  if (!dbUrl) {
    return;
  }

  // Criar cliente Prisma
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    // Teste básico de conectividade
    await prisma.$connect();

    try {
      const _tenants = await prisma.tenant.count();
    } catch {}

    try {
      const _profiles = await prisma.profile.count();
    } catch {}

    try {
      const _products = await prisma.product.count();
    } catch {}
    try {
      const result =
        await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 10`;
      result.forEach((_row, _i) => {});
    } catch {}
  } catch (error) {
    if (error.message.includes("password authentication failed")) {
    }

    if (error.message.includes("connection refused")) {
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaSupabaseConnection();
