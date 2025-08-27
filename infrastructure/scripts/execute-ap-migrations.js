// Script to execute Accounts Payable migrations on Supabase online
// Usage: node scripts/execute-ap-migrations.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!(supabaseUrl && supabaseServiceKey)) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeMigrations() {
  try {
    const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
    const migrationFiles = [
      "20250721120000_create_accounts_payable_schema.sql",
      "20250721120001_insert_ap_test_data.sql",
    ];

    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsDir, filename);

      if (!fs.existsSync(filePath)) {
        continue;
      }
      const sqlContent = fs.readFileSync(filePath, "utf8");

      // Split SQL content by statements (basic approach)
      const statements = sqlContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const [_index, statement] of statements.entries()) {
        if (
          statement.toLowerCase().includes("begin")
          || statement.toLowerCase().includes("commit")
          || statement.toLowerCase().includes("end")
        ) {
          continue;
        }

        try {
          const { error } = await supabase.rpc("exec_sql", {
            sql_query: statement,
          });

          if (error) {
            // Try direct SQL execution via REST API
            const { data, error: directError } = await supabase
              .from("_dummy")
              .select("*")
              .limit(0);
            if (directError) {
              // Continue with next statement for now
            } else {
            }
          } else {
          }
        } catch (_execError) {
          // Continue with next statement
        }
      }
    }
    const apTables = ["vendors", "accounts_payable", "expense_categories"];

    for (const tableName of apTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("count")
          .limit(1);
        if (error) {
        } else {
        }
      } catch (_err) {}
    }
  } catch (_error) {
    process.exit(1);
  }
}

executeMigrations();
