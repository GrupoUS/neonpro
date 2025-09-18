/**
 * Centralized database exports for monorepo sharing
 * Healthcare-optimized database utilities and services
 */

// Core database clients
export {
  checkDatabaseHealth,
  closeDatabaseConnections,
  prisma,
  supabase,
  supabaseBrowser,
} from './client.js';

// Import prisma for internal use
import { prisma } from './client.js';

// Base service class and utilities
export type { AuditLogData } from './services/base.service';
export { BaseService } from './services/base.service.js';

// LGPD Consent and Audit Services
export { ConsentService, AuditService } from './services/index.js';
export type { 
  ConsentRequest, 
  ConsentRecord, 
  AuditLogRequest, 
  ComplianceCheck 
} from './services/index.js';

// Re-export Prisma types for type sharing across packages
export type {
  Appointment,
  AuditTrail,
  Clinic,
  ConsentRecord,
  Patient,
  Professional,
  User,
} from '@prisma/client';

// Healthcare-specific utilities
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export const sanitizeForAI = (text: string): string => {
  if (!text) return text;

  // Remove CPF patterns (Brazilian tax ID)
  let sanitized = text.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF_REMOVED]');

  // Remove phone patterns
  sanitized = sanitized.replace(/\(\d{2}\)\s*\d{4,5}-\d{4}/g, '[PHONE_REMOVED]');

  // Remove email patterns
  sanitized = sanitized.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g,
    '[EMAIL_REMOVED]',
  );

  // Remove RG patterns (Brazilian ID)
  sanitized = sanitized.replace(/\d{1,2}\.\d{3}\.\d{3}-\d{1}/g, '[RG_REMOVED]');

  return sanitized;
};

export const calculateNoShowRisk = async (appointmentId: string): Promise<number> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        include: {
          appointments: {
            where: {
              status: 'no_show',
              createdAt: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }, // Last 6 months
            },
          },
        },
      },
    },
  });

  if (!appointment) return 0;

  let riskScore = 0;

  // Previous no-shows (15 points each, max 60)
  const noShowCount = appointment.patient.appointments.length;
  riskScore += Math.min(noShowCount * 15, 60);

  // Weekend appointments (+10 points)
  const appointmentDay = new Date(appointment.startTime).getDay();
  if (appointmentDay === 0 || appointmentDay === 6) {
    riskScore += 10;
  }

  // Late afternoon appointments (+5 points)
  const appointmentHour = new Date(appointment.startTime).getHours();
  if (appointmentHour >= 17) {
    riskScore += 5;
  }

  // Short notice appointments (+15 points)
  const hoursUntilAppointment = (new Date(appointment.startTime).getTime() - Date.now())
    / (1000 * 60 * 60);
  if (hoursUntilAppointment < 24) {
    riskScore += 15;
  }

  // First-time patient (+10 points)
  const totalAppointments = await prisma.appointment.count({
    where: { patientId: appointment.patientId },
  });
  if (totalAppointments === 1) {
    riskScore += 10;
  }

  return Math.min(riskScore, 100); // Cap at 100
};

// Database health monitoring
export const getDatabaseMetrics = async () => {
  try {
    const [
      patientCount,
      appointmentCount,
      professionalCount,
      clinicCount,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.professional.count(),
      prisma.clinic.count(),
    ]);

    return {
      patients: patientCount,
      appointments: appointmentCount,
      professionals: professionalCount,
      clinics: clinicCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get database metrics: ${error}`);
  }
};

// Connection pool monitoring
export const getConnectionPoolStatus = () => {
  // This would be implemented based on your specific Prisma setup
  return {
    active: 'N/A', // Would show active connections
    idle: 'N/A', // Would show idle connections
    total: 'N/A', // Would show total connections
  };
};
