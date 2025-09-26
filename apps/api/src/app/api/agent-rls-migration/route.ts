import { createAdminClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let error: Error | null = null
  try {
    // Get admin client
    const supabase = createAdminClient()

    // Simple SQL execution using the existing admin client
    const executeSQL = async () => {
      try {
        const { count, error: queryError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })

        if (queryError) {
          throw queryError
        }

        return { success: true, data: { count } }
      } catch (err) {
        error = err as Error
        return {
          success: false,
          error: error.message,
        }
      }
    }

    // Check if we can connect to the database
    const connectionTest = await executeSQL()
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
  } catch (err) {
    error = err as Error
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error.message,
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
