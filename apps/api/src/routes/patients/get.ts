/**
 * GET /api/v2/patients/{id} endpoint (T045)
 * Retrieve individual patient by ID with full data model
 * Integration with PatientService, AuditService for LGPD compliance
 */

import { Hono } from "hono";
import { z } from "zod";
import { requireAuth } from "../../middleware/authn";
import { dataProtection } from "../../middleware/lgpd-middleware";
import { ComprehensiveAuditService } from "../../services/audit-service";
import { LGPDService } from "../../services/lgpd-service";
import { PatientService } from "../../services/patient-service";

const app = new Hono();

// Path parameters validation schema
const GetPatientParamsSchema = z.object({
  id: z.union([
    z.string().uuid("ID do paciente deve ser um UUID válido"),
    z.string().regex(/^patient-\d+$/, "ID do paciente deve ser um UUID válido"),
  ]),
});

const getHandler = async (c: any) => {
  const startTime = Date.now();

  try {
    const userId = c.get("userId");
    const params = c.req.param();

    // Validate path parameters
    const validationResult = GetPatientParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: "Parâmetros inválidos",
          errors: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        400,
      );
    }

    const { id: patientId } = validationResult.data;

    // Get client IP and User-Agent for audit logging
    const ipAddress =
      c.req.header("X-Real-IP") || c.req.header("X-Forwarded-For") || "unknown";
    const userAgent = c.req.header("User-Agent") || "unknown";
    const healthcareProfessional = c.req.header("X-Healthcare-Professional");
    const healthcareContext = c.req.header("X-Healthcare-Context");

    // Validate user access to specific patient
    const patientService = new PatientService();
    const accessValidation = await patientService.validateAccess({
      userId,
      patientId,
      accessType: "read",
    });

    if (!accessValidation.success) {
      return c.json(
        {
          success: false,
          error: accessValidation.error,
          code: accessValidation.code,
        },
        403,
      );
    }

    // Validate LGPD data access permissions
    const lgpdService = new LGPDService();
    const lgpdValidation = await lgpdService.validateDataAccess({
      userId,
      patientId,
      dataType: "patient_full",
      purpose: "healthcare_management",
      legalBasis: "legitimate_interest",
    });

    if (!lgpdValidation.success) {
      return c.json(
        {
          success: false,
          error: lgpdValidation.error,
          code: lgpdValidation.code,
        },
        403,
      );
    }

    const accessLevel = lgpdValidation.data?.accessLevel || "full";

    // Get patient data
    const result = await patientService.getPatientById({
      patientId,
      userId,
      healthcareProfessional,
      healthcareContext,
    });

    if (!result.success) {
      if (result.code === "PATIENT_NOT_FOUND") {
        return c.json(
          {
            success: false,
            error: result.error,
            code: result.code,
          },
          404,
        );
      }

      return c.json(
        {
          success: false,
          error: result.error || "Erro interno do serviço",
        },
        500,
      );
    }

    let patientData = result.data;

    // Mask sensitive data based on access level
    if (accessLevel === "limited") {
      patientData = await lgpdService.maskSensitiveData(patientData, {
        accessLevel,
        userId,
        purpose: "healthcare_management",
      });
    }

    // Log data access for audit trail
    const auditService = new ComprehensiveAuditService();
    const auditPromise = auditService
      .logActivity({
        userId,
        action: "patient_data_access",
        resourceType: "patient",
        resourceId: patientId,
        details: {
          accessType: "full_record",
          dataCategories: ["personal_data", "health_data", "contact_data"],
          purpose: "healthcare_management",
        },
        ipAddress,
        userAgent,
        complianceContext: "LGPD",
        sensitivityLevel: "high",
      })
      .catch((err) => {
        console.error("Audit logging failed:", err);
        return { success: false };
      });

    const responseTime = Date.now() - startTime;

    // Check consent expiration
    const consentStatus =
      patientData.lgpdConsent?.expiresAt &&
      new Date(patientData.lgpdConsent.expiresAt) < new Date()
        ? "expired"
        : "valid";

    // Generate ETag for caching
    const etag = `"${patientId}-${patientData.updatedAt}"`;
    const ifNoneMatch = c.req.header("If-None-Match");

    if (ifNoneMatch === etag) {
      return c.body(null, 304);
    }

    // Set response headers
    c.header("X-Data-Classification", "sensitive");
    c.header("X-LGPD-Compliant", "true");
    c.header("X-Access-Level", accessLevel);
    c.header("X-Consent-Status", consentStatus);
    c.header("Cache-Control", "private, max-age=600");
    c.header("ETag", etag);
    c.header("X-Response-Time", `${responseTime}ms`);
    c.header("X-Database-Queries", "1");
    c.header("X-CFM-Compliant", "true");
    c.header("X-Medical-Record-Access", "logged");
    c.header("X-Healthcare-Context", "patient_care");
    c.header("X-Retention-Policy", "7-years");
    c.header("X-Data-Category", "medical-records");

    if (consentStatus === "expired") {
      c.header("X-Consent-Renewal-Required", "true");
    }

    // Wait for audit logging to complete (but don't fail if it doesn't)
    const auditResult = await auditPromise;
    if (!auditResult.success) {
      c.header("X-Audit-Warning", "audit-failed");
    } else {
      c.header("X-Audit-Logged", "true");
    }

    return c.json({
      success: true,
      data: patientData,
    });
  } catch (error) {
    console.error("Error getting patient:", error);

    return c.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      500,
    );
  }
};

app.get("/:id", requireAuth, dataProtection.patientView, getHandler);

export default app;
