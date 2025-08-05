// Patient types for healthcare SaaS
export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  address: Address;
  emergencyContact: EmergencyContact;
  lgpdConsent: boolean;
  consentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}