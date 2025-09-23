import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const supabaseUrl = "https://ownkoxryswokcdanrdgj.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDYxMTA0NCwiZXhwIjoyMDQwMTg3MDQ0fQ.KGVOuClrHkBtFfZQI4JdI_nKUlnVU1CKtL0pUq7WXhI";

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationPath = path.join(
  __dirname,
  "supabase",
  "migrations",
  "20250921040936_agent_rls_system_policies.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");

console.log("🚀 Starting Agent RLS Policies Migration...");
console.log(`📄 Migration file: ${migrationPath}`);

// Split SQL into individual statements
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`📊 Found ${statements.length} SQL statements to execute`);

async function executeMigration() {
  const results = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ";";
    console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { data: _data, error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        results.push({
          statement: i + 1,
          status: "error",
          error: error.message,
        });
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        results.push({ statement: i + 1, status: "success" });
      }
    } catch (err) {
      console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
      results.push({ statement: i + 1, status: "error", error: err.message });
    }
  }

  // Summary
  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;

  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successful}/${statements.length}`);
  console.log(`❌ Failed: ${failed}/${statements.length}`);

  if (failed > 0) {
    console.log(`\n❌ Failed statements:`);
    results
      .filter((r) => r.status === "error")
      .forEach((r) => {
        console.log(`   Statement ${r.statement}: ${r.error}`);
      });
  } else {
    console.log(`\n🎉 Migration completed successfully!`);
  }

  return results;
}

// Alternative approach using the SQL API endpoint
async function executeMigrationViaAPI() {
  console.log("🔄 Trying alternative approach via SQL API...");

  try {
    // Use the Supabase SQL API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Prefer: "params=single-object",
      },
      body: JSON.stringify({
        query: sql,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Migration executed successfully via SQL API");
    console.log("Response:", data);
  } catch (error) {
    console.error("❌ Error executing via SQL API:", error.message);
  }
}

// Try to create a RPC function for SQL execution if it doesn't exist
async function setupSQLExecution() {
  console.log("🔧 Setting up SQL execution function...");

  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
    RETURNS VOID AS $$
    BEGIN
      EXECUTE sql_text;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql: createFunctionSQL,
    });

    if (error) {
      console.log(
        "⚠️ SQL execution function may not exist, trying to create it...",
      );
      // Try direct SQL execution
      const { error: createError } = await supabase
        .from("pg_tables")
        .select("*")
        .limit(1);
      if (createError) {
        console.error("❌ Cannot execute SQL:", createError.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("❌ Error setting up SQL execution:", err.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Setup SQL execution
    const canExecute = await setupSQLExecution();

    if (canExecute) {
      await executeMigration();
    } else {
      console.log("🔄 Falling back to API approach...");
      await executeMigrationViaAPI();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

main();
