#!/usr/bin/env tsx

/**
 * 🧪 Test Script for NeonPro Background Jobs
 *
 * Valida se os jobs do Trigger.dev estão funcionando corretamente
 * antes do deployment no Vercel.
 *
 * Usage: npx tsx scripts/test-automation.ts
 */

import { createClient } from "@/app/utils/supabase/server";
import { NeonProAutomation } from "@/lib/automation/trigger-jobs";

async function testEmailAutomation() {
  try {
    // Test data (usando dados fake para teste)
    const testAppointmentData = {
      appointmentId: "test-appointment-001",
      patientEmail: "paciente.teste@example.com",
      patientName: "Maria Silva",
      clinicName: "Clínica NeonPro",
      clinicId: "clinic-001",
      appointmentDate: "2025-01-23",
      appointmentTime: "14:00",
      professionalName: "Dr. João Santos",
      serviceName: "Consulta Geral",
    };

    // Teste apenas em desenvolvimento ou com flag especial
    if (
      process.env.NODE_ENV === "development"
      && process.env.ENABLE_TEST_JOBS === "true"
    ) {} else {
    }

    // Verifica se as variáveis de ambiente estão definidas
    const requiredEnvVars = [
      "TRIGGER_SECRET_KEY",
      "TRIGGER_PROJECT_ID",
      "RESEND_API_KEY",
    ];

    const missingVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar],
    );

    if (missingVars.length > 0) {
    } else {
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("appointments")
        .select("count")
        .limit(1);

      if (error) {
      } else {
      }
    } catch (_supabaseError) {}

    const deploymentChecks = [
      { name: "Trigger.dev config", status: existsFile("trigger.config.ts") },
      {
        name: "Job definitions",
        status: existsFile("trigger/jobs/appointment-emails.ts"),
      },
      { name: "API route", status: existsFile("app/api/trigger/route.ts") },
      {
        name: "Integration utils",
        status: existsFile("lib/automation/trigger-jobs.ts"),
      },
      {
        name: "Enhanced API",
        status: existsFile("app/api/appointments/enhanced/route.ts"),
      },
    ];

    deploymentChecks.forEach((_check) => {});

    const allChecksPass = deploymentChecks.every((check) => check.status);

    if (allChecksPass) {
    } else {
    }
  } catch (_error) {
    process.exit(1);
  }
}

function existsFile(relativePath: string): boolean {
  try {
    const fs = require("node:fs");
    const path = require("node:path");
    return fs.existsSync(path.join(process.cwd(), relativePath));
  } catch {
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  testEmailAutomation().catch(console.error);
}

export { testEmailAutomation };
