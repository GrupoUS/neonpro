// Bulk Order Optimization API Endpoint
// POST /api/inventory/purchase-orders/optimize - Get bulk order optimization recommendations
import { purchaseOrderService } from '@/app/lib/services/purchase-order-service';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const optimizeBulkOrderSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic ID is required'),
  item_ids: z.array(z.string().min(1, 'Item ID is required')).min(1, 'At least one item is required'),
  analysis_type: z.enum(['eoq', 'bulk_discount', 'seasonal', 'all']).optional().default('all')
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = optimizeBulkOrderSchema.parse(body);

    // Get optimization recommendations
    const optimizationResults = await purchaseOrderService.optimizeBulkOrder(
      validatedData.clinic_id,
      validatedData.item_ids
    );

    // Get additional item details for recommendations
    const { data: itemsData, error: itemsError } = await supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        sku,
        category,
        unit_cost,
        current_stock,
        minimum_threshold,
        maximum_threshold,
        unit
      `)
      .in('id', validatedData.item_ids);

    if (itemsError) {
      console.error('Error fetching item details:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch item details' }, { status: 500 });
    }

    // Enhance recommendations with item details
    const enhancedRecommendations = optimizationResults.recommendations.map(rec => {
      const itemData = itemsData?.find(item => item.id === rec.itemId);
      return {
        ...rec,
        item_details: itemData ? {
          name: itemData.name,
          sku: itemData.sku,
          category: itemData.category,
          unit_cost: itemData.unit_cost,
          current_stock: itemData.current_stock,
          minimum_threshold: itemData.minimum_threshold,
          maximum_threshold: itemData.maximum_threshold,
          unit: itemData.unit
        } : null,
        optimization_type: 'EOQ',
        potential_savings_percentage: itemData ? (rec.costSavings / (itemData.unit_cost * rec.currentQuantity)) * 100 : 0
      };
    });

    // Calculate additional bulk optimization opportunities
    const bulkOpportunities = await analyzeBulkOpportunities(supabase, validatedData.item_ids, validatedData.clinic_id);
    
    // Generate seasonal recommendations if requested
    const seasonalRecommendations = validatedData.analysis_type === 'seasonal' || validatedData.analysis_type === 'all' 
      ? await generateSeasonalRecommendations(supabase, validatedData.item_ids, validatedData.clinic_id)
      : [];

    return NextResponse.json({
      optimization_summary: {
        total_items_analyzed: validatedData.item_ids.length,
        total_potential_savings: optimizationResults.totalSavings,
        recommendations_count: enhancedRecommendations.length,
        bulk_opportunities_count: bulkOpportunities.length,
        seasonal_recommendations_count: seasonalRecommendations.length
      },
      eoq_recommendations: enhancedRecommendations,
      bulk_opportunities: bulkOpportunities,
      seasonal_recommendations: seasonalRecommendations,
      analysis_metadata: {
        analysis_type: validatedData.analysis_type,
        generated_at: new Date().toISOString(),
        clinic_id: validatedData.clinic_id
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error in bulk order optimization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to analyze bulk opportunities
async function analyzeBulkOpportunities(supabase: any, itemIds: string[], clinicId: string) {
  try {
    // Get supplier data for bulk discount analysis
    const { data: supplierItems, error } = await supabase
      .from('supplier_items')
      .select(`
        item_id,
        supplier_id,
        unit_cost,
        bulk_discount_threshold,
        bulk_discount_percentage,
        minimum_order_quantity,
        suppliers (
          name,
          bulk_order_incentives
        )
      `)
      .in('item_id', itemIds)
      .not('bulk_discount_threshold', 'is', null);

    if (error) return [];

    const bulkOpportunities = supplierItems?.map((item: any) => {
      const potentialSavings = item.unit_cost * item.bulk_discount_threshold * (item.bulk_discount_percentage / 100);
      
      return {
        item_id: item.item_id,
        supplier_id: item.supplier_id,
        supplier_name: item.suppliers?.name,
        bulk_threshold: item.bulk_discount_threshold,
        discount_percentage: item.bulk_discount_percentage,
        minimum_order: item.minimum_order_quantity,
        potential_savings: potentialSavings,
        recommendation: `Order ${item.bulk_discount_threshold} units to get ${item.bulk_discount_percentage}% discount`,
        priority: potentialSavings > 100 ? 'high' : potentialSavings > 50 ? 'medium' : 'low'
      };
    }) || [];

    return bulkOpportunities.sort((a: any, b: any) => b.potential_savings - a.potential_savings);

  } catch (error) {
    console.error('Error analyzing bulk opportunities:', error);
    return [];
  }
}

// Helper function to generate seasonal recommendations
async function generateSeasonalRecommendations(supabase: any, itemIds: string[], clinicId: string) {
  try {
    // Analyze historical consumption patterns for seasonality
    const { data: consumptionData, error } = await supabase
      .from('inventory_transactions')
      .select(`
        item_id,
        quantity,
        created_at,
        inventory_items (
          name,
          category
        )
      `)
      .in('item_id', itemIds)
      .eq('clinic_id', clinicId)
      .eq('transaction_type', 'consumption')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()); // Last year

    if (error || !consumptionData) return [];

    // Group by month and analyze patterns
    const monthlyConsumption = consumptionData.reduce((acc: any, transaction: any) => {
      const month = new Date(transaction.created_at).getMonth();
      const itemId = transaction.item_id;
      
      if (!acc[itemId]) acc[itemId] = {};
      if (!acc[itemId][month]) acc[itemId][month] = 0;
      
      acc[itemId][month] += Math.abs(transaction.quantity);
      
      return acc;
    }, {});

    const seasonalRecommendations = [];

    for (const [itemId, monthlyData] of Object.entries(monthlyConsumption)) {
      const months = Object.values(monthlyData as any) as number[];
      const avgConsumption = months.reduce((sum, val) => sum + val, 0) / months.length;
      const maxConsumption = Math.max(...months);
      const peakMonth = Object.entries(monthlyData as any).find(([, value]) => value === maxConsumption)?.[0];
      
      // If peak consumption is significantly higher than average
      if (maxConsumption > avgConsumption * 1.5) {
        const itemData = consumptionData.find((t: any) => t.item_id === itemId)?.inventory_items;
        
        seasonalRecommendations.push({
          item_id: itemId,
          item_name: itemData?.name,
          category: itemData?.category,
          peak_month: peakMonth ? parseInt(peakMonth) : null,
          peak_consumption: maxConsumption,
          average_consumption: Math.round(avgConsumption),
          seasonality_factor: Math.round((maxConsumption / avgConsumption) * 100) / 100,
          recommendation: `Consider increasing stock before month ${peakMonth ? parseInt(peakMonth) + 1 : 'N/A'} due to ${Math.round(((maxConsumption / avgConsumption) - 1) * 100)}% higher consumption`,
          suggested_stock_increase: Math.round(maxConsumption - avgConsumption),
          priority: maxConsumption > avgConsumption * 2 ? 'high' : 'medium'
        });
      }
    }

    return seasonalRecommendations.sort((a, b) => b.seasonality_factor - a.seasonality_factor);

  } catch (error) {
    console.error('Error generating seasonal recommendations:', error);
    return [];
  }
}
