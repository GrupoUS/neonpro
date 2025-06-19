import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5)

    if (tablesError) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          error: tablesError.message 
        },
        { status: 500 }
      )
    }

    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test NEONPRO tables
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name')
      .limit(1)

    const { data: profiles, error: profilesError } = await supabase
      .from('neonpro_profiles')
      .select('id, email')
      .limit(1)

    return NextResponse.json({
      status: 'success',
      message: 'NEONPRO database connection successful',
      data: {
        database: {
          connected: true,
          tables: tables?.map(t => t.table_name) || [],
          tablesCount: tables?.length || 0
        },
        authentication: {
          user: user ? { id: user.id, email: user.email } : null,
          authenticated: !!user
        },
        neonproTables: {
          clinics: {
            accessible: !clinicsError,
            count: clinics?.length || 0,
            error: clinicsError?.message
          },
          profiles: {
            accessible: !profilesError,
            count: profiles?.length || 0,
            error: profilesError?.message
          }
        },
        environment: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      }
    })
  } catch (error) {
    console.error('Connection test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
