import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import * as XLSX from 'xlsx'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Validation schemas
const exportRequestSchema = z.object({
  type: z.enum(['analytics', 'trials', 'subscriptions', 'users', 'campaigns']),
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()).optional()
})

/**
 * POST /api/export - Export data in various formats
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const subscriptionStatus = request.headers.get('x-user-subscription')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check subscription permissions for export functionality
    if (subscriptionStatus === 'free') {
      return NextResponse.json(
        { error: 'Export functionality requires a paid subscription' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedRequest = exportRequestSchema.parse(body)
    
    // Get data based on export type
    let data: any[]
    let filename: string
    
    switch (validatedRequest.type) {
      case 'analytics':
        data = await getAnalyticsData(validatedRequest, userId, userRole)
        filename = `analytics_export_${new Date().toISOString().split('T')[0]}`
        break
      
      case 'trials':
        data = await getTrialsData(validatedRequest, userId, userRole)
        filename = `trials_export_${new Date().toISOString().split('T')[0]}`
        break
      
      case 'subscriptions':
        data = await getSubscriptionsData(validatedRequest, userId, userRole)
        filename = `subscriptions_export_${new Date().toISOString().split('T')[0]}`
        break
      
      case 'users':
        if (userRole !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required for user data export' },
            { status: 403 }
          )
        }
        data = await getUsersData(validatedRequest)
        filename = `users_export_${new Date().toISOString().split('T')[0]}`
        break
      
      case 'campaigns':
        if (userRole !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required for campaign data export' },
            { status: 403 }
          )
        }
        data = await getCampaignsData(validatedRequest)
        filename = `campaigns_export_${new Date().toISOString().split('T')[0]}`
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found for export' },
        { status: 404 }
      )
    }
    
    // Filter columns if specified
    if (validatedRequest.columns && validatedRequest.columns.length > 0) {
      data = data.map(row => {
        const filteredRow: any = {}
        validatedRequest.columns!.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filteredRow[col] = row[col]
          }
        })
        return filteredRow
      })
    }
    
    // Generate file based on format
    let fileBuffer: Buffer
    let contentType: string
    let fileExtension: string
    
    switch (validatedRequest.format) {
      case 'csv':
        const csvContent = convertToCSV(data)
        fileBuffer = Buffer.from(csvContent, 'utf-8')
        contentType = 'text/csv'
        fileExtension = 'csv'
        break
      
      case 'xlsx':
        fileBuffer = convertToXLSX(data)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break
      
      case 'json':
        const jsonContent = JSON.stringify(data, null, 2)
        fileBuffer = Buffer.from(jsonContent, 'utf-8')
        contentType = 'application/json'
        fileExtension = 'json'
        break
      
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        )
    }
    
    // Log export activity
    await supabase
      .from('analytics_events')
      .insert({
        event_type: 'data_exported',
        user_id: userId,
        properties: {
          export_type: validatedRequest.type,
          format: validatedRequest.format,
          record_count: data.length,
          filename: `${filename}.${fileExtension}`
        }
      })
    
    // Return file as download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}.${fileExtension}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
    
  } catch (error) {
    console.error('Export API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid export request',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for data retrieval

async function getAnalyticsData(request: any, userId: string, userRole: string | null) {
  const { startDate, endDate, filters } = request
  
  let query = supabase
    .from('analytics_events')
    .select('*')
  
  // Apply user filtering for non-admin users
  if (userRole !== 'admin') {
    query = query.eq('user_id', userId)
  }
  
  // Apply date filters
  if (startDate) {
    query = query.gte('timestamp', startDate)
  }
  if (endDate) {
    query = query.lte('timestamp', endDate)
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query.order('timestamp', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function getTrialsData(request: any, userId: string, userRole: string | null) {
  const { startDate, endDate, filters } = request
  
  let query = supabase
    .from('trials')
    .select(`
      *,
      campaigns(name, description),
      users(email, created_at)
    `)
  
  // Apply user filtering for non-admin users
  if (userRole !== 'admin') {
    query = query.eq('user_id', userId)
  }
  
  // Apply date filters
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function getSubscriptionsData(request: any, userId: string, userRole: string | null) {
  const { startDate, endDate, filters } = request
  
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      users(email, created_at)
    `)
  
  // Apply user filtering for non-admin users
  if (userRole !== 'admin') {
    query = query.eq('user_id', userId)
  }
  
  // Apply date filters
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function getUsersData(request: any) {
  const { startDate, endDate, filters } = request
  
  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      role,
      subscription_status,
      created_at,
      updated_at,
      last_login_at
    `)
  
  // Apply date filters
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

async function getCampaignsData(request: any) {
  const { startDate, endDate, filters } = request
  
  let query = supabase
    .from('campaigns')
    .select(`
      *,
      trials(count)
    `)
  
  // Apply date filters
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Helper functions for file conversion

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Add headers
  csvRows.push(headers.join(','))
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      // Escape commas and quotes in strings
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

function convertToXLSX(data: any[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return buffer
}

