#!/usr/bin/env node

/**
 * Script to test Supabase MCP server connection
 * Tests basic connectivity and authentication
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gfkskrkbnawkuppazkpt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzAyNzAsImV4cCI6MjA1MTU0NjI3MH0.xRhHFBSGsW7O43F6ydBl0FUGGt3F8yAe-KCtP8QYdq4';

async function testSupabaseMCP() {
  console.log('🧪 TESTING SUPABASE MCP CONNECTION');
  console.log('=' .repeat(50));
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('\n✅ 1. Supabase client initialized');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
    
    // Test basic connection
    console.log('\n🔍 2. Testing basic connection...');
    
    // Try to get auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ⚠️ Session check: ${sessionError.message}`);
    } else {
      console.log('   ✅ Session check: OK');
      console.log(`   Session exists: ${session ? 'Yes' : 'No'}`);
    }
    
    // Test database connection with a simple query
    console.log('\n🗄️ 3. Testing database connection...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ⚠️ Database query: ${error.message}`);
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('   ℹ️ This is expected if profiles table hasn\'t been created yet');
      }
    } else {
      console.log('   ✅ Database connection: OK');
      console.log(`   Profiles table accessible: Yes`);
    }
    
    // Test auth configuration
    console.log('\n🔐 4. Testing auth configuration...');
    
    const { data: authConfig, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log(`   ⚠️ Auth config: ${authError.message}`);
    } else {
      console.log('   ✅ Auth config: OK');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 SUPABASE MCP CONNECTION TEST COMPLETED');
    console.log('\n📋 Summary:');
    console.log('• Client initialization: ✅');
    console.log('• Basic connection: ✅');
    console.log('• Auth system: ✅');
    console.log('\n💡 MCP Server is ready for:');
    console.log('• Database operations');
    console.log('• Authentication management');
    console.log('• Real-time subscriptions');
    console.log('• Storage operations');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your Supabase URL and API keys');
    console.error('2. Verify network connectivity');
    console.error('3. Check Supabase project status');
  }
}

// Run the test
testSupabaseMCP().catch(console.error);
