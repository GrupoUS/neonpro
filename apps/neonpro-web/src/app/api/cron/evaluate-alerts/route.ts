// Background Job: Alert Evaluation
// Story 11.4: Alertas e Relatórios de Estoque
// Cron job para avaliar e gerar alertas automaticamente

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { StockAlertService } from "@/app/lib/services/stock-alert.service";
import type { StockAlertError } from "@/app/lib/types/stock";

// =====================================================
// CONFIGURATION
// =====================================================

const BATCH_SIZE = 100; // Process in batches to avoid memory issues
const MAX_EXECUTION_TIME = 50000; // 50 seconds (Vercel function timeout is 60s)
const RETRY_ATTEMPTS = 3;

// =====================================================
// TYPES
// =====================================================

interface ProcessingResult {
  clinicsProcessed: number;
  alertsGenerated: number;
  errors: Array<{
    clinicId: string;
    error: string;
  }>;
  executionTime: number;
  timestamp: string;
}

interface ClinicBatch {
  clinicId: string;
  alertConfigs: any[];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Validates that this is a legitimate cron request
 */
function validateCronRequest(request: NextRequest): boolean {
  // In production, validate using Vercel's cron secret
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.NODE_ENV === "production" && authHeader !== expectedAuth) {
    return false;
  }

  return true;
}

/**
 * Gets all active clinics with alert configurations
 */
async function getActiveClinics(supabase: any): Promise<string[]> {
  const { data: clinics, error } = await supabase
    .from("stock_alert_configs")
    .select("clinic_id")
    .eq("is_active", true)
    .group("clinic_id");

  if (error) {
    throw new StockAlertError("Failed to fetch active clinics", "FETCH_CLINICS_FAILED", {
      error: error.message,
    });
  }

  return [...new Set(clinics?.map((c: any) => c.clinic_id) || [])];
}

/**
 * Processes alerts for a batch of clinics
 */
