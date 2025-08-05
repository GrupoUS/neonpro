/**
 * API Endpoints para Jobs de Backup
 * Story 1.8: Sistema de Backup e Recovery
 */

import type { NextRequest, NextResponse } from "next/server";
import type { BackupManager } from "@/lib/backup/backup-manager";
import type { createClient } from "@/lib/supabase/server";
import type { z } from "zod";

// Initialize BackupManager only if Supabase is configured
let backupManager: BackupManager | null = null;
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    backupManager = new BackupManager();
  }
} catch (error) {
  console.warn("BackupManager initialization failed:", error);
}

// Schema para iniciar backup manual
const startBackupSchema = z.object({
  config_id: z.string().uuid("ID de configuração inválido"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  description: z.string().optional(),
});

/**
 * GET /api/backup/jobs
 * Lista jobs de backup
 */
export async function GET(request: NextRequest) {
  try {
    if (!backupManager) {
      return NextResponse.json({ error: "Backup service not configured" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const config_id = searchParams.get("config_id");

    const filters = {
      ...(status && { status }),
      ...(type && { type }),
      ...(config_id && { config_id }),
    };

    const result = await backupManager.getBackupJobs({
      pagination: { page, limit },
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar jobs de backup:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

/**
 * POST /api/backup/jobs
 * Inicia backup manual
 */
export async function POST(request: NextRequest) {
  try {
    if (!backupManager) {
      return NextResponse.json({ error: "Backup service not configured" }, { status: 503 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = startBackupSchema.parse(body);

    const result = await backupManager.startBackup({
      ...validatedData,
      initiated_by: user.id,
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    console.error("Erro ao iniciar backup:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
