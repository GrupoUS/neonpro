// Sincronização Schema Prisma → Supabase
import dotenv from "dotenv";
dotenv.config({ path: "./apps/web/.env.local" });

async function syncPrismaToSupabase() {
  // Verificar configuração atual  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword || dbPassword === "your_database_password_here") {
    return;
  }
}

syncPrismaToSupabase();
