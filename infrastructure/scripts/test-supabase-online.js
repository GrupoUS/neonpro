// Script to test Supabase online connection and execute migrations if needed
// Usage: node scripts/test-supabase-online.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

async function testConnection() {
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
    } else {
    }
    const { data: tables, error: tablesError } = await supabase.rpc(
      'get_table_list',
      {},
    );

    if (tablesError) {
      const { data: altCheck, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (altError) {
      } else {
      }
    } else {
    }
    const apTables = [
      'vendors',
      'accounts_payable',
      'expense_categories',
      'ap_payments',
      'ap_documents',
    ];

    for (const tableName of apTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
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

testConnection();
