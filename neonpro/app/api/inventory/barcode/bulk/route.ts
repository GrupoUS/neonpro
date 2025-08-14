/**
 * Story 6.1 Task 2: Bulk Barcode Operations API
 * Handle bulk scanning operations and batch processing
 * Quality: ≥9.5/10 with comprehensive operation tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { barcodeService } from '@/app/lib/services/barcode-service'
import { z } from 'zod'

const processBulkScanSchema = z.object({
  operation_id: z.string().uuid('ID da operação deve ser um UUID válido'),
  scan_value: z.string().min(1, 'Valor do scan é obrigatório')
})

const updateOperationSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'process'

    if (action === 'process') {
      // Process single scan in bulk operation
      const validatedData = processBulkScanSchema.parse(body)
      
      const result = await barcodeService.processBulkScan(
        validatedData.operation_id,
        validatedData.scan_value,
        session.user.id
      )

      return NextResponse.json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata
      })
    }

    return NextResponse.json(
      { error: 'Ação não suportada' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro no bulk scan:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const operationId = searchParams.get('operation_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (operationId) {
      // Get specific operation details
      const { data: operation, error } = await supabase
        .from('bulk_scan_operations')
        .select('*')
        .eq('id', operationId)
        .single()

      if (error) {
        console.error('Erro ao buscar operação:', error)
        return NextResponse.json(
          { error: 'Operação não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: operation
      })
    }

    // Get operations list
    let query = supabase
      .from('bulk_scan_operations')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: operations, error } = await query

    if (error) {
      console.error('Erro ao buscar operações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar operações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: operations
    })

  } catch (error) {
    console.error('Erro na busca de operações bulk:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const operationId = searchParams.get('operation_id')

    if (!operationId) {
      return NextResponse.json(
        { error: 'operation_id é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateOperationSchema.parse(body)

    // Update operation
    const { data: operation, error } = await supabase
      .from('bulk_scan_operations')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', operationId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar operação:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar operação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: operation
    })

  } catch (error) {
    console.error('Erro na atualização da operação:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}