// Teste de conectividade Supabase
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./apps/web/.env.local" });

async function testSupabaseConnection() {
  // Configuração
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseKey)) {
    return;
  }

  // Cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: healthCheck, error: healthError } = await supabase
      .from("tenants")
      .select("count")
      .limit(1);
    if (healthError) {
      return;
    }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
    } else if (user) {
    } else {
    }
    const criticalTables = [
      "tenants",
      "profiles",
      "professionals",
      "patients",
      "appointments",
      "clinics",
    ];

    for (const table of criticalTables) {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error) {
      } else {
      }
    }
    const { data: rlsData, error: rlsError } = await supabase.rpc(
      "get_table_rls_status",
    );
    if (rlsError) {
    } else {
    }
  } catch {}
}

testSupabaseConnection();
