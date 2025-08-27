/**
 * ANVISA Procedure Management Module
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ANVISAProcedure } from "./anvisa-types";

export class ANVISAProcedureManager {
  constructor(private readonly supabase: SupabaseClient) {}

  async classifyProcedure(
    procedure: Omit<ANVISAProcedure, "id" | "created_at" | "updated_at">,
  ): Promise<ANVISAProcedure | null> {
    try {
      const { data, error } = await this.supabase
        .from("anvisa_procedures")
        .insert(procedure)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log compliance action
      await this.logComplianceAction(
        "procedure_classification",
        procedure.name,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

  async validateProcedureQualifications(
    procedureId: string,
    professionalQualifications: string[],
  ): Promise<boolean> {
    try {
      const { data: procedure } = await this.supabase
        .from("anvisa_procedures")
        .select("required_qualifications")
        .eq("id", procedureId)
        .single();

      if (!procedure) {
        return false;
      }

      // Check if professional has all required qualifications
      return procedure.required_qualifications.every((requirement: string) =>
        professionalQualifications.includes(requirement)
      );
    } catch {
      return false;
    }
  }

  private async logComplianceAction(
    action: string,
    description: string,
    referenceId: string,
  ): Promise<void> {
    try {
      await this.supabase.from("compliance_logs").insert({
        action,
        description,
        module: "anvisa",
        reference_id: referenceId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silently fail on logging errors
    }
  }
}
