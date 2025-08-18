import { z } from 'zod';
import { BaseEntity, TreatmentType, UUIDSchema, DateSchema, PositiveNumberSchema } from '../types';

// Treatment plan and session interfaces
export interface TreatmentPlan extends BaseEntity {
  patientId: string;
  treatmentType: TreatmentType;
  providerId: string;
  totalSessions: number;
  completedSessions: number;
  sessionInterval: number; // days between sessions
  startDate: Date;
  endDate?: Date;
  treatmentAreas: string[];
  notes: string;
  contraindications?: string[];
  expectedResults: string;
  price: number;
  isActive: boolean;
  consentFormSigned: boolean;
  beforePhotos: string[];
  progressPhotos: TreatmentPhoto[];
}

export interface TreatmentSession extends BaseEntity {
  treatmentPlanId: string;
  appointmentId: string;
  sessionNumber: number;
  date: Date;
  providerId: string;
  preSessionNotes?: string;
  postSessionNotes?: string;
  treatmentDetails: TreatmentDetails;
  sideEffects?: string[];
  patientFeedback?: string;
  nextSessionDate?: Date;
  beforePhotos: string[];
  afterPhotos: string[];
  isCompleted: boolean;
}export interface TreatmentDetails {
  treatmentType: TreatmentType;
  areas: string[];
  // Botox specific
  unitsUsed?: number;
  injectionSites?: InjectionSite[];
  
  // Dermal filler specific
  fillerType?: string;
  volumeUsed?: number; // in ml
  
  // Laser specific
  laserSettings?: LaserSettings;
  
  // Chemical peel specific
  peelType?: string;
  concentration?: number;
  
  // General
  duration: number; // minutes
  anesthesia?: AnesthesiaType;
  products: ProductUsage[];
}

export interface InjectionSite {
  area: string;
  units: number;
  depth: 'intradermal' | 'subcutaneous' | 'intramuscular';
  technique: string;
}

export interface LaserSettings {
  wavelength: number;
  fluence: number;
  spotSize: number;
  pulseWidth?: number;
  coolingSettings?: string;
}

export interface ProductUsage {
  productId: string;
  productName: string;
  quantityUsed: number;
  batchNumber?: string;
  expiryDate?: Date;
}

export interface TreatmentPhoto {
  url: string;
  sessionNumber: number;
  date: Date;
  angle: string;
  description?: string;
}

export enum AnesthesiaType {
  NONE = 'none',
  TOPICAL = 'topical',
  LOCAL = 'local',
  CONSCIOUS_SEDATION = 'conscious_sedation'
}

export enum TreatmentStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}// Validation schemas
export const CreateTreatmentPlanSchema = z.object({
  patientId: UUIDSchema,
  treatmentType: z.nativeEnum(TreatmentType),
  providerId: UUIDSchema,
  totalSessions: z.number().min(1).max(20),
  sessionInterval: z.number().min(1).max(365), // days
  startDate: DateSchema,
  treatmentAreas: z.array(z.string()).min(1),
  notes: z.string().min(1),
  contraindications: z.array(z.string()).optional(),
  expectedResults: z.string().min(1),
  price: PositiveNumberSchema,
  consentFormSigned: z.boolean().refine(val => val === true, 'Consent form must be signed'),
  beforePhotos: z.array(z.string()).default([])
});

export const UpdateTreatmentPlanSchema = CreateTreatmentPlanSchema.partial().extend({
  id: UUIDSchema,
  isActive: z.boolean().optional(),
  endDate: DateSchema.optional()
});

export const CreateTreatmentSessionSchema = z.object({
  treatmentPlanId: UUIDSchema,
  appointmentId: UUIDSchema,
  sessionNumber: z.number().min(1),
  date: DateSchema,
  providerId: UUIDSchema,
  preSessionNotes: z.string().optional(),
  treatmentDetails: z.object({
    treatmentType: z.nativeEnum(TreatmentType),
    areas: z.array(z.string()).min(1),
    unitsUsed: z.number().optional(),
    volumeUsed: z.number().optional(),
    duration: z.number().min(1),
    anesthesia: z.nativeEnum(AnesthesiaType).default(AnesthesiaType.NONE),
    products: z.array(z.object({
      productId: UUIDSchema,
      productName: z.string(),
      quantityUsed: z.number().min(0),
      batchNumber: z.string().optional(),
      expiryDate: DateSchema.optional()
    })).default([])
  }),
  beforePhotos: z.array(z.string()).default([])
});

export const CompleteTreatmentSessionSchema = z.object({
  id: UUIDSchema,
  postSessionNotes: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  patientFeedback: z.string().optional(),
  nextSessionDate: DateSchema.optional(),
  afterPhotos: z.array(z.string()).default([])
});

export type CreateTreatmentPlanData = z.infer<typeof CreateTreatmentPlanSchema>;
export type UpdateTreatmentPlanData = z.infer<typeof UpdateTreatmentPlanSchema>;
export type CreateTreatmentSessionData = z.infer<typeof CreateTreatmentSessionSchema>;
export type CompleteTreatmentSessionData = z.infer<typeof CompleteTreatmentSessionSchema>;