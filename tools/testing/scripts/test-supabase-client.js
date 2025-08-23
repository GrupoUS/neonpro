// Teste alternativo: Supabase Client (sem Prisma)
require("dotenv").config({ path: "./apps/web/.env.local" });
const { createClient } = require("@supabase/supabase-js");

async function testSupabaseClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!(supabaseUrl && supabaseKey)) {
		return;
	}

	// Criar cliente Supabase
	const supabase = createClient(supabaseUrl, supabaseKey);

	try {
		// Listar algumas tabelas públicas
		const { data: tables, error } = await supabase
			.from("information_schema.tables")
			.select("table_name")
			.eq("table_schema", "public")
			.limit(10);

		if (error) {
		} else {
		}

		const tablesToTest = [
			"tenants",
			"profiles",
			"products",
			"appointments",
			"patients",
		];

		for (const tableName of tablesToTest) {
			try {
				const { count, error } = await supabase
					.from(tableName)
					.select("*", { count: "exact", head: true });

				if (error) {
				} else {
				}
			} catch (_e) {}
		}
	} catch (_error) {}
}

testSupabaseClient();
