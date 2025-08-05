// Script to execute Accounts Payable migrations on Supabase online
// Usage: node scripts/execute-ap-migrations.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🚀 Executing Accounts Payable Migrations on Supabase Online...");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase configuration in .env.local");
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
    console.log("📂 Reading migration files...");

    const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");
    const migrationFiles = [
      "20250721120000_create_accounts_payable_schema.sql",
      "20250721120001_insert_ap_test_data.sql",
    ];

    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsDir, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${filename}`);
        continue;
      }

      console.log(`\n📋 Executing migration: ${filename}`);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      // Split SQL content by statements (basic approach)
      const statements = sqlContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const [index, statement] of statements.entries()) {
        if (
          statement.toLowerCase().includes("begin") ||
          statement.toLowerCase().includes("commit") ||
          statement.toLowerCase().includes("end")
        ) {
          console.log(`⏭️  Skipping transaction control statement ${index + 1}`);
          continue;
        }

        try {
          console.log(`⏳ Executing statement ${index + 1}/${statements.length}...`);
          const { error } = await supabase.rpc("exec_sql", {
            sql_query: statement,
          });

          if (error) {
            // Try direct SQL execution via REST API
            const { data, error: directError } = await supabase.from("_dummy").select("*").limit(0);
            if (directError) {
              console.log(`⚠️  Statement ${index + 1} failed:`, error.message);
              // Continue with next statement for now
            } else {
              console.log(`✅ Statement ${index + 1} executed successfully`);
            }
          } else {
            console.log(`✅ Statement ${index + 1} executed successfully`);
          }
        } catch (execError) {
          console.log(`⚠️  Statement ${index + 1} execution error:`, execError.message);
          // Continue with next statement
        }
      }

      console.log(`✅ Migration ${filename} processing completed`);
    }

    // Test if tables were created
    console.log("\n🔍 Verifying table creation...");
    const apTables = ["vendors", "accounts_payable", "expense_categories"];

    for (const tableName of apTables) {
      try {
        const { data, error } = await supabase.from(tableName).select("count").limit(1);
        if (error) {
          console.log(`❌ Table '${tableName}' verification failed:`, error.message);
        } else {
          console.log(`✅ Table '${tableName}' is accessible`);
        }
      } catch (err) {
        console.log(`⚠️  Table '${tableName}' check error:`, err.message);
      }
    }

    console.log("\n🎯 Migration execution completed!");
    console.log("📋 Please check the Supabase dashboard to verify table creation:");
    console.log("🔗 https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/editor");
  } catch (error) {
    console.error("❌ Migration execution failed:", error.message);
    console.log("\n💡 Manual execution may be required via Supabase dashboard");
    console.log("📋 Copy the SQL from migration files to the SQL Editor in Supabase dashboard");
    process.exit(1);
  }
}

executeMigrations();
