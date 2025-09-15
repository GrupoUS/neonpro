import { supabase } from '@/integrations/supabase/client';

// Simple Supabase connection test
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check client configuration
    console.log('📋 Supabase client initialized');
    
    // Test 2: Check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Current session:', session ? 'Authenticated' : 'Not authenticated');
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    }
    
    // Test 3: Try a simple query that should work without authentication
    const { data: testData, error: testError } = await supabase
      .from('clinics')
      .select('id, clinic_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Test query error:', testError);
      return { success: false, error: testError.message };
    }
    
    console.log('✅ Test query successful:', testData);
    
    // Test 4: Try a patients query that might be affected by RLS
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name')
      .limit(1);
    
    if (patientsError) {
      console.error('❌ Patients query error:', patientsError);
      return { 
        success: false, 
        error: `Patients query failed: ${patientsError.message}`,
        basicConnectionWorking: true 
      };
    }
    
    console.log('✅ Patients query successful:', patientsData);
    
    return { 
      success: true, 
      session: !!session,
      basicConnectionWorking: true,
      patientsAccessWorking: true
    };
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      basicConnectionWorking: false
    };
  }
}