import { z } from "zod";

// Common enums for aesthetic clinic operations
export enum AppointmentStatus {
	SCHEDULED = "scheduled",
	CONFIRMED = "confirmed",
	IN_PROGRESS = "in_progress",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
	NO_SHOW = "no_show",
	RESCHEDULED = "rescheduled",
}

export enum TreatmentType {
	BOTOX = "botox",
	DERMAL_FILLER = "dermal_filler",
	LASER_HAIR_REMOVAL = "laser_hair_removal",
	CHEMICAL_PEEL = "chemical_peel",
	MICRONEEDLING = "microneedling",
	HYDRAFACIAL = "hydrafacial",
	LASER_RESURFACING = "laser_resurfacing",
	BODY_CONTOURING = "body_contouring",
	CONSULTATION = "consultation",
}

export enum PatientStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	PROSPECT = "prospect",
	BLOCKED = "blocked",
}

export enum BillingStatus {
	PENDING = "pending",
	PAID = "paid",
	OVERDUE = "overdue",
	CANCELLED = "cancelled",
	REFUNDED = "refunded",
}

export enum NotificationType {
	APPOINTMENT_REMINDER = "appointment_reminder",
	APPOINTMENT_CONFIRMATION = "appointment_confirmation",
	TREATMENT_FOLLOWUP = "treatment_followup",
	PAYMENT_REMINDER = "payment_reminder",
	PROMOTION = "promotion",
	BIRTHDAY = "birthday",
	REVIEW_REQUEST = "review_request",
}

export enum InventoryStatus {
	IN_STOCK = "in_stock",
	LOW_STOCK = "low_stock",
	OUT_OF_STOCK = "out_of_stock",
	DISCONTINUED = "discontinued",
	EXPIRED = "expired",
}

// Common validation schemas
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const PhoneSchema = z.string().regex(/^\+?[\d\s-()]+$/);
export const DateSchema = z.date();
export const PositiveNumberSchema = z.number().positive();
export const NonNegativeNumberSchema = z.number().nonnegative();

// Base entity interface
export type BaseEntity = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string;
	updatedBy?: string;
};
