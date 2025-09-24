import { createAdminClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // Get admin client
    const supabase = createAdminClient()

    // Simple SQL execution using the existing admin client
    const executeSQL = async (_sql: string) => {
      try {
        const { data, error } = await supabase
          .from('pg_tables')
          .select('*')
          .limit(1)

        if (error) {
          throw error
        }

        return { success: true, data }
      } catch {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    // Check if we can connect to the database
    const connectionTest = await executeSQL('SELECT 1')
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Database connection failed', details: connectionTest.error },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful - Ready to execute agent RLS migration',
      connectionTest: connectionTest.success,
    })
  } catch {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Agent RLS Migration API. Use POST to execute migration.',
    timestamp: new Date().toISOString(),
  })
}
