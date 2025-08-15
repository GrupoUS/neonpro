import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Integration with Epic 7 (Financeiro Essencial)
// Provides cost analysis and financial impact of stock management

const financialIntegrationSchema = z.object({
  clinicId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeProjections: z.boolean().default(true),
  includeBudgetComparison: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const params = financialIntegrationSchema.parse(body)

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', params.clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Get stock movements for cost analysis
    const { data: stockMovements, error: movementsError } = await supabase
      .from('stock_movement_transactions')
      .select(`
        movement_type,
        quantity_in,
        quantity_out,
        unit_cost,
        total_cost,
        transaction_date,
        reference_type,
        reference_id,
        product_id,
        products (
          name,
          category_id,
          product_categories (name)
        )
      `)
      .eq('clinic_id', params.clinicId)
      .gte('transaction_date', params.startDate)
      .lte('transaction_date', params.endDate)

    if (movementsError) {
      console.error('Stock Movements Error:', movementsError)
      return NextResponse.json({ error: 'Erro ao buscar movimentações de estoque' }, { status: 500 })
    }

    // Get current inventory value
    const { data: currentInventory, error: inventoryError } = await supabase
      .from('stock_inventory')
      .select(`
        product_id,
        quantity_available,
        unit_cost,
        products (
          name,
          category_id,
          product_categories (name)
        )
      `)
      .eq('clinic_id', params.clinicId)
      .eq('is_active', true)

    if (inventoryError) {
      console.error('Inventory Error:', inventoryError)
      return NextResponse.json({ error: 'Erro ao buscar inventário atual' }, { status: 500 })
    }

    // Get budget data if available (Epic 7 integration)
    const { data: budgetData, error: budgetError } = await supabase
      .from('financial_budgets')
      .select('category, allocated_amount, spent_amount, period_start, period_end')
      .eq('clinic_id', params.clinicId)
      .eq('budget_type', 'materials')
      .gte('period_start', params.startDate)
      .lte('period_end', params.endDate)

    // Calculate financial metrics
    const financialMetrics = {
      purchases: {
        totalCost: 0,
        totalQuantity: 0,
        averageUnitCost: 0,
        transactions: 0
      },
      consumption: {
        totalCost: 0,
        totalQuantity: 0,
        averageUnitCost: 0,
        transactions: 0
      },
      waste: {
        totalCost: 0,
        totalQuantity: 0,
        averageUnitCost: 0,
        transactions: 0
      },
      adjustments: {
        totalCost: 0,
        totalQuantity: 0,
        transactions: 0
      }
    }

    // Process movements by type
    stockMovements?.forEach(movement => {
      const cost = movement.total_cost || (movement.unit_cost * (movement.quantity_in || movement.quantity_out || 0))
      
      switch (movement.movement_type) {
        case 'in':
        case 'purchase':
          financialMetrics.purchases.totalCost += cost
          financialMetrics.purchases.totalQuantity += movement.quantity_in || 0
          financialMetrics.purchases.transactions++
          break
        
        case 'out':
        case 'consumption':
          financialMetrics.consumption.totalCost += cost
          financialMetrics.consumption.totalQuantity += movement.quantity_out || 0
          financialMetrics.consumption.transactions++
          break
        
        case 'waste':
        case 'expired':
          financialMetrics.waste.totalCost += cost
          financialMetrics.waste.totalQuantity += movement.quantity_out || 0
          financialMetrics.waste.transactions++
          break
        
        case 'adjustment':
          financialMetrics.adjustments.totalCost += Math.abs(cost)
          financialMetrics.adjustments.totalQuantity += Math.abs(movement.quantity_in || movement.quantity_out || 0)
          financialMetrics.adjustments.transactions++
          break
      }
    })

    // Calculate averages
    Object.keys(financialMetrics).forEach(key => {
      const metric = financialMetrics[key]
      if (metric.totalQuantity > 0) {
        metric.averageUnitCost = metric.totalCost / metric.totalQuantity
      }
    })

    // Calculate inventory value
    const currentInventoryValue = currentInventory?.reduce((sum, item) => 
      sum + (item.quantity_available * item.unit_cost), 0) || 0

    // Calculate by category
    const categoryBreakdown = new Map()
    
    stockMovements?.forEach(movement => {
      const category = movement.products?.product_categories?.name || 'Sem categoria'
      const cost = movement.total_cost || (movement.unit_cost * (movement.quantity_in || movement.quantity_out || 0))
      
      if (!categoryBreakdown.has(category)) {
        categoryBreakdown.set(category, {
          category,
          purchases: 0,
          consumption: 0,
          waste: 0,
          netValue: 0
        })
      }
      
      const categoryData = categoryBreakdown.get(category)
      
      switch (movement.movement_type) {
        case 'in':
        case 'purchase':
          categoryData.purchases += cost
          categoryData.netValue += cost
          break
        case 'out':
        case 'consumption':
          categoryData.consumption += cost
          categoryData.netValue -= cost
          break
        case 'waste':
        case 'expired':
          categoryData.waste += cost
          categoryData.netValue -= cost
          break
      }
    })

    // Calculate ROI and efficiency metrics
    const totalInvestment = financialMetrics.purchases.totalCost
    const totalReturns = financialMetrics.consumption.totalCost // Value consumed in procedures
    const wastePercentage = totalInvestment > 0 ? (financialMetrics.waste.totalCost / totalInvestment) * 100 : 0
    const turnoverRate = currentInventoryValue > 0 ? financialMetrics.consumption.totalCost / currentInventoryValue : 0

    // Budget comparison
    let budgetComparison = null
    if (params.includeBudgetComparison && budgetData && budgetData.length > 0) {
      const totalBudget = budgetData.reduce((sum, budget) => sum + budget.allocated_amount, 0)
      const totalSpent = financialMetrics.purchases.totalCost
      
      budgetComparison = {
        totalBudget,
        totalSpent,
        remainingBudget: totalBudget - totalSpent,
        utilizationPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        variance: totalSpent - totalBudget,
        status: totalSpent > totalBudget ? 'over_budget' : totalSpent > totalBudget * 0.9 ? 'near_budget' : 'within_budget'
      }
    }

    // Financial projections
    let projections = null
    if (params.includeProjections) {
      const daysInPeriod = Math.ceil((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24))
      const dailyConsumption = financialMetrics.consumption.totalCost / daysInPeriod
      const dailyWaste = financialMetrics.waste.totalCost / daysInPeriod
      
      projections = {
        nextMonthConsumption: dailyConsumption * 30,
        nextMonthWaste: dailyWaste * 30,
        nextMonthNeeds: dailyConsumption * 30 * 1.1, // 10% buffer
        cashFlowImpact: currentInventoryValue + (dailyConsumption * 30),
        recommendations: [
          {
            type: 'optimization',
            message: wastePercentage > 5 ? 'Alto desperdício detectado - revisar políticas de compra' : 'Desperdício dentro do aceitável',
            priority: wastePercentage > 5 ? 'high' : 'low'
          },
          {
            type: 'budget',
            message: budgetComparison?.status === 'over_budget' ? 'Orçamento excedido - revisar gastos' : 'Orçamento sob controle',
            priority: budgetComparison?.status === 'over_budget' ? 'critical' : 'low'
          }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        period: {
          startDate: params.startDate,
          endDate: params.endDate
        },
        summary: {
          totalInvestment,
          totalConsumption: financialMetrics.consumption.totalCost,
          totalWaste: financialMetrics.waste.totalCost,
          currentInventoryValue,
          turnoverRate,
          wastePercentage,
          netCashFlow: totalInvestment - financialMetrics.consumption.totalCost - financialMetrics.waste.totalCost
        },
        metrics: financialMetrics,
        categoryBreakdown: Array.from(categoryBreakdown.values()),
        budgetComparison,
        projections,
        integration: {
          source: 'Epic 7 - Financeiro Essencial',
          lastSync: new Date().toISOString(),
          budgetDataAvailable: budgetData && budgetData.length > 0
        }
      }
    })

  } catch (error) {
    console.error('Financial Integration API Error:', error)
    
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