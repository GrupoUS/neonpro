import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportConfig {
  id: string;
  clinic_id: string;
  user_id: string;
  report_name: string;
  report_type: "consumption" | "valuation" | "movement" | "custom";
  filters: unknown;
  schedule_config?: {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
  };
  is_active: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date/time info
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.getDate();
    const currentHour = now.getHours();

    // Get all active scheduled reports
    const { data: reportConfigs, error: configError } = await supabase
      .from("custom_stock_reports")
      .select("*")
      .eq("is_active", true)
      .not("schedule_config", "is", undefined);

    if (configError) {
      throw configError;
    }

    const processedReports: unknown[] = [];
    const emailQueue: unknown[] = [];

    // Process each scheduled report
    for (const config of reportConfigs || []) {
      if (!config.schedule_config) {
        continue;
      }

      const { schedule_config: schedule } = config;
      let shouldGenerate = false;

      // Check if report should be generated now
      switch (schedule.frequency) {
        case "daily": {
          shouldGenerate = true;
          break;
        }

        case "weekly": {
          if (
            schedule.dayOfWeek !== undefined
            && currentDay === schedule.dayOfWeek
          ) {
            shouldGenerate = true;
          }
          break;
        }

        case "monthly": {
          if (
            schedule.dayOfMonth !== undefined
            && currentDate === schedule.dayOfMonth
          ) {
            shouldGenerate = true;
          }
          break;
        }
      }

      // Check time (simplified - just check hour)
      const scheduleHour = Number.parseInt(schedule.time.split(":")[0], 10);
      if (shouldGenerate && currentHour === scheduleHour) {
        try {
          const reportData = await generateReport(supabase, config);

          // Store generated report
          const { data: reportRecord, error: reportError } = await supabase
            .from("stock_reports")
            .insert({
              clinic_id: config.clinic_id,
              report_config_id: config.id,
              report_name: config.report_name,
              report_type: config.report_type,
              report_data: reportData,
              generated_by: config.user_id,
              status: "completed",
            })
            .select()
            .single();

          if (reportError) {
            continue;
          }

          processedReports.push({
            configId: config.id,
            reportId: reportRecord.id,
            reportName: config.report_name,
            clinicId: config.clinic_id,
          });

          // Queue email notifications
          if (schedule.recipients && schedule.recipients.length > 0) {
            emailQueue.push({
              recipients: schedule.recipients,
              reportName: config.report_name,
              reportId: reportRecord.id,
              reportData,
            });
          }
        } catch {}
      }
    }

    // Process email notifications (simplified)
    for (const _email of emailQueue) {
      // In a real implementation, you would:
      // 1. Generate PDF/Excel from reportData
      // 2. Send email with attachment using a service like SendGrid
      // 3. Log email delivery status
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          reports_generated: processedReports.length,
          emails_queued: emailQueue.length,
          timestamp: now.toISOString(),
        },
        reports: processedReports,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

async function generateReport(supabase: unknown, config: ReportConfig) {
  const filters = config.filters || {};
  const { clinic_id: clinicId } = config;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  if (filters.dateRange) {
    startDate.setTime(new Date(filters.dateRange.start).getTime());
    endDate.setTime(new Date(filters.dateRange.end).getTime());
  } else {
    // Default to last 30 days
    startDate.setDate(endDate.getDate() - 30);
  }

  switch (config.report_type) {
    case "consumption": {
      return await generateConsumptionReport(
        supabase,
        clinicId,
        filters,
        startDate,
        endDate,
      );
    }

    case "valuation": {
      return await generateValuationReport(
        supabase,
        clinicId,
        filters,
        startDate,
        endDate,
      );
    }

    case "movement": {
      return await generateMovementReport(
        supabase,
        clinicId,
        filters,
        startDate,
        endDate,
      );
    }

    default: {
      return await generateCustomReport(
        supabase,
        clinicId,
        filters,
        startDate,
        endDate,
      );
    }
  }
}

async function generateConsumptionReport(
  supabase: unknown,
  clinicId: string,
  _filters: unknown,
  startDate: Date,
  endDate: Date,
) {
  // Get consumption data
  const { data: movements, error } = await supabase
    .from("stock_movement_transactions")
    .select(
      `
      product_id,
      quantity_out,
      unit_cost,
      transaction_date,
      products (
        name,
        category_id,
        product_categories (name)
      )
    `,
    )
    .eq("clinic_id", clinicId)
    .eq("movement_type", "out")
    .gte("transaction_date", startDate.toISOString())
    .lte("transaction_date", endDate.toISOString());

  if (error) {
    throw error;
  }

  // Group by product
  const consumptionByProduct = new Map();
  let totalConsumption = 0;
  let totalValue = 0;

  movements?.forEach((movement: unknown) => {
    const { product_id: productId } = movement;
    const quantity = movement.quantity_out || 0;
    const value = quantity * (movement.unit_cost || 0);

    totalConsumption += quantity;
    totalValue += value;

    if (consumptionByProduct.has(productId)) {
      const existing = consumptionByProduct.get(productId);
      existing.quantity += quantity;
      existing.value += value;
      existing.transactions++;
    } else {
      consumptionByProduct.set(productId, {
        productId,
        productName: movement.products?.name || "Produto sem nome",
        category: movement.products?.product_categories?.name || "Sem categoria",
        quantity,
        value,
        transactions: 1,
      });
    }
  });

  const topProducts = [...consumptionByProduct.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 20);

  return {
    type: "consumption",
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalConsumption,
      totalValue,
      uniqueProducts: consumptionByProduct.size,
      totalTransactions: movements?.length || 0,
    },
    topProducts,
    generatedAt: new Date().toISOString(),
  };
}

