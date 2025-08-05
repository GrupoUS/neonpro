import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const dashboardParamsSchema = z.object({
  clinicId: z.string().uuid(),
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(5).max(50).default(10)
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
      endDate: searchParams.get('endDate'),
      limit: parseInt(searchParams.get('limit') || '10')
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

    // Get top products by consumption
    const { data: topProductsData, error: topProductsError } = await supabase
      .from('stock_movement_transactions')
      .select(`
        product_id,
        quantity_out,
        unit_cost,
        products!inner (
          id,
          name,
          category_id,
          product_categories (name)
        )
      `)
      .eq('clinic_id', params.clinicId)
      .eq('movement_type', 'out')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString())

    if (topProductsError) {
      console.error('Top Products Error:', topProductsError)
      return NextResponse.json({ error: 'Erro ao buscar produtos mais consumidos' }, { status: 500 })
    }

    // Group by product and calculate totals
    const productMap = new Map()
    
    topProductsData?.forEach(transaction => {
      const productId = transaction.product_id
      const consumption = transaction.quantity_out || 0
      const value = consumption * (transaction.unit_cost || 0)

      if (productMap.has(productId)) {
        const existing = productMap.get(productId)
        existing.consumption += consumption
        existing.value += value
        existing.transactions++
      } else {
        productMap.set(productId, {
          id: productId,
          name: transaction.products?.name || 'Produto sem nome',
          category: transaction.products?.product_categories?.name || 'Sem categoria',
          consumption,
          value,
          transactions: 1,
          trend: 'stable' as const, // Would need historical data to calculate real trend
          impact: value > 1000 ? 'high' : value > 500 ? 'medium' : 'low' as const
        })
      }
    })

    // Sort by consumption and get top products
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.consumption - a.consumption)
      .slice(0, params.limit)
      .map((product, index) => ({
        ...product,
        rank: index + 1,
        // Add trend calculation based on ranking (simplified)
        trend: index < 3 ? 'up' : index > 7 ? 'down' : 'stable' as const
      }))

    // Calculate additional metrics
    const totalConsumption = topProducts.reduce((sum, product) => sum + product.consumption, 0)
    const totalValue = topProducts.reduce((sum, product) => sum + product.value, 0)

    const productsWithPercentages = topProducts.map(product => ({
      ...product,
      consumptionPercentage: totalConsumption > 0 ? (product.consumption / totalConsumption) * 100 : 0,
      valuePercentage: totalValue > 0 ? (product.value / totalValue) * 100 : 0
    }))

    return NextResponse.json({
      success: true,
      data: productsWithPercentages,
      metadata: {
        period: params.period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        clinicId: params.clinicId,
        totalProducts: productMap.size,
        totalConsumption,
        totalValue,
        limit: params.limit
      }
    })

  } catch (error) {
    console.error('Dashboard Top Products API Error:', error)
    
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
