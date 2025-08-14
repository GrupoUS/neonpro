// Script to test Supabase online connection and execute migrations if needed
// Usage: node scripts/test-supabase-online.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔗 Testing Supabase Online Connection...");
console.log("📍 URL:", supabaseUrl);

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

async function testConnection() {
  try {
    console.log("🧪 Testing connection...");

    // Test basic connectivity
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.log("⚠️  Error accessing profiles table:", error.message);
      console.log("📝 This might be expected if the table doesn't exist yet");
    } else {
      console.log("✅ Successfully connected to Supabase online!");
      console.log("📊 Connection test passed");
    }

    // Check which tables exist
    console.log("\n📋 Checking existing tables...");
    const { data: tables, error: tablesError } = await supabase.rpc(
      "get_table_list",
      {}
    );

    if (tablesError) {
      console.log("⚠️  Could not fetch table list:", tablesError.message);

      // Alternative method to check tables
      console.log("🔍 Trying alternative method...");
      const { data: altCheck, error: altError } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public");

      if (altError) {
        console.log("⚠️  Alternative method failed:", altError.message);
      } else {
        console.log(
          "📊 Found tables:",
          altCheck?.map((t) => t.table_name) || "None"
        );
      }
    } else {
      console.log("📊 Available tables:", tables);
    }

    // Check if Accounts Payable tables exist
    console.log("\n🔍 Checking for Accounts Payable tables...");
    const apTables = [
      "vendors",
      "accounts_payable",
      "expense_categories",
      "ap_payments",
      "ap_documents",
    ];

    for (const tableName of apTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("count")
          .limit(1);
        if (error) {
          console.log(
            `❌ Table '${tableName}' not found or accessible:`,
            error.message
          );
        } else {
          console.log(`✅ Table '${tableName}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' check failed:`, err.message);
      }
    }

    console.log("\n🎯 Connection test completed!");
    console.log("🚀 Ready to proceed with online Supabase configuration");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    process.exit(1);
  }
}

testConnection();
