/**
 * ANVISA Compliance Module for Brazilian Healthcare Regulation
 * Main class that combines all ANVISA compliance functionality
 */

import { createClient } from "@supabase/supabase-js";
import { ANVISAAdverseEventManager } from "./anvisa-adverse-events";
import { ANVISAProcedureManager } from "./anvisa-procedures";
import { ANVISAProductManager } from "./anvisa-products";
import { ANVISAComplianceReporter } from "./anvisa-reporting";

export class ANVISACompliance {
  private readonly productManager: ANVISAProductManager;
  private readonly procedureManager: ANVISAProcedureManager;
  private readonly adverseEventManager: ANVISAAdverseEventManager;
  private readonly complianceReporter: ANVISAComplianceReporter;

  constructor() {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL
      || !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    this.productManager = new ANVISAProductManager(supabase);
    this.procedureManager = new ANVISAProcedureManager(supabase);
    this.adverseEventManager = new ANVISAAdverseEventManager(supabase);
    this.complianceReporter = new ANVISAComplianceReporter(supabase);
  }

  // Product Management
  registerProduct(data: unknown) {
    return this.productManager.registerProduct(data as unknown);
  }
  validateProductCompliance(data: unknown) {
    return this.productManager.validateProductCompliance(data as string);
  }
  getExpiringSoonProducts() {
    return this.productManager.getExpiringSoonProducts();
  }
  getProductByRegistration(reg: string) {
    return this.productManager.getProductByRegistration(reg);
  }
  validateANVISARegistrationNumber(reg: string) {
    return this.productManager.validateANVISARegistrationNumber(reg);
  }

  // Procedure Management
  classifyProcedure(data: unknown) {
    return this.procedureManager.classifyProcedure(data as unknown);
  }
  validateProcedureQualifications(
    procedureId: string,
    professionalQualifications: string[],
  ) {
    return this.procedureManager.validateProcedureQualifications(
      procedureId,
      professionalQualifications,
    );
  }

  // Adverse Event Management
  reportAdverseEvent(data: unknown) {
    return this.adverseEventManager.reportAdverseEvent(data as unknown);
  }
  getPendingANVISAReports() {
    return this.adverseEventManager.getPendingANVISAReports();
  }

  // Compliance Reporting
  generateComplianceReport(startDate: Date, endDate: Date) {
    return this.complianceReporter.generateComplianceReport(startDate, endDate);
  }
}

// Re-export types for convenience
export type {
  AdverseEvent,
  ANVISAProcedure,
  ANVISAProduct,
  ComplianceReport,
  ComplianceTask,
} from "./anvisa-types";
