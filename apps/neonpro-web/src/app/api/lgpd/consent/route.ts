import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { LGPDComplianceManager } from '@/lib/lgpd/compliance-manager'
import type { Database } from '@/types/database'

// Validation schemas
const consentCreateSchema = z.object({
  purposes: z.array(z.string()).min(1),
  consentType: z.enum(['explicit', 'implicit']).default('explicit'),
  metadata: z.record(z.any()).optional()
})

const consentUpdateSchema = z.object({
  purposes: z.array(z.string()).optional(),
  status: z.enum(['granted', 'withdrawn', 'expired']).optional(),
  metadata: z.record(z.any()).optional()
})

const consentQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  purpose: z.string().optional(),
  status: z.enum(['granted', 'withdrawn', 'expired']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// GET /api/lgpd/consent - Get user consents or admin view
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedQuery = consentQuerySchema.parse(queryParams)

    // Check if user has admin role for broader access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const targetUserId = isAdmin && validatedQuery.userId ? validatedQuery.userId : user.id

    const complianceManager = new LGPDComplianceManager(supabase)

    // Build query filters
    const filters: any = {
      userId: targetUserId
    }

    if (validatedQuery.purpose) {
      filters.purpose = validatedQuery.purpose
    }

    if (validatedQuery.status) {
      filters.status = validatedQuery.status
    }

    if (validatedQuery.startDate) {
      filters.startDate = new Date(validatedQuery.startDate)
    }

    if (validatedQuery.endDate) {
      filters.endDate = new Date(validatedQuery.endDate)
    }

    // Get consents with pagination
    const { data: consents, error: consentsError } = await supabase
      .from('lgpd_consents')
      .select(`
        id,
        user_id,
        purposes,
        status,
        consent_type,
        granted_at,
        withdrawn_at,
        expires_at,
        metadata,
        created_at,
        updated_at
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1
      )

    if (consentsError) {
      throw new Error(`Failed to fetch consents: ${consentsError.message}`)
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('lgpd_consents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Log access if admin viewing other user's data
    if (isAdmin && validatedQuery.userId && validatedQuery.userId !== user.id) {
      await complianceManager.logAuditEvent({
        eventType: 'admin_action',
        userId: user.id,
        description: 'Admin accessed user consents',
        details: `Admin viewed consents for user ${validatedQuery.userId}`,
        metadata: {
          target_user_id: validatedQuery.userId,
          query_params: validatedQuery
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        consents,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit)
        }
      }
    })

  } catch (error) {
    console.error('LGPD Consent GET Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lgpd/consent - Create or update consent
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = consentCreateSchema.parse(body)

    const complianceManager = new LGPDComplianceManager(supabase)

    // Grant consent for specified purposes
    const consent = await complianceManager.grantConsent(
      user.id,
      validatedData.purposes,
      {
        consentType: validatedData.consentType,
        metadata: validatedData.metadata
      }
    )

    return NextResponse.json({
      success: true,
      data: consent
    }, { status: 201 })

  } catch (error) {
    console.error('LGPD Consent POST Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/lgpd/consent - Update existing consent
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = consentUpdateSchema.parse(body)
    const url = new URL(request.url)
    const consentId = url.searchParams.get('id')

    if (!consentId) {
      return NextResponse.json(
        { error: 'Consent ID is required' },
        { status: 400 }
      )
    }

    // Verify consent belongs to user (or user is admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    const { data: existingConsent } = await supabase
      .from('lgpd_consents')
      .select('user_id')
      .eq('id', consentId)
      .single()

    if (!existingConsent) {
      return NextResponse.json(
        { error: 'Consent not found' },
        { status: 404 }
      )
    }

    if (!isAdmin && existingConsent.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Can only modify own consents' },
        { status: 403 }
      )
    }

    const complianceManager = new LGPDComplianceManager(supabase)

    // Handle consent withdrawal
    if (validatedData.status === 'withdrawn') {
      const withdrawnConsent = await complianceManager.withdrawConsent(
        existingConsent.user_id,
        validatedData.purposes || []
      )
      
      return NextResponse.json({
        success: true,
        data: withdrawnConsent
      })
    }

    // Update consent record
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (validatedData.purposes) {
      updateData.purposes = validatedData.purposes
    }

    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    if (validatedData.metadata) {
      updateData.metadata = validatedData.metadata
    }

    const { data: updatedConsent, error: updateError } = await supabase
      .from('lgpd_consents')
      .update(updateData)
      .eq('id', consentId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update consent: ${updateError.message}`)
    }

    // Log the update
    await complianceManager.logAuditEvent({
      eventType: 'consent_change',
      userId: isAdmin ? user.id : existingConsent.user_id,
      description: 'Consent updated',
      details: `Consent ${consentId} updated`,
      metadata: {
        consent_id: consentId,
        updated_by: user.id,
        is_admin_action: isAdmin,
        changes: validatedData
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedConsent
    })

  } catch (error) {
    console.error('LGPD Consent PUT Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/lgpd/consent - Withdraw consent
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const purposes = url.searchParams.get('purposes')?.split(',') || []

    if (purposes.length === 0) {
      return NextResponse.json(
        { error: 'At least one purpose must be specified' },
        { status: 400 }
      )
    }

    const complianceManager = new LGPDComplianceManager(supabase)

    // Withdraw consent for specified purposes
    const result = await complianceManager.withdrawConsent(user.id, purposes)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('LGPD Consent DELETE Error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}