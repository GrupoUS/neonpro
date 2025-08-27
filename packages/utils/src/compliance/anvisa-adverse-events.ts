/**
 * ANVISA Adverse Event Reporting Module
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdverseEvent, ComplianceTask } from "./anvisa-types";

const HOURS_TO_MILLISECONDS = 1000;
const MINUTES_TO_MILLISECONDS = 60;
const HOURS_IN_DAY = 24;
const ANVISA_REPORT_DEADLINE_HOURS = 24;

export class ANVISAAdverseEventManager {
  constructor(private readonly supabase: SupabaseClient) {}

  async reportAdverseEvent(
    event: Omit<AdverseEvent, "id" | "created_at">,
  ): Promise<AdverseEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from("adverse_events")
        .insert(event)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Auto-determine if ANVISA reporting is required
      const requiresANVISAReport = this.requiresANVISAReporting(
        event.event_type,
        event.outcome,
      );

      if (requiresANVISAReport && !event.anvisa_reported) {
        await this.scheduleANVISAReport(data.id);
      }

      // Log compliance action
      await this.logComplianceAction(
        "adverse_event_report",
        `Event: ${event.description}`,
        data.id,
      );

      return data;
    } catch {
      return;
    }
  }

  async getPendingANVISAReports(): Promise<ComplianceTask[]> {
    try {
      const { data } = await this.supabase
        .from("compliance_tasks")
        .select(
          `
          *,
          adverse_events:reference_id (
            id,
            description,
            event_type,
            outcome,
            reported_date
          )
        `,
        )
        .eq("type", "anvisa_adverse_event_report")
        .eq("status", "pending");

      return data || [];
    } catch {
      return [];
    }
  }

  private requiresANVISAReporting(
    eventType: AdverseEvent["event_type"],
    outcome: AdverseEvent["outcome"],
  ): boolean {
    // Severe or life-threatening events always require reporting
    if (eventType === "severe" || eventType === "life_threatening") {
      return true;
    }

    // Permanent damage or death always requires reporting
    if (outcome === "permanent_damage" || outcome === "death") {
      return true;
    }

    return false;
  }

  private async scheduleANVISAReport(eventId: string): Promise<void> {
    // In a real implementation, this would integrate with ANVISA's reporting system
    // For now, we'll create a task for manual reporting
    try {
      const dueDate = new Date(
        Date.now() +
          ANVISA_REPORT_DEADLINE_HOURS *
            MINUTES_TO_MILLISECONDS *
            MINUTES_TO_MILLISECONDS *
            HOURS_TO_MILLISECONDS,
      );

      await this.supabase.from("compliance_tasks").insert({
        description: "Submit adverse event report to ANVISA within 72 hours",
        due_date: dueDate,
        reference_id: eventId,
        status: "pending",
        type: "anvisa_adverse_event_report",
      });
    } catch {
      // Silently fail on task creation errors
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
