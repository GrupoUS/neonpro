import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertConfig {
  id: string;
  clinic_id: string;
  product_id?: string;
  category_id?: string;
  alert_type: 'low_stock' | 'expiring' | 'expired' | 'overstock';
  threshold_value: number;
  threshold_unit: 'quantity' | 'days' | 'percentage';
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notification_channels: string[];
}

interface Product {
  id: string;
  name: string;
  quantity_available: number;
  min_stock_level: number;
  max_stock_level: number;
  expiry_date?: string;
  unit_cost: number;
}

interface GeneratedAlert {
  clinic_id: string;
  alert_config_id: string;
  product_id: string;
  alert_type: string;
  severity_level: string;
  current_value: number;
  threshold_value: number;
  message: string;
  status: 'active';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active alert configurations
    const { data: alertConfigs, error: configError } = await supabase
      .from('stock_alert_configs')
      .select('*')
      .eq('is_active', true);

    if (configError) {
      throw configError;
    }

    const generatedAlerts: GeneratedAlert[] = [];
    const notificationQueue: any[] = [];

    // Process each clinic
    const clinicIds = [
      ...new Set(alertConfigs?.map((config) => config.clinic_id) || []),
    ];

    for (const clinicId of clinicIds) {
      const clinicConfigs = alertConfigs?.filter((config) => config.clinic_id === clinicId) || [];

      // Get current stock inventory for the clinic
      const { data: inventory, error: inventoryError } = await supabase
        .from('stock_inventory')
        .select(`
          id,
          product_id,
          quantity_available,
          min_stock_level,
          max_stock_level,
          unit_cost,
          products (
            id,
            name,
            expiry_date
          )
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (inventoryError) {
        continue;
      }

      // Process each alert configuration
      for (const config of clinicConfigs) {
        const relevantProducts = inventory?.filter((item) => {
          if (config.product_id) {
            return item.product_id === config.product_id;
          }
          if (config.category_id) {
            // Would need to join with categories - for now include all
            return true;
          }
          return true;
        }) || [];

        // Generate alerts based on type
        for (const product of relevantProducts) {
          const alerts = await generateAlertsForProduct(product, config);
          generatedAlerts.push(...alerts);
        }
      }
    }

    // Insert new alerts (avoiding duplicates)
    if (generatedAlerts.length > 0) {
      // Check for existing active alerts to avoid duplicates
      const _alertKeys = generatedAlerts.map(
        (alert) => `${alert.clinic_id}-${alert.product_id}-${alert.alert_type}`,
      );

      const { data: existingAlerts } = await supabase
        .from('stock_alerts')
        .select('clinic_id, product_id, alert_type')
        .eq('status', 'active')
        .in('clinic_id', [...new Set(generatedAlerts.map((a) => a.clinic_id))]);

      const existingKeys = new Set(
        existingAlerts?.map(
          (alert) => `${alert.clinic_id}-${alert.product_id}-${alert.alert_type}`,
        ) || [],
      );

      // Filter out duplicates
      const newAlerts = generatedAlerts.filter(
        (alert) =>
          !existingKeys.has(
            `${alert.clinic_id}-${alert.product_id}-${alert.alert_type}`,
          ),
      );

      if (newAlerts.length > 0) {
        const { error: insertError } = await supabase
          .from('stock_alerts')
          .insert(newAlerts);

        if (insertError) {
          throw insertError;
        }

        // Queue notifications for new alerts
        for (const alert of newAlerts) {
          const config = alertConfigs?.find(
            (c) => c.id === alert.alert_config_id,
          );
          if (
            config?.notification_channels
            && config.notification_channels.length > 0
          ) {
            notificationQueue.push({
              alert,
              channels: config.notification_channels,
            });
          }
        }
      }
    }

    // Update performance metrics
    await updatePerformanceMetrics(supabase, clinicIds);

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          clinics: clinicIds.length,
          configurations: alertConfigs?.length || 0,
          alerts_generated: generatedAlerts.length,
          notifications_queued: notificationQueue.length,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function generateAlertsForProduct(
  product: any,
  config: AlertConfig,
): Promise<GeneratedAlert[]> {
  const alerts: GeneratedAlert[] = [];
  const productData = product.products || {};

  switch (config.alert_type) {
    case 'low_stock': {
      if (
        config.threshold_unit === 'quantity'
        && product.quantity_available <= config.threshold_value
      ) {
        alerts.push({
          clinic_id: config.clinic_id,
          alert_config_id: config.id,
          product_id: product.product_id,
          alert_type: 'low_stock',
          severity_level: config.severity_level,
          current_value: product.quantity_available,
          threshold_value: config.threshold_value,
          message: `Estoque baixo: ${
            productData.name || 'Produto'
          } com apenas ${product.quantity_available} unidades disponíveis (mínimo: ${config.threshold_value})`,
          status: 'active',
        });
      }
      break;
    }

    case 'expiring': {
      if (productData.expiry_date && config.threshold_unit === 'days') {
        const expiryDate = new Date(productData.expiry_date);
        const today = new Date();
        const daysToExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysToExpiry <= config.threshold_value && daysToExpiry > 0) {
          alerts.push({
            clinic_id: config.clinic_id,
            alert_config_id: config.id,
            product_id: product.product_id,
            alert_type: 'expiring',
            severity_level: config.severity_level,
            current_value: daysToExpiry,
            threshold_value: config.threshold_value,
            message: `Produto próximo ao vencimento: ${
              productData.name || 'Produto'
            } vence em ${daysToExpiry} dias`,
            status: 'active',
          });
        }
      }
      break;
    }

    case 'expired': {
      if (productData.expiry_date) {
        const expiryDate = new Date(productData.expiry_date);
        const today = new Date();

        if (expiryDate < today) {
          const daysExpired = Math.ceil(
            (today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          alerts.push({
            clinic_id: config.clinic_id,
            alert_config_id: config.id,
            product_id: product.product_id,
            alert_type: 'expired',
            severity_level: 'critical',
            current_value: daysExpired,
            threshold_value: 0,
            message: `Produto vencido: ${
              productData.name || 'Produto'
            } venceu há ${daysExpired} dias`,
            status: 'active',
          });
        }
      }
      break;
    }

    case 'overstock': {
      if (
        config.threshold_unit === 'quantity'
        && product.quantity_available >= config.threshold_value
      ) {
        alerts.push({
          clinic_id: config.clinic_id,
          alert_config_id: config.id,
          product_id: product.product_id,
          alert_type: 'overstock',
          severity_level: config.severity_level,
          current_value: product.quantity_available,
          threshold_value: config.threshold_value,
          message: `Excesso de estoque: ${
            productData.name || 'Produto'
          } com ${product.quantity_available} unidades (máximo recomendado: ${config.threshold_value})`,
          status: 'active',
        });
      }
      break;
    }
  }

  return alerts;
}

async function updatePerformanceMetrics(supabase: any, clinicIds: string[]) {
  for (const clinicId of clinicIds) {
    try {
      // Calculate daily metrics
      const today = new Date().toISOString().split('T')[0];

      // Get current inventory value
      const { data: inventory } = await supabase
        .from('stock_inventory')
        .select('quantity_available, unit_cost, min_stock_level')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      if (!inventory || inventory.length === 0) {
        continue;
      }

      const totalValue = inventory.reduce(
        (sum: number, item: any) => sum + item.quantity_available * item.unit_cost,
        0,
      );

      const productsInRange = inventory.filter(
        (item: any) => item.quantity_available >= item.min_stock_level,
      ).length;

      const accuracyPercentage = (productsInRange / inventory.length) * 100;

      // Insert or update daily metrics
      const { error: metricsError } = await supabase
        .from('stock_performance_metrics')
        .upsert(
          {
            clinic_id: clinicId,
            metric_date: today,
            total_value: totalValue,
            turnover_rate: 0, // Would need historical data
            days_coverage: 30, // Default value
            accuracy_percentage: accuracyPercentage,
            waste_value: 0, // Would need waste movement data
            waste_percentage: 0,
          },
          {
            onConflict: 'clinic_id,metric_date',
          },
        );

      if (metricsError) {}
    } catch {}
  }
}

/* To deploy this function:
 * npx supabase functions deploy stock-alerts-processor
 *
 * To schedule this function (add to supabase/functions/_cron/cron.ts):
 * {
 *   name: 'stock-alerts-processor',
 *   cron: '0 * /6 * * *', // Every 6 hours
 *   function: 'stock-alerts-processor'
 * }
 */
