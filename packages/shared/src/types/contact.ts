/**
 * Contact Information Model (T033)
 * Comprehensive contact management for Brazilian healthcare
 *
 * Features:
 * - Contact information with Brazilian validation
 * - Emergency contact management
 * - Communication preferences
 * - LGPD compliance for contact data
 * - Relationship tracking
 * - Contact verification and completeness
 */

import { Address } from './patient';

// Contact type enum
export enum ContactType {
  PRIMARY = 'primary',
  EMERGENCY = 'emergency',
  FAMILY = 'family',
  WORK = 'work',
  HEALTHCARE = 'healthcare',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

// Relationship type enum
export enum RelationshipType {
  SELF = 'self',
  SPOUSE = 'spouse',
  PARTNER = 'partner',
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  CAREGIVER = 'caregiver',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

// Communication method enum
export enum CommunicationMethod {
  PHONE = 'phone',
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  PUSH = 'push',
  MAIL = 'mail',
}

// Contact preferences interface
export interface ContactPreferences {
  preferredMethod: CommunicationMethod | string;
  allowSMS: boolean;
  allowEmail: boolean;
  allowWhatsApp: boolean;
  allowCalls: boolean;
  allowTelegram?: boolean;
  bestTimeToContact?: string; // e.g., "09:00-17:00"
  timezone?: string; // e.g., "America/Sao_Paulo"
  language?: 'pt-BR' | 'en-US';
  doNotDisturb?: {
    enabled: boolean;
    startTime?: string; // e.g., "22:00"
    endTime?: string; // e.g., "08:00"
  };
}

// Main contact interface
export interface Contact {
  id: string;
  patientId: string;

  // Basic information
  type: ContactType | string;
  name: string;
  relationship: RelationshipType | string;

  // Contact details
  phone?: string;
  alternativePhone?: string;
  email?: string;
  alternativeEmail?: string;

  // Address information
  address?: Address;

  // Priority and emergency settings
  isPrimary: boolean;
  isEmergency: boolean;
  emergencyPriority?: number; // 1 = highest priority

  // Communication preferences
  preferences?: ContactPreferences;

  // Additional information
  notes?: string;
  tags?: string[];
  occupation?: string;
  company?: string;

  // Verification status
  phoneVerified?: boolean;
  emailVerified?: boolean;
  lastContactDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;

