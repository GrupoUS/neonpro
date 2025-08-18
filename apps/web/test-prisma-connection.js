// Teste de conexão Prisma + Supabase
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: "./.env.local" });

async function testPrismaSupabaseConnection() {
  // Verificar variáveis de ambiente
  const dbUrl = process.env.DATABASE_URL;
  const _directUrl = process.env.DIRECT_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!(dbUrl && dbPassword) || dbPassword === "your_database_password_here") {
    return;
  }

  // Criar cliente Prisma
  const prisma = new PrismaClient({
    log: ["info", "warn", "error"],
  });

  try {
    // Teste básico de conectividade
    await prisma.$connect();

    try {
      const _tenants = await prisma.tenant.count();
    } catch (_e) {}

    try {
      const _profiles = await prisma.profile.count();
    } catch (_e) {}

    try {
      const _products = await prisma.product.count();
    } catch (_e) {}
    try {
      const result =
        await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 10`;
      result.forEach((_row, _i) => {});
    } catch (_e) {}
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
