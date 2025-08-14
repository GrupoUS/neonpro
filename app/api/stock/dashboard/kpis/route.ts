import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const dashboardParamsSchema = z.object({
  clinicId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const params = dashboardParamsSchema.parse({
      clinicId: searchParams.get('clinicId'),
      period: searchParams.get('period') || '30d',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    })

    // Calculate date range based on period
    let startDate: Date
    let endDate: Date = new Date()

    if (params.period === 'custom' && params.startDate && params.endDate) {
      startDate = new Date(params.startDate)
      endDate = new Date(params.endDate)
    } else {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[params.period] || 30

      startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', params.clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Get current stock data
    const { data: stockData, error: stockError } = await supabase
      .from('stock_inventory')
      .select(`
        id,
        product_id,
        quantity_available,
        min_stock_level,
        max_stock_level,
        unit_cost,
        products (name, category_id)
      `)
      .eq('clinic_id', params.clinicId)
      .eq('is_active', true)

    if (stockError) {
      console.error('Stock Error:', stockError)
      return NextResponse.json({ error: 'Erro ao buscar dados de estoque' }, { status: 500 })
    }

    // Get movement data for the period
    const { data: movementData, error: movementError } = await supabase
      .from('stock_movement_transactions')
      .select('*')
      .eq('clinic_id', params.clinicId)
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())

    if (movementError) {
      console.error('Movement Error:', movementError)
      return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 })
    }

    // Calculate KPIs
    const totalValue = stockData?.reduce((sum, item) => 
      sum + (item.quantity_available * item.unit_cost), 0) || 0

    const totalConsumption = movementData?.reduce((sum, movement) => 
      movement.movement_type === 'out' ? sum + movement.quantity_out : sum, 0) || 0

    const averageInventory = stockData?.reduce((sum, item) => 
      sum + item.quantity_available, 0) / (stockData?.length || 1)

    const turnoverRate = averageInventory > 0 ? totalConsumption / averageInventory : 0

    const dailyConsumption = totalConsumption / Math.max(1, 
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const daysCoverage = dailyConsumption > 0 ? averageInventory / dailyConsumption : 0

    const productsInRange = stockData?.filter(item => 
      item.quantity_available >= item.min_stock_level).length || 0
    
    const accuracyPercentage = stockData?.length ? 
      (productsInRange / stockData.length) * 100 : 0

    const wasteValue = movementData?.reduce((sum, movement) => 
      movement.movement_type === 'waste' ? sum + (movement.quantity_out * movement.unit_cost) : sum, 0) || 0

    const wastePercentage = totalValue > 0 ? (wasteValue / totalValue) * 100 : 0

    // Format KPIs with trends and status
    const kpis = [
      {
        key: 'total_value',
        label: 'Valor Total do Estoque',
        value: totalValue,
        unit: 'R$',
        trend: 'stable' as const,
        trendValue: 2.5,
        status: 'good' as const,
        description: 'Valor total investido em estoque'
      },
      {
        key: 'turnover_rate',
        label: 'Giro de Estoque',
        value: turnoverRate,
        unit: 'x',
        trend: 'up' as const,
        trendValue: 5.2,
        status: turnoverRate >= 2 ? 'good' : 'warning' as const,
        target: 3.0,
        description: 'Quantas vezes o estoque gira por período'
      },
      {
        key: 'days_coverage',
        label: 'Dias de Cobertura',
        value: daysCoverage,
        unit: 'dias',
        trend: 'down' as const,
        trendValue: 3.1,
        status: daysCoverage >= 30 ? 'good' : 'warning' as const,
        target: 45,
        description: 'Quantos dias o estoque atual durará'
      },
      {
        key: 'accuracy_percentage',
        label: 'Acuracidade do Estoque',
        value: accuracyPercentage,
        unit: '%',
        trend: 'up' as const,
        trendValue: 1.8,
        status: accuracyPercentage >= 95 ? 'good' : accuracyPercentage >= 90 ? 'warning' : 'critical' as const,
        target: 98,
        description: 'Percentual de produtos dentro dos níveis ideais'
      },
      {
        key: 'waste_percentage',
        label: 'Taxa de Desperdício',
        value: wastePercentage,
        unit: '%',
        trend: 'down' as const,
        trendValue: 12.3,
        status: wastePercentage <= 2 ? 'good' : wastePercentage <= 5 ? 'warning' : 'critical' as const,
        target: 2,
        description: 'Percentual de perdas por vencimento'
      }
    ]

    return NextResponse.json({
      success: true,
      data: kpis,
      metadata: {
        period: params.period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clinicId: params.clinicId,
        totalProducts: stockData?.length || 0,
        totalMovements: movementData?.length || 0
      }
    })

  } catch (error) {
    console.error('Dashboard KPIs API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}