  // LGPD compliance
  consentToContact?: boolean;
  consentDate?: Date;
  accessLog?: Array<{
    _userId: string;
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;
}

// Validate Brazilian phone number
export function validateBrazilianPhone(phone: string): boolean {
  if (!phone) return false;

  // Remove formatting
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Check length (10 or 11 digits)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Check area code (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Check mobile number format (9 digits starting with 9)
  if (cleanPhone.length === 11) {
    const firstDigit = parseInt(cleanPhone.charAt(2));
    if (firstDigit !== 9) return false;
  }

  return true;
}

// Validate email address
export function validateEmail(email: string): boolean {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate Brazilian CEP
export function validateCEP(cep: string): boolean {
  if (!cep) return false;

  // Remove formatting
  const cleanCEP = cep.replace(/[^\d]/g, '');

  // Check length
  if (cleanCEP.length !== 8) return false;

  // Check for valid pattern (not all zeros)
  if (cleanCEP === '00000000') return false;

  return true;
}

// Format contact for display
export function formatContactForDisplay(contact: Partial<Contact>): string {
  const parts: string[] = [];

  if (contact.name) {
    parts.push(contact.name);
  }

  if (contact.relationship && contact.relationship !== 'self') {
    parts.push(`(${contact.relationship})`);
  }

  if (contact.phone) {
    parts.push(contact.phone);
  }

  if (contact.email) {
    parts.push(contact.email);
  }

  if (contact.type && contact.type !== 'primary') {
    parts.push(`[${contact.type}]`);
  }

  return parts.join(' | ');
}

// Set emergency contact priority
export function setEmergencyPriority(
  contact: Partial<Contact>,
  priority: number,
): Partial<Contact> {
  return {
    ...contact,
    isEmergency: true,
    emergencyPriority: priority,
    updatedAt: new Date(),
  };
}

// Anonymize contact for LGPD compliance
export function anonymizeContact(contact: Partial<Contact>): Partial<Contact> {
  const anonymized = { ...contact };

  if (anonymized.name) {
    anonymized.name = `CONTATO ANONIMIZADO - ${Date.now()}`;
  }

  if (anonymized.phone) {
    anonymized.phone = '(**) *****-****';
  }

  if (anonymized.alternativePhone) {
    anonymized.alternativePhone = '(**) *****-****';
  }

  if (anonymized.email) {
    anonymized.email = `anon_${Date.now()}@anonymized.com`;
  }

  if (anonymized.alternativeEmail) {
    anonymized.alternativeEmail = `anon_alt_${Date.now()}@anonymized.com`;
  }

  if (anonymized.address) {
    anonymized.address = {
      ...anonymized.address,
      street: 'ENDEREÇO ANONIMIZADO',
      number: '***',
      complement: undefined,
    };
  }

  if (anonymized.notes) {
    anonymized.notes = `NOTAS ANONIMIZADAS - ${Date.now()}`;
  }

  if (anonymized.occupation) {
    anonymized.occupation = 'PROFISSÃO ANONIMIZADA';
  }

  if (anonymized.company) {
    anonymized.company = 'EMPRESA ANONIMIZADA';
  }

  return anonymized;
}

// Validate contact completeness
export function validateContactCompleteness(
  contact: Partial<Contact>,
): boolean {
  if (!contact.name || contact.name.trim() === '') {
    return false;
  }

  if (!contact.relationship) {
    return false;
  }

  // Must have at least one contact method
  if (!contact.phone && !contact.email) {
    return false;
  }

  // Validate phone if provided
  if (contact.phone && !validateBrazilianPhone(contact.phone)) {
    return false;
  }

  // Validate email if provided
  if (contact.email && !validateEmail(contact.email)) {
    return false;
  }

  return true;
}

// Create contact with defaults
export function createContact(
  data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>,
): Contact {
  const now = new Date();

  return {
    ...data,
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
}

// Get primary contact
export function getPrimaryContact(contacts: Contact[]): Contact | undefined {
  return contacts.find(contact => contact.isPrimary);
}

// Get emergency contacts sorted by priority
export function getEmergencyContacts(contacts: Contact[]): Contact[] {
  return contacts
    .filter(contact => contact.isEmergency)
    .sort(
      (a, b) => (a.emergencyPriority || 999) - (b.emergencyPriority || 999),
    );
}

// Format Brazilian phone for display
export function formatBrazilianPhone(phone: string): string {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[^\d]/g, '');

  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

// Check if contact can be reached at current time
export function canContactNow(contact: Contact): boolean {
  if (!contact.preferences?.doNotDisturb?.enabled) {
    return true;
  }

  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

  const dnd = contact.preferences.doNotDisturb;
  if (!dnd.startTime || !dnd.endTime) {
    return true;
  }

  // Simple time comparison (doesn't handle cross-midnight ranges)
  if (dnd.startTime <= dnd.endTime) {
    return currentTime < dnd.startTime || currentTime > dnd.endTime;
  } else {
    // Cross-midnight range
    return currentTime > dnd.endTime && currentTime < dnd.startTime;
  }
}

// Get contacts by type
export function getContactsByType(
  contacts: Contact[],
  type: ContactType,
): Contact[] {
  return contacts.filter(contact => contact.type === type);
}

// Update contact verification status
export function updateContactVerification(
  contact: Contact,
  field: 'phone' | 'email',
  verified: boolean,
): Contact {
  const updated = { ...contact };

  if (field === 'phone') {
    updated.phoneVerified = verified;
  } else if (field === 'email') {
    updated.emailVerified = verified;
  }

  updated.updatedAt = new Date();
  return updated;
}

// Get contact statistics
export function getContactStatistics(contacts: Contact[]): {
  total: number;
  byType: Record<string, number>;
  verified: { phone: number; email: number };
  emergency: number;
} {
  const stats = {
    total: contacts.length,
    byType: {} as Record<string, number>,
    verified: { phone: 0, email: 0 },
    emergency: 0,
  };

  contacts.forEach(contact => {
    // Count by type
    stats.byType[contact.type] = (stats.byType[contact.type] || 0) + 1;

    // Count verified contacts
    if (contact.phoneVerified) stats.verified.phone++;
    if (contact.emailVerified) stats.verified.email++;

    // Count emergency contacts
    if (contact.isEmergency) stats.emergency++;
  });

  return stats;
}
