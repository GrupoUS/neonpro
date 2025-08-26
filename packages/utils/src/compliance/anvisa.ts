/**
 * ANVISA Compliance Module for Brazilian Healthcare Regulation
 * Main class that combines all ANVISA compliance functionality
 */

import { createClient } from "@supabase/supabase-js";
import { ANVISAAdverseEventManager } from "./anvisa-adverse-events";
import { ANVISAComplianceReporter } from "./anvisa-reporting";
import { ANVISAProductManager } from "./anvisa-products";
import { ANVISAProcedureManager } from "./anvisa-procedures";

export class ANVISACompliance {
  private readonly productManager: ANVISAProductManager;
  private readonly procedureManager: ANVISAProcedureManager;
  private readonly adverseEventManager: ANVISAAdverseEventManager;
  private readonly complianceReporter: ANVISAComplianceReporter;

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
  registerProduct = this.productManager.registerProduct.bind(this.productManager);
  validateProductCompliance = this.productManager.validateProductCompliance.bind(this.productManager);
  getExpiringSoonProducts = this.productManager.getExpiringSoonProducts.bind(this.productManager);
  getProductByRegistration = this.productManager.getProductByRegistration.bind(this.productManager);
  validateANVISARegistrationNumber = this.productManager.validateANVISARegistrationNumber.bind(this.productManager);

  // Procedure Management
  classifyProcedure = this.procedureManager.classifyProcedure.bind(this.procedureManager);
  validateProcedureQualifications = this.procedureManager.validateProcedureQualifications.bind(this.procedureManager);

  // Adverse Event Management
  reportAdverseEvent = this.adverseEventManager.reportAdverseEvent.bind(this.adverseEventManager);
  getPendingANVISAReports = this.adverseEventManager.getPendingANVISAReports.bind(this.adverseEventManager);

  // Compliance Reporting
  generateComplianceReport = this.complianceReporter.generateComplianceReport.bind(this.complianceReporter);
}

// Re-export types for convenience
export type {
  ANVISAProduct,
  ANVISAProcedure,
  AdverseEvent,
  ComplianceTask,
  ComplianceReport,
} from "./anvisa-types";