async function generateValuationReport(
  supabase: unknown,
  clinicId: string,
  _filters: unknown,
  startDate: Date,
  endDate: Date,
) {
  // Get current inventory
  const { data: inventory, error } = await supabase
    .from("stock_inventory")
    .select(
      `
      product_id,
      quantity_available,
      unit_cost,
      min_stock_level,
      max_stock_level,
      products (
        name,
        category_id,
        product_categories (name)
      )
    `,
    )
    .eq("clinic_id", clinicId)
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  const totalValue = inventory?.reduce(
    (sum: number, item: unknown) => sum + item.quantity_available * item.unit_cost,
    0,
  ) || 0;

  const byCategory = new Map();

  inventory?.forEach((item: unknown) => {
    const category = item.products?.product_categories?.name || "Sem categoria";
    const value = item.quantity_available * item.unit_cost;

    if (byCategory.has(category)) {
      const existing = byCategory.get(category);
      existing.value += value;
      existing.quantity += item.quantity_available;
      existing.products++;
    } else {
      byCategory.set(category, {
        category,
        value,
        quantity: item.quantity_available,
        products: 1,
      });
    }
  });

  return {
    type: "valuation",
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalValue,
      totalProducts: inventory?.length || 0,
      categories: byCategory.size,
    },
    byCategory: [...byCategory.values()],
    topValueProducts: inventory
      ?.map((item: unknown) => ({
        productName: item.products?.name || "Produto sem nome",
        quantity: item.quantity_available,
        unitCost: item.unit_cost,
        totalValue: item.quantity_available * item.unit_cost,
      }))
      .sort((a: unknown, b: unknown) => b.totalValue - a.totalValue)
      .slice(0, 20) || [],
    generatedAt: new Date().toISOString(),
  };
}

async function generateMovementReport(
  supabase: unknown,
  clinicId: string,
  _filters: unknown,
  startDate: Date,
  endDate: Date,
) {
  // Get all movements
  const { data: movements, error } = await supabase
    .from("stock_movement_transactions")
    .select(
      `
      movement_type,
      quantity_in,
      quantity_out,
      unit_cost,
      transaction_date,
      reference_type,
      reference_id
    `,
    )
    .eq("clinic_id", clinicId)
    .gte("transaction_date", startDate.toISOString())
    .lte("transaction_date", endDate.toISOString());

  if (error) {
    throw error;
  }

  const summary = {
    totalIn: 0,
    totalOut: 0,
    totalTransactions: movements?.length || 0,
    byType: new Map(),
  };

  movements?.forEach((movement: unknown) => {
    summary.totalIn += movement.quantity_in || 0;
    summary.totalOut += movement.quantity_out || 0;

    const { movement_type: type } = movement;
    if (summary.byType.has(type)) {
      const existing = summary.byType.get(type);
      existing.count++;
      existing.quantityIn += movement.quantity_in || 0;
      existing.quantityOut += movement.quantity_out || 0;
    } else {
      summary.byType.set(type, {
        type,
        count: 1,
        quantityIn: movement.quantity_in || 0,
        quantityOut: movement.quantity_out || 0,
      });
    }
  });

  return {
    type: "movement",
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      ...summary,
      byType: [...summary.byType.values()],
    },
    generatedAt: new Date().toISOString(),
  };
}

async function generateCustomReport(
  _supabase: unknown,
  _clinicId: string,
  filters: unknown,
  startDate: Date,
  endDate: Date,
) {
  // Custom report based on filters
  return {
    type: "custom",
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    filters,
    message: "Custom report generation not yet implemented",
    generatedAt: new Date().toISOString(),
  };
}

/* To deploy this function:
 * npx supabase functions deploy stock-reports-generator
 *
 * To schedule this function (add to supabase/functions/_cron/cron.ts):
 * {
 *   name: 'stock-reports-generator',
 *   cron: '0 9 * * *', // Daily at 9 AM
 *   function: 'stock-reports-generator'
 * }
 */
