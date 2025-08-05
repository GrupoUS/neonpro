/**
 * Vision Analysis Configuration API
 * GET /api/vision/config
 * PUT /api/vision/config
 *
 * Manages computer vision analysis configuration and user preferences
 * Epic 10 - Story 10.1: Automated Before/After Analysis
 */

import type { NextRequest, NextResponse } from "next/server";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";
import type { withErrorMonitoring } from "@/lib/monitoring";

// Configuration validation schema
const configSchema = z.object({
  // Analysis Settings
  defaultAccuracyThreshold: z.number().min(0.5).max(1.0).default(0.85),
  defaultConfidenceThreshold: z.number().min(0.5).max(1.0).default(0.8),
  maxProcessingTimeMs: z.number().min(1000).max(60000).default(30000),
  enableAutoAnnotations: z.boolean().default(true),
  enableQualityControl: z.boolean().default(true),

  // Image Processing
  imageResolution: z.enum(["low", "medium", "high", "ultra"]).default("high"),
  compressionQuality: z.number().min(0.1).max(1.0).default(0.9),
  enableImageEnhancement: z.boolean().default(true),
  enableNoiseReduction: z.boolean().default(true),

  // Analysis Features
  enableChangeDetection: z.boolean().default(true),
  enableColorAnalysis: z.boolean().default(true),
  enableTextureAnalysis: z.boolean().default(true),
  enableSymmetryAnalysis: z.boolean().default(false),
  enableVolumeEstimation: z.boolean().default(false),

  // Notification Settings
  notifyOnCompletion: z.boolean().default(true),
  notifyOnErrors: z.boolean().default(true),
  notifyOnQualityIssues: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),

  // Export Settings
  defaultExportFormat: z.enum(["pdf", "excel", "json", "csv"]).default("pdf"),
  includeImagesInExport: z.boolean().default(true),
  includeAnnotationsInExport: z.boolean().default(true),
  includeMetricsInExport: z.boolean().default(true),

  // Privacy Settings
  allowDataSharing: z.boolean().default(false),
  anonymizeExports: z.boolean().default(true),
  retentionPeriodDays: z.number().min(30).max(2555).default(365), // 7 years max

  // Advanced Settings
  modelVersion: z.string().default("v1.0"),
  enableExperimentalFeatures: z.boolean().default(false),
  debugMode: z.boolean().default(false),
  customThresholds: z.record(z.string(), z.number()).optional(),

  // UI Preferences
  defaultView: z.enum(["grid", "list", "timeline"]).default("grid"),
  showAdvancedMetrics: z.boolean().default(false),
  autoRefreshResults: z.boolean().default(true),
  resultsPerPage: z.number().min(10).max(100).default(20),
});

// GET - Retrieve user configuration
export const GET = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get user configuration
    const { data: config, error: configError } = await supabase
      .from("vision_analysis_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (configError && configError.code !== "PGRST116") {
      // Not found is OK
      throw configError;
    }

    // Return configuration or defaults
    const defaultConfig = configSchema.parse({});
    const userConfig = config ? { ...defaultConfig, ...config.settings } : defaultConfig;

    // Get system limits and capabilities
    const systemInfo = {
      supportedFormats: ["jpg", "jpeg", "png", "webp"],
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxResolution: { width: 4096, height: 4096 },
      availableModels: ["v1.0", "v1.1-beta"],
      supportedLanguages: ["pt-BR", "en-US", "es-ES"],
      features: {
        changeDetection: true,
        colorAnalysis: true,
        textureAnalysis: true,
        symmetryAnalysis: true,
        volumeEstimation: false, // Coming soon
        realTimeAnalysis: false, // Coming soon
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        config: userConfig,
        systemInfo,
        lastUpdated: config?.updated_at || null,
      },
    });
  } catch (error) {
    console.error("Vision config retrieval error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

// PUT - Update user configuration
export const PUT = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedConfig = configSchema.parse(body);

    // Validate business rules
    if (validatedConfig.defaultAccuracyThreshold > validatedConfig.defaultConfidenceThreshold) {
      return NextResponse.json(
        { error: "Limite de precisão não pode ser maior que limite de confiança" },
        { status: 400 },
      );
    }

    if (validatedConfig.retentionPeriodDays < 30) {
      return NextResponse.json(
        { error: "Período de retenção mínimo é de 30 dias" },
        { status: 400 },
      );
    }

    // Check if configuration exists
    const { data: existingConfig } = await supabase
      .from("vision_analysis_config")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;
    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabase
        .from("vision_analysis_config")
        .update({
          settings: validatedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new configuration
      const { data, error } = await supabase
        .from("vision_analysis_config")
        .insert({
          user_id: user.id,
          settings: validatedConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Log configuration change
    await supabase.from("analysis_activity_log").insert({
      user_id: user.id,
      activity_type: "config_updated",
      activity_details: {
        changedSettings: Object.keys(validatedConfig),
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        config: result.settings,
        lastUpdated: result.updated_at,
      },
      message: "Configuração atualizada com sucesso",
    });
  } catch (error) {
    console.error("Vision config update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados de configuração inválidos",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});

// POST - Reset configuration to defaults
export const POST = withErrorMonitoring(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "reset") {
      // Reset to default configuration
      const defaultConfig = configSchema.parse({});

      const { data, error } = await supabase
        .from("vision_analysis_config")
        .upsert({
          user_id: user.id,
          settings: defaultConfig,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log reset activity
      await supabase.from("analysis_activity_log").insert({
        user_id: user.id,
        activity_type: "config_reset",
        activity_details: {
          resetToDefaults: true,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        data: {
          config: data.settings,
          lastUpdated: data.updated_at,
        },
        message: "Configuração restaurada para os padrões",
      });
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 });
  } catch (error) {
    console.error("Vision config reset error:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
});
