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
    // Testar conectividade do banco com query simples
    const { data: version, error } = await supabase.rpc("version");

    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      return;
    } else {
      console.log(`✅ Database connected successfully`);
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
        const { count, error } = await supabase.from(tableName).select("*", {
          count: "exact",
          head: true,
        });

        if (error) {
        } else {
        }
      } catch {}
    }
  } catch {}
}

testSupabaseClient();
