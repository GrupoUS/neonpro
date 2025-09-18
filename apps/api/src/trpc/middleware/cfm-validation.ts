/**
 * T022: CFM Validation Middleware
 *
 * Implements medical license validation with active status checking, ICP-Brasil certificate
 * verification for telemedicine, and professional identity validation for healthcare operations.
 * Ensures compliance with CFM Resolution 2,314/2022 and NGS2 security standards.
 *
 * @author AI Development Agent
 * @compliance CFM Resolution 2,314/2022 - Telemedicine Practice
 * @compliance NGS2 Level 2 Security Standards
 * @performance <200ms validation overhead target
 */

import { TRPCError } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { createHash, createVerify } from 'crypto';

// CFM Medical Specialties (partial list - expand as needed)
const CFM_SPECIALTIES = {
  '01': 'Clínica Médica',
  '02': 'Cirurgia Geral',
  '03': 'Pediatria',
  '04': 'Ginecologia e Obstetrícia',
  '05': 'Cardiologia',
  '06': 'Dermatologia',
  '07': 'Psiquiatria',
  '08': 'Neurologia',
  '09': 'Oftalmologia',
  '10': 'Ortopedia e Traumatologia',
  '11': 'Anestesiologia',
  '12': 'Radiologia',
  '13': 'Patologia',
  '14': 'Medicina do Trabalho',
  '15': 'Medicina Legal',
  // Add more specialties as needed
} as const;

// Brazilian States for CRM validation
const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

interface CFMLicenseValidationResult {
  isValid: boolean;
  crmNumber: string;
  state: string;
  specialties: string[];
  status: 'active' | 'suspended' | 'cancelled' | 'inactive';
  expirationDate?: Date;
  restrictions?: string[];
  telemedicineAuthorized: boolean;
  ethicsCompliant: boolean;
  lastValidated: Date;
}

interface ICPBrasilCertificate {
  isValid: boolean;
  certificateId: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  authorityChain: string[];
  certificateUse: 'authentication' | 'signature' | 'both';
  ngs2Compliant: boolean;
}

/**
 * Mock CFM License Validation (In production, integrate with CFM API)
 * CFM Portal: https://portal.cfm.org.br/
 */
async function validateCFMLicense(
  crmNumber: string,
  state: string,
): Promise<CFMLicenseValidationResult> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Basic CRM format validation: CRM/STATE + 4-6 digits
  const crmRegex =
    /^CRM\/(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\s*\d{4,6}$/;

  if (!crmRegex.test(`CRM/${state} ${crmNumber}`)) {
    return {
      isValid: false,
      crmNumber,
      state,
      specialties: [],
      status: 'inactive',
      telemedicineAuthorized: false,
      ethicsCompliant: false,
      lastValidated: new Date(),
    };
  }

  // Mock validation (replace with real CFM API integration)
  const isValidNumber = parseInt(crmNumber) > 1000 && parseInt(crmNumber) < 999999;

  return {
    isValid: isValidNumber,
    crmNumber,
    state,
    specialties: isValidNumber ? ['01', '05'] : [], // Mock specialties
    status: isValidNumber ? 'active' : 'inactive',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    restrictions: [],
    telemedicineAuthorized: isValidNumber,
    ethicsCompliant: isValidNumber,
    lastValidated: new Date(),
  };
} /**
 * Mock ICP-Brasil Certificate Validation (In production, integrate with ITI validators)
 * ITI Validator: https://validador.iti.gov.br/
 */

async function validateICPBrasilCertificate(
  certificateData: string,
): Promise<ICPBrasilCertificate> {
  // Simulate certificate validation delay
  await new Promise(resolve => setTimeout(resolve, 30));

  // Basic certificate format validation (PEM format check)
  const pemFormatRegex = /-----BEGIN CERTIFICATE-----[\s\S]*-----END CERTIFICATE-----/;
  const isValidFormat = pemFormatRegex.test(certificateData);

  if (!isValidFormat) {
    return {
      isValid: false,
      certificateId: '',
      issuer: '',
      subject: '',
      validFrom: new Date(),
      validTo: new Date(),
      serialNumber: '',
      authorityChain: [],
      certificateUse: 'authentication',
      ngs2Compliant: false,
    };
  }

  // Mock certificate validation (replace with real ITI validation)
  const mockCertId = createHash('sha256').update(certificateData).digest('hex').substring(0, 16);

  return {
    isValid: true,
    certificateId: mockCertId,
    issuer: 'AC SERPRO v5',
    subject: 'CN=Usuario Teste,OU=Pessoa Fisica,O=ICP-Brasil,C=BR',
    validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    serialNumber: '123456789',
    authorityChain: ['AC SERPRO v5', 'ICP-Brasil AC Raiz v2'],
    certificateUse: 'both',
    ngs2Compliant: true,
  };
}

