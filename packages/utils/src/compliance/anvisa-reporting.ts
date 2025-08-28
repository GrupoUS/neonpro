/**
 * ANVISA Compliance Reporting Module
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdverseEvent,
  ANVISAProcedure,
  ANVISAProduct,
  ComplianceReport,
  ComplianceTask,
} from "./anvisa-types";

const MIN_SCORE = 0;
const MAX_SCORE = 100;
const INITIAL_SCORE = 100;
const EXPIRED_PRODUCT_PENALTY = 5;
const SUSPENDED_PRODUCT_PENALTY = 10;
const OVERDUE_REPORT_PENALTY = 15;

export class ANVISAComplianceReporter {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceReport | null> {
    try {
      const [products, procedures, events] = await Promise.all([
        this.getProductsInPeriod(startDate, endDate),
        this.getProceduresInPeriod(startDate, endDate),
        this.getEventsInPeriod(startDate, endDate),
      ]);

      const expiringSoon = await this.getExpiringSoonProducts();
      const pendingReports = await this.getPendingANVISAReports();

      const productData = products.data || [];
      const procedureData = procedures.data || [];
      const eventData = events.data || [];

      return {
        adverse_events: this.buildAdverseEventsReport(
          eventData,
          pendingReports,
        ),
        compliance_score: this.calculateComplianceScore(
          productData,
          pendingReports,
        ),
        period: {
          end: endDate,
          start: startDate,
        },
        procedures: this.buildProceduresReport(procedureData),
        products: this.buildProductsReport(productData, expiringSoon),
      };
    } catch {
      return null;
    }
  }

  private async getProductsInPeriod(startDate: Date, endDate: Date) {
    return this.supabase
      .from("anvisa_products")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  }

  private async getProceduresInPeriod(startDate: Date, endDate: Date) {
    return this.supabase
      .from("anvisa_procedures")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  }

  private async getEventsInPeriod(startDate: Date, endDate: Date) {
    return this.supabase
      .from("adverse_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());
  }

  private async getExpiringSoonProducts(): Promise<ANVISAProduct[]> {
    try {
      const futureDate = new Date();
      const DEFAULT_EXPIRY_DAYS = 30;
      futureDate.setDate(futureDate.getDate() + DEFAULT_EXPIRY_DAYS);

      const { data } = await this.supabase
        .from("anvisa_products")
        .select("*")
        .lte("expiry_date", futureDate.toISOString())
        .gte("expiry_date", new Date().toISOString())
        .eq("regulatory_status", "approved");

      return data || [];
    } catch {
      return [];
    }
  }

  private async getPendingANVISAReports(): Promise<ComplianceTask[]> {
    try {
      const { data } = await this.supabase
        .from("compliance_tasks")
        .select("*")
        .eq("type", "anvisa_adverse_event_report")
        .eq("status", "pending");

      return data || [];
    } catch {
      return [];
    }
  }

  private buildProductsReport(
    productData: ANVISAProduct[],
    expiringSoon: ANVISAProduct[],
  ) {
    const ZERO_FALLBACK = 0;

    return {
      approved: this.countByStatus(productData, "approved"),
      expiring_soon: expiringSoon.length || ZERO_FALLBACK,
      suspended: this.countByStatus(productData, "suspended"),
      total: productData.length || ZERO_FALLBACK,
    };
  }

  private buildProceduresReport(procedureData: ANVISAProcedure[]) {
    const ZERO_FALLBACK = 0;

    return {
      by_risk: {
        high_risk: this.countByClassification(procedureData, "high_risk"),
        low_risk: this.countByClassification(procedureData, "low_risk"),
        medium_risk: this.countByClassification(procedureData, "medium_risk"),
        surgical: this.countByClassification(procedureData, "surgical"),
      },
      total: procedureData.length || ZERO_FALLBACK,
    };
  }

  private buildAdverseEventsReport(
    eventData: AdverseEvent[],
    pendingReports: ComplianceTask[],
  ) {
    const ZERO_FALLBACK = 0;

    return {
      by_severity: {
        life_threatening: this.countByEventType(eventData, "life_threatening"),
        mild: this.countByEventType(eventData, "mild"),
        moderate: this.countByEventType(eventData, "moderate"),
        severe: this.countByEventType(eventData, "severe"),
      },
      pending_anvisa_reports: pendingReports.length || ZERO_FALLBACK,
      total: eventData.length || ZERO_FALLBACK,
    };
  }

  private countByStatus(
    products: ANVISAProduct[],
    status: ANVISAProduct["regulatory_status"],
  ): number {
    const ZERO_FALLBACK = 0;
    return (
      products.filter((product) => product.regulatory_status === status)
        .length || ZERO_FALLBACK
    );
  }

  private countByClassification(
    procedures: ANVISAProcedure[],
    classification: ANVISAProcedure["classification"],
  ): number {
    const ZERO_FALLBACK = 0;
    return (
      procedures.filter(
        (procedure) => procedure.classification === classification,
      ).length || ZERO_FALLBACK
    );
  }

  private countByEventType(
    events: AdverseEvent[],
    eventType: AdverseEvent["event_type"],
  ): number {
    const ZERO_FALLBACK = 0;
    return (
      events.filter((event) => event.event_type === eventType).length ||
      ZERO_FALLBACK
    );
  }

  private calculateComplianceScore(
    products: ANVISAProduct[],
    pendingReports: ComplianceTask[],
  ): number {
    let score = INITIAL_SCORE;
    const ZERO_FALLBACK = 0;

    // Deduct points for compliance issues
    const expiredProducts =
      products.filter((product) => new Date(product.expiry_date) < new Date())
        .length || ZERO_FALLBACK;
    const suspendedProducts =
      products.filter((product) => product.regulatory_status === "suspended")
        .length || ZERO_FALLBACK;
    const overduePendingReports =
      pendingReports.filter((report) => new Date(report.due_date) < new Date())
        .length || ZERO_FALLBACK;

    score -= expiredProducts * EXPIRED_PRODUCT_PENALTY;
    score -= suspendedProducts * SUSPENDED_PRODUCT_PENALTY;
    score -= overduePendingReports * OVERDUE_REPORT_PENALTY;

    return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
  }
}
