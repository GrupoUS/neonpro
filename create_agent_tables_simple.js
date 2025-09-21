import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://ownkoxryswokcdanrdgj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDYxMTA0NCwiZXhwIjoyMDQwMTg3MDQ0fQ.KGVOuClrHkBtFfZQI4JdI_nKUlnVU1CKtL0pUq7WXhI';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Starting Agent RLS Policies Creation...');

// SQL for creating the agent_sessions table
const createAgentSessionsTable = `
  CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'AI Assistant Session',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW()
  );
`;

// SQL for creating the agent_messages table
const createAgentMessagesTable = `
  CREATE TABLE IF NOT EXISTS agent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );
`;

// SQL for creating the agent_context table
const createAgentContextTable = `
  CREATE TABLE IF NOT EXISTS agent_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
    context JSONB NOT NULL DEFAULT '{}',
    patient_ids UUID[] DEFAULT '{}',
    user_preferences JSONB DEFAULT '{}',
    previous_topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// SQL for creating the agent_audit_log table
const createAgentAuditLogTable = `
  CREATE TABLE IF NOT EXISTS agent_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    compliance_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

// Function to execute SQL using the Supabase SQL editor API
async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('SQL execution error:', error.message);
    throw error;
  }
}

// Function to create tables using the Supabase client
async function createTables() {
  console.log('📋 Creating agent_sessions table...');
  
  try {
    // First, let's try to create the exec_sql function
    await executeSQL(`
      CREATE OR REPLACE FUNCTION exec_sql(sql_text TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_text;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    console.log('✅ SQL execution function created');
    
    // Create tables
    await executeSQL(createAgentSessionsTable);
    console.log('✅ agent_sessions table created');
    
    await executeSQL(createAgentMessagesTable);
    console.log('✅ agent_messages table created');
    
    await executeSQL(createAgentContextTable);
    console.log('✅ agent_context table created');
    
    await executeSQL(createAgentAuditLogTable);
    console.log('✅ agent_audit_log table created');
    
    // Enable RLS
    await executeSQL('ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE agent_context ENABLE ROW LEVEL SECURITY;');
    await executeSQL('ALTER TABLE agent_audit_log ENABLE ROW LEVEL SECURITY;');
    
    console.log('✅ RLS enabled on all tables');
    
    // Create indexes
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_id ON agent_sessions(session_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_sessions_active ON agent_sessions(is_active) WHERE is_active = true;');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_sessions_expires_at ON agent_sessions(expires_at);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_messages_session_id ON agent_messages(session_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_messages_timestamp ON agent_messages(timestamp);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_context_session_id ON agent_context(session_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_audit_log_session_id ON agent_audit_log(session_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_audit_log_user_id ON agent_audit_log(user_id);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_audit_log_action ON agent_audit_log(action);');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_agent_audit_log_created_at ON agent_audit_log(created_at);');
    
    console.log('✅ Indexes created');
    
    // Create basic RLS policies
    await executeSQL(`
      CREATE POLICY "Users can view own sessions" ON agent_sessions
        FOR SELECT USING (auth.uid() = user_id);
    `);
    
    await executeSQL(`
      CREATE POLICY "Users can insert own sessions" ON agent_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `);
    
    await executeSQL(`
      CREATE POLICY "Users can update own sessions" ON agent_sessions
        FOR UPDATE USING (auth.uid() = user_id);
    `);
    
    await executeSQL(`
      CREATE POLICY "Users can delete own sessions" ON agent_sessions
        FOR DELETE USING (auth.uid() = user_id);
    `);
    
    await executeSQL(`
      CREATE POLICY "Service role can manage all agent sessions" ON agent_sessions
        FOR ALL USING (auth.role() = 'service_role');
    `);
    
    console.log('✅ Basic RLS policies created');
    
    console.log('🎉 Agent RLS policies migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

// Alternative approach using the Supabase Dashboard
async function checkTablesViaAPI() {
  console.log('🔍 Checking existing tables...');
  
  try {
    // Check if tables exist by querying information schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['agent_sessions', 'agent_messages', 'agent_context', 'agent_audit_log']);
    
    if (error) {
      console.error('Error checking tables:', error.message);
      return;
    }
    
    console.log('📊 Existing tables:', data?.length || 0);
    if (data && data.length > 0) {
      data.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  }
}

// Main execution
async function main() {
  try {
    await checkTablesViaAPI();
    await createTables();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();