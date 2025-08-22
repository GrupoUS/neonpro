// Sincronização Schema Prisma → Supabase
require("dotenv").config({ path: "./apps/web/.env.local" });

async function syncPrismaToSupabase() {
	// Verificar configuração atual
	const _dbUrl = process.env.DATABASE_URL;
	const _directUrl = process.env.DIRECT_URL;
	const dbPassword = process.env.SUPABASE_DB_PASSWORD;

	if (!dbPassword || dbPassword === "your_database_password_here") {
		return;
	}
}

syncPrismaToSupabase();