async function processBatch(
  clinicIds: string[],
  supabase: any,
  startTime: number,
): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    clinicsProcessed: 0,
    alertsGenerated: 0,
    errors: [],
    executionTime: 0,
    timestamp: new Date().toISOString(),
  };

  for (const clinicId of clinicIds) {
    // Check if we're approaching timeout
    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
      console.warn("Approaching timeout, stopping batch processing");
      break;
    }

    try {
      await processClinicAlerts(clinicId, supabase, result);
    } catch (error) {
      console.error(`Failed to process clinic ${clinicId}:`, error);
      result.errors.push({
        clinicId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.clinicsProcessed++;
  }

  result.executionTime = Date.now() - startTime;
  return result;
}

/**
 * Processes alerts for a single clinic
 */
async function processClinicAlerts(
  clinicId: string,
  supabase: any,
  result: ProcessingResult,
): Promise<void> {
  // Create a service instance for this clinic
  const alertService = new StockAlertService(supabase);

  let attempts = 0;
  while (attempts < RETRY_ATTEMPTS) {
    try {
      // Set clinic context for the service
      // Note: This would require modifying the service to accept clinic context
      const alerts = await evaluateClinicAlerts(clinicId, supabase);
      result.alertsGenerated += alerts.length;

      // Log successful processing
      console.log(`Processed clinic ${clinicId}: ${alerts.length} alerts generated`);
      break;
    } catch (error) {
      attempts++;
      if (attempts >= RETRY_ATTEMPTS) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
}

/**
 * Evaluates alerts for a specific clinic
 */
async function evaluateClinicAlerts(clinicId: string, supabase: any): Promise<any[]> {
  // Get active alert configurations for the clinic
  const { data: configs, error: configError } = await supabase
    .from("stock_alert_configs")
    .select(`
      *,
      product:products (
        id,
        name,
        current_stock,
        min_stock,
        expiration_date,
        unit_cost
      )
    `)
    .eq("clinic_id", clinicId)
    .eq("is_active", true);

  if (configError) {
    throw new StockAlertError("Failed to fetch alert configurations", "FETCH_CONFIGS_FAILED", {
      clinicId,
      error: configError.message,
    });
  }

  if (!configs || configs.length === 0) {
    return [];
  }

  const generatedAlerts: any[] = [];

  for (const config of configs) {
    try {
      const alert = await evaluateConfigCondition(config, supabase);
      if (alert) {
        generatedAlerts.push(alert);
      }
    } catch (error) {
      console.error(`Failed to evaluate config ${config.id}:`, error);
      // Continue processing other configs
    }
  }

  return generatedAlerts;
}

/**
 * Evaluates a single alert configuration condition
 */
async function evaluateConfigCondition(config: any, supabase: any): Promise<any | null> {
  const product = config.product;
  if (!product) {
    return null;
  }

  let shouldAlert = false;
  let currentValue: number = 0;
  let message = "";

  switch (config.alert_type) {
    case "low_stock":
      currentValue = product.current_stock || 0;
      shouldAlert = currentValue <= config.threshold_value;
      message = `Estoque baixo para ${product.name}: ${currentValue} unidades (limite: ${config.threshold_value})`;
      break;

    case "expiring":
      if (product.expiration_date) {
        const daysUntilExpiration = Math.ceil(
          (new Date(product.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        currentValue = daysUntilExpiration;
        shouldAlert = daysUntilExpiration <= config.threshold_value && daysUntilExpiration > 0;
        message = `Produto ${product.name} vence em ${daysUntilExpiration} dias`;
      }
      break;

    case "expired":
      if (product.expiration_date) {
        const daysUntilExpiration = Math.ceil(
          (new Date(product.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        currentValue = Math.abs(daysUntilExpiration);
        shouldAlert = daysUntilExpiration <= 0;
        message = `Produto ${product.name} vencido há ${Math.abs(daysUntilExpiration)} dias`;
      }
      break;

    case "overstock":
      currentValue = product.current_stock || 0;
      const maxStock = product.max_stock || product.min_stock * 3; // Default max = 3x min
      shouldAlert = currentValue >= maxStock;
      message = `Excesso de estoque para ${product.name}: ${currentValue} unidades (máximo: ${maxStock})`;
      break;

    default:
      return null;
  }

  if (!shouldAlert) {
    return null;
  }

  // Check if alert already exists and is not acknowledged
  const { data: existingAlert } = await supabase
    .from("stock_alerts")
    .select("id")
    .eq("alert_config_id", config.id)
    .eq("product_id", product.id)
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existingAlert) {
    // Alert already exists and is not acknowledged
    return null;
  }

  // Create new alert
  const alertData = {
    clinic_id: config.clinic_id,
    alert_config_id: config.id,
    product_id: product.id,
    alert_type: config.alert_type,
    severity_level: config.severity_level,
    current_value: currentValue,
    threshold_value: config.threshold_value,
    message,
    status: "active",
    metadata: {
      productName: product.name,
      generatedBy: "system",
      timestamp: new Date().toISOString(),
    },
    triggered_at: new Date().toISOString(),
  };

  const { data: newAlert, error } = await supabase
    .from("stock_alerts")
    .insert(alertData)
    .select()
    .single();

  if (error) {
    throw new StockAlertError("Failed to create alert", "CREATE_ALERT_FAILED", {
      configId: config.id,
      error: error.message,
    });
  }

  // Log event for audit trail
  await supabase.from("stock_alert_events").insert({
    event_type: "alert_generated",
    entity_id: newAlert.id,
    clinic_id: config.clinic_id,
    event_data: {
      configId: config.id,
      productId: product.id,
      alertType: config.alert_type,
      severityLevel: config.severity_level,
      currentValue,
      thresholdValue: config.threshold_value,
      generatedBy: "system",
    },
  });

  return newAlert;
}

/**
 * Records processing statistics
 */
async function recordProcessingStats(supabase: any, result: ProcessingResult): Promise<void> {
  try {
    await supabase.from("alert_processing_stats").insert({
      processed_at: result.timestamp,
      clinics_processed: result.clinicsProcessed,
      alerts_generated: result.alertsGenerated,
      execution_time_ms: result.executionTime,
      error_count: result.errors.length,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Failed to record processing stats:", error);
    // Don't throw - this is not critical
  }
}

// =====================================================
// API ENDPOINT
// =====================================================

/**
 * POST /api/cron/evaluate-alerts
 * Background job to evaluate alert conditions and generate alerts
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate cron request
    if (!validateCronRequest(request)) {
      return NextResponse.json(
        { error: "Unauthorized", code: "INVALID_CRON_REQUEST" },
        { status: 401 },
      );
    }

    console.log("Starting alert evaluation job...");

    // Initialize Supabase client
    const supabase = await createClient();

    // Get all active clinics
    const clinicIds = await getActiveClinics(supabase);
    console.log(`Found ${clinicIds.length} clinics with active alert configurations`);

    if (clinicIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active clinics found",
        data: {
          clinicsProcessed: 0,
          alertsGenerated: 0,
          errors: [],
          executionTime: Date.now() - startTime,
        },
      });
    }

    // Process clinics in batches
    const batches: string[][] = [];
    for (let i = 0; i < clinicIds.length; i += BATCH_SIZE) {
      batches.push(clinicIds.slice(i, i + BATCH_SIZE));
    }

    const totalResult: ProcessingResult = {
      clinicsProcessed: 0,
      alertsGenerated: 0,
      errors: [],
      executionTime: 0,
      timestamp: new Date().toISOString(),
    };

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i + 1}/${batches.length}`);

      const batchResult = await processBatch(batches[i], supabase, startTime);

      // Merge results
      totalResult.clinicsProcessed += batchResult.clinicsProcessed;
      totalResult.alertsGenerated += batchResult.alertsGenerated;
      totalResult.errors.push(...batchResult.errors);

      // Check timeout
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.warn("Timeout reached, stopping processing");
        break;
      }
    }

    totalResult.executionTime = Date.now() - startTime;

    // Record processing statistics
    await recordProcessingStats(supabase, totalResult);

    console.log("Alert evaluation job completed:", {
      clinicsProcessed: totalResult.clinicsProcessed,
      alertsGenerated: totalResult.alertsGenerated,
      errorCount: totalResult.errors.length,
      executionTime: `${totalResult.executionTime}ms`,
    });

    return NextResponse.json({
      success: true,
      message: "Alert evaluation completed",
      data: totalResult,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error("Alert evaluation job failed:", {
      error: error instanceof Error ? error.message : "Unknown error",
      executionTime: `${executionTime}ms`,
    });

    if (error instanceof StockAlertError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          context: error.context,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * GET /api/cron/evaluate-alerts
 * Health check for the cron job endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "alert-evaluation-cron",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