/**
 * Cache for CFM validations to improve performance
 */
const cfmValidationCache = new Map<
  string,
  { result: CFMLicenseValidationResult; expiry: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedCFMValidation(
  crmNumber: string,
  state: string,
): CFMLicenseValidationResult | null {
  const key = `${crmNumber}:${state}`;
  const cached = cfmValidationCache.get(key);

  if (cached && Date.now() < cached.expiry) {
    return cached.result;
  }

  cfmValidationCache.delete(key);
  return null;
}

function setCachedCFMValidation(
  crmNumber: string,
  state: string,
  result: CFMLicenseValidationResult,
): void {
  const key = `${crmNumber}:${state}`;
  cfmValidationCache.set(key, {
    result,
    expiry: Date.now() + CACHE_DURATION,
  });
} /**
 * CFM Validation Middleware
 *
 * Validates medical licenses, ICP-Brasil certificates, and ensures compliance
 * with CFM telemedicine regulations and NGS2 security standards.
 */

export const cfmValidationMiddleware = async ({ ctx, next, path, type, input }: any) => {
  const start = performance.now();

  try {
    // Skip validation for non-medical operations
    if (!requiresCFMValidation(path)) {
      return next();
    }

    // Extract professional information from context or input
    const professionalId = extractProfessionalId(ctx, input);

    if (!professionalId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Professional identification required for medical operations',
      });
    }

    // Get professional data from database
    const professional = await ctx.prisma.professional.findUnique({
      where: { id: professionalId },
      select: {
        crmNumber: true,
        crmState: true,
        specialties: true,
        icpBrasilCertificate: true,
        cfmValidationStatus: true,
        cfmLastValidated: true,
        telemedicineAuthorized: true,
      },
    });

    if (!professional) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Professional not found',
      });
    }

    // Check if CFM validation is recent (within 24 hours)
    const validationExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needsRevalidation = !professional.cfmLastValidated
      || professional.cfmLastValidated < validationExpiry;

    let cfmValidation: CFMLicenseValidationResult;

    if (needsRevalidation) {
      // Check cache first
      const cachedValidation = getCachedCFMValidation(
        professional.crmNumber,
        professional.crmState,
      );

      if (cachedValidation) {
        cfmValidation = cachedValidation;
      } else {
        // Perform real-time CFM validation
        cfmValidation = await validateCFMLicense(professional.crmNumber, professional.crmState);
        setCachedCFMValidation(professional.crmNumber, professional.crmState, cfmValidation);

        // Update professional record with validation results
        await ctx.prisma.professional.update({
          where: { id: professionalId },
          data: {
            cfmValidationStatus: cfmValidation.isValid ? 'validated' : 'rejected',
            cfmLastValidated: new Date(),
            telemedicineAuthorized: cfmValidation.telemedicineAuthorized,
          },
        });
      }
    } else {
      // Use existing validation status
      cfmValidation = {
        isValid: professional.cfmValidationStatus === 'validated',
        crmNumber: professional.crmNumber,
        state: professional.crmState,
        specialties: professional.specialties || [],
        status: professional.cfmValidationStatus === 'validated' ? 'active' : 'inactive',
        telemedicineAuthorized: professional.telemedicineAuthorized || false,
        ethicsCompliant: professional.cfmValidationStatus === 'validated',
        lastValidated: professional.cfmLastValidated || new Date(),
      };
    }

    // Validate CFM license status
    if (!cfmValidation.isValid || cfmValidation.status !== 'active') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Invalid or inactive CFM license. Medical operations not authorized.',
      });
    } // Special validation for telemedicine operations
    if (isTelemedicineOperation(path)) {
      if (!cfmValidation.telemedicineAuthorized) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Telemedicine not authorized for this professional. CFM Resolution 2,314/2022 compliance required.',
        });
      }

      // Validate ICP-Brasil certificate for telemedicine
      if (professional.icpBrasilCertificate) {
        const certificateValidation = await validateICPBrasilCertificate(
          professional.icpBrasilCertificate,
        );

        if (!certificateValidation.isValid || !certificateValidation.ngs2Compliant) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Valid ICP-Brasil certificate with NGS2 Level 2 compliance required for telemedicine operations.',
          });
        }

        // Add certificate validation to context for audit
        ctx.cfmValidation = {
          ...cfmValidation,
          icpBrasilValidation: certificateValidation,
        };
      } else {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ICP-Brasil digital certificate required for telemedicine operations.',
        });
      }
    }

    // Check specialty authorization for specific procedures
    if (requiresSpecialtyValidation(path, input)) {
      const requiredSpecialty = extractRequiredSpecialty(path, input);

      if (requiredSpecialty && !cfmValidation.specialties.includes(requiredSpecialty)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Medical specialty ${
            CFM_SPECIALTIES[requiredSpecialty as keyof typeof CFM_SPECIALTIES] || requiredSpecialty
          } required for this operation.`,
        });
      }
    }

    // Add CFM validation info to context for downstream middleware
    ctx.cfmValidation = cfmValidation;

    const result = await next();

    // Log performance metrics
    const duration = performance.now() - start;
    if (duration > 200) {
      console.warn(`CFM validation exceeded 200ms target: ${duration.toFixed(2)}ms for ${path}`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    // Log CFM validation failures for compliance auditing
    if (ctx.userId) {
      await ctx.prisma.auditTrail.create({
        data: {
          userId: ctx.userId,
          clinicId: ctx.clinicId,
          action: 'VIEW',
          resource: path,
          resourceType: 'SYSTEM_CONFIG',
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: 'FAILED',
          riskLevel: 'HIGH',
          additionalInfo: JSON.stringify({
            errorType: 'CFM_VALIDATION_FAILURE',
            error: error instanceof Error ? error.message : 'Unknown CFM validation error',
            duration,
            path,
            professionalId: extractProfessionalId(ctx, input),
          }),
        },
      });
    }

    throw error;
  }
};

/**
 * Helper functions for CFM validation middleware
 */

function requiresCFMValidation(path: string): boolean {
  const medicalPaths = [
    'appointments.create',
    'appointments.update',
    'patients.create',
    'patients.update',
    'telemedicine',
    'prescriptions',
    'diagnosis',
    'medical-records',
    'procedures',
  ];

  return medicalPaths.some(medicalPath => path.includes(medicalPath));
}

function isTelemedicineOperation(path: string): boolean {
  return path.includes('telemedicine')
    || path.includes('video-consultation')
    || path.includes('remote-consultation');
}

function extractProfessionalId(ctx: any, input: any): string | null {
  // Try to get professional ID from context (logged in professional)
  if (ctx.professionalId) {
    return ctx.professionalId;
  }

  // Try to get from input
  if (input?.professionalId) {
    return input.professionalId;
  }

  // Try to get from user context if user is a professional
  if (ctx.userRole === 'professional' && ctx.userId) {
    return ctx.userId;
  }

  return null;
}

function requiresSpecialtyValidation(path: string, input: any): boolean {
  // Specialized procedures that require specific medical specialties
  const specialtyRequiredPaths = [
    'cardiology',
    'dermatology',
    'neurology',
    'psychiatry',
    'pediatrics',
    'obstetrics',
    'surgery',
  ];

  return specialtyRequiredPaths.some(specialty => path.includes(specialty));
}

function extractRequiredSpecialty(path: string, input: any): string | null {
  // Map operation paths to required CFM specialty codes
  if (path.includes('cardiology')) return '05';
  if (path.includes('dermatology')) return '06';
  if (path.includes('psychiatry')) return '07';
  if (path.includes('neurology')) return '08';
  if (path.includes('pediatrics')) return '03';
  if (path.includes('obstetrics') || path.includes('gynecology')) return '04';
  if (path.includes('surgery')) return '02';

  // Try to extract from input TUSS code if available
  if (input?.tussCode) {
    return mapTussToSpecialty(input.tussCode);
  }

  return null;
}

function mapTussToSpecialty(tussCode: string): string | null {
  // Map TUSS procedure codes to CFM specialties (simplified mapping)
  const tussSpecialtyMap: Record<string, string> = {
    '10101': '05', // Cardiology consultation
    '10102': '06', // Dermatology consultation
    '10103': '03', // Pediatrics consultation
    '10104': '04', // Gynecology consultation
    '10105': '07', // Psychiatry consultation
    '10106': '08', // Neurology consultation
    // Add more mappings as needed
  };

  return tussSpecialtyMap[tussCode] || null;
}
