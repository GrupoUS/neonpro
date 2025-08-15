import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Integration with Epic 6 (Agenda Inteligente)
// Predicts material consumption based on scheduled procedures

const scheduleIntegrationSchema = z.object({
  clinicId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeRecommendations: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const params = scheduleIntegrationSchema.parse(body);

    // Verify clinic access
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', params.clinicId)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clínica não encontrada' },
        { status: 404 }
      );
    }

    // Get scheduled appointments for the period
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_date,
        procedure_type,
        status,
        patient_id,
        procedure_templates (
          id,
          name,
          estimated_duration,
          required_materials
        )
      `)
      .eq('clinic_id', params.clinicId)
      .gte('scheduled_date', params.startDate)
      .lte('scheduled_date', params.endDate)
      .in('status', ['scheduled', 'confirmed']);

    if (appointmentsError) {
      console.error('Appointments Error:', appointmentsError);
      return NextResponse.json(
        { error: 'Erro ao buscar agendamentos' },
        { status: 500 }
      );
    }

    // Get material templates for procedures
    const { data: materialTemplates, error: templatesError } = await supabase
      .from('procedure_material_templates')
      .select(`
        procedure_type,
        product_id,
        estimated_quantity,
        is_mandatory,
        products (
          id,
          name,
          unit_cost
        )
      `)
      .eq('clinic_id', params.clinicId)
      .eq('is_active', true);

    if (templatesError) {
      console.error('Material Templates Error:', templatesError);
      return NextResponse.json(
        { error: 'Erro ao buscar templates de materiais' },
        { status: 500 }
      );
    }

    // Calculate predicted consumption
    const materialPredictions = new Map();
    const dailyPredictions = new Map();

    appointments?.forEach((appointment) => {
      const appointmentDate = appointment.scheduled_date.split('T')[0];
      const procedureType = appointment.procedure_type;

      // Get materials for this procedure type
      const requiredMaterials =
        materialTemplates?.filter(
          (template) => template.procedure_type === procedureType
        ) || [];

      requiredMaterials.forEach((material) => {
        const productId = material.product_id;
        const quantity = material.estimated_quantity || 1;
        const productName = material.products?.name || 'Material desconhecido';
        const unitCost = material.products?.unit_cost || 0;

        // Accumulate by product
        if (materialPredictions.has(productId)) {
          const existing = materialPredictions.get(productId);
          existing.totalQuantity += quantity;
          existing.procedures++;
        } else {
          materialPredictions.set(productId, {
            productId,
            productName,
            unitCost,
            totalQuantity: quantity,
            procedures: 1,
            isMandatory: material.is_mandatory,
          });
        }

        // Accumulate by day
        const dayKey = `${appointmentDate}-${productId}`;
        if (dailyPredictions.has(dayKey)) {
          const existing = dailyPredictions.get(dayKey);
          existing.quantity += quantity;
        } else {
          dailyPredictions.set(dayKey, {
            date: appointmentDate,
            productId,
            productName,
            quantity,
            estimatedCost: quantity * unitCost,
          });
        }
      });
    });

    // Get current stock levels for comparison
    const productIds = Array.from(materialPredictions.keys());
    const { data: currentStock, error: stockError } = await supabase
      .from('stock_inventory')
      .select('product_id, quantity_available, min_stock_level')
      .eq('clinic_id', params.clinicId)
      .in('product_id', productIds)
      .eq('is_active', true);

    if (stockError) {
      console.error('Stock Error:', stockError);
      return NextResponse.json(
        { error: 'Erro ao buscar estoque atual' },
        { status: 500 }
      );
    }

    // Create stock map for quick lookup
    const stockMap = new Map();
    currentStock?.forEach((stock) => {
      stockMap.set(stock.product_id, stock);
    });

    // Generate recommendations
    const recommendations = [];
    const alerts = [];

    Array.from(materialPredictions.values()).forEach((prediction) => {
      const currentStockItem = stockMap.get(prediction.productId);
      const availableQuantity = currentStockItem?.quantity_available || 0;
      const minStockLevel = currentStockItem?.min_stock_level || 0;

      // Check if current stock is sufficient
      const stockAfterConsumption =
        availableQuantity - prediction.totalQuantity;

      if (stockAfterConsumption < minStockLevel) {
        const shortfall = minStockLevel - stockAfterConsumption;

        recommendations.push({
          type: 'reorder',
          priority: stockAfterConsumption < 0 ? 'critical' : 'high',
          productId: prediction.productId,
          productName: prediction.productName,
          message:
            stockAfterConsumption < 0
              ? `Falta crítica: ${prediction.productName} terá déficit de ${Math.abs(stockAfterConsumption)} unidades`
              : `Reposição necessária: ${prediction.productName} ficará abaixo do estoque mínimo`,
          recommendedOrder: shortfall + 10, // Add buffer
          estimatedCost: (shortfall + 10) * prediction.unitCost,
          dueDate: params.startDate,
        });

        alerts.push({
          type: 'schedule_shortage',
          severity: stockAfterConsumption < 0 ? 'critical' : 'high',
          productId: prediction.productId,
          message: `${prediction.productName}: estoque insuficiente para agendamentos`,
          impact: `${prediction.procedures} procedimentos afetados`,
        });
      }
    });

    // Generate daily breakdown
    const dailyBreakdown = Array.from(dailyPredictions.values()).reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = {
            date: item.date,
            totalCost: 0,
            materials: [],
          };
        }
        acc[item.date].totalCost += item.estimatedCost;
        acc[item.date].materials.push(item);
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        period: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
        summary: {
          totalAppointments: appointments?.length || 0,
          uniqueMaterials: materialPredictions.size,
          totalEstimatedCost: Array.from(materialPredictions.values()).reduce(
            (sum, pred) => sum + pred.totalQuantity * pred.unitCost,
            0
          ),
          potentialShortages: alerts.length,
        },
        predictions: Array.from(materialPredictions.values()),
        dailyBreakdown: Object.values(dailyBreakdown),
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
        alerts: alerts.slice(0, 20), // Top 20 alerts
        integration: {
          source: 'Epic 6 - Agenda Inteligente',
          lastSync: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Schedule Integration API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
