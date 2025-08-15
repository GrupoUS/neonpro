/**
 * HL7 FHIR R4 Patient Resource Types
 *
 * Based on HL7 FHIR Patient Resource:
 * https://www.hl7.org/fhir/patient.html
 *
 * Implements FHIR-compliant patient data structures for NeonPro
 * with LGPD compliance for Brazilian healthcare data protection.
 */

// Base FHIR data types
export type FHIRDate = string; // YYYY-MM-DD format
export type FHIRDateTime = string; // YYYY-MM-DDTHH:mm:ss.sssZ format
export type FHIRCode = string;
export type FHIRURI = string;

// FHIR Identifier for medical record numbers, national IDs, etc.
export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  system?: FHIRURI;
  value: string;
  period?: {
    start?: FHIRDateTime;
    end?: FHIRDateTime;
  };
  assigner?: {
    reference?: string;
    display?: string;
  };
}

// FHIR HumanName for patient names
export interface FHIRHumanName {
  use?:
    | 'usual'
    | 'official'
    | 'temp'
    | 'nickname'
    | 'anonymous'
    | 'old'
    | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: {
    start?: FHIRDateTime;
    end?: FHIRDateTime;
  };
}

// FHIR ContactPoint for phone, email, etc.
export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: {
    start?: FHIRDateTime;
    end?: FHIRDateTime;
  };
}

// FHIR Address
export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: {
    start?: FHIRDateTime;
    end?: FHIRDateTime;
  };
}

// FHIR Patient Contact (emergency contacts, next of kin)
export interface FHIRPatientContact {
  relationship?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  }[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: {
    reference?: string;
    display?: string;
  };
  period?: {
    start?: FHIRDateTime;
    end?: FHIRDateTime;
  };
}

// Main FHIR Patient Resource
export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: FHIRDateTime;
    profile?: FHIRURI[];
  };
  implicitRules?: FHIRURI;
  language?: FHIRCode;

  // Patient Demographics
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: FHIRDate;
  deceased?: boolean | FHIRDateTime;
  address?: FHIRAddress[];
  maritalStatus?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  multipleBirth?: boolean | number;
  photo?: {
    contentType?: FHIRCode;
    language?: FHIRCode;
    data?: string;
    url?: FHIRURI;
    size?: number;
    hash?: string;
    title?: string;
    creation?: FHIRDateTime;
  }[];
  contact?: FHIRPatientContact[];
  communication?: {
    language: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    };
    preferred?: boolean;
  }[];
  generalPractitioner?: {
    reference?: string;
    display?: string;
  }[];
  managingOrganization?: {
    reference?: string;
    display?: string;
  };
  link?: {
    other: {
      reference?: string;
      display?: string;
    };
    type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
  }[];
}

// FHIR Condition Resource for medical conditions
export interface FHIRCondition {
  resourceType: 'Condition';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: FHIRDateTime;
    profile?: FHIRURI[];
  };

  identifier?: FHIRIdentifier[];
  clinicalStatus?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  verificationStatus?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  category?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  }[];
  severity?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  code?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  bodySite?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  }[];
  subject: {
    reference?: string;
    display?: string;
  };
  encounter?: {
    reference?: string;
    display?: string;
  };
  onset?:
    | FHIRDateTime
    | FHIRDate
    | {
        start?: FHIRDateTime;
        end?: FHIRDateTime;
      }
    | string;
  abatement?:
    | FHIRDateTime
    | FHIRDate
    | {
        start?: FHIRDateTime;
        end?: FHIRDateTime;
      }
    | string
    | boolean;
  recordedDate?: FHIRDateTime;
  recorder?: {
    reference?: string;
    display?: string;
  };
  asserter?: {
    reference?: string;
    display?: string;
  };
  stage?: {
    summary?: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    };
    assessment?: {
      reference?: string;
      display?: string;
    }[];
    type?: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    };
  }[];
  evidence?: {
    code?: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    }[];
    detail?: {
      reference?: string;
      display?: string;
    }[];
  }[];
  note?: {
    author?:
      | string
      | {
          reference?: string;
          display?: string;
        };
    time?: FHIRDateTime;
    text: string;
  }[];
}

// FHIR AllergyIntolerance Resource
export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: FHIRDateTime;
    profile?: FHIRURI[];
  };

  identifier?: FHIRIdentifier[];
  clinicalStatus?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  verificationStatus?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  type?: 'allergy' | 'intolerance';
  category?: ('food' | 'medication' | 'environment' | 'biologic')[];
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: {
    coding?: {
      system?: FHIRURI;
      code?: FHIRCode;
      display?: string;
    }[];
    text?: string;
  };
  patient: {
    reference?: string;
    display?: string;
  };
  encounter?: {
    reference?: string;
    display?: string;
  };
  onset?:
    | FHIRDateTime
    | FHIRDate
    | {
        start?: FHIRDateTime;
        end?: FHIRDateTime;
      }
    | string;
  recordedDate?: FHIRDateTime;
  recorder?: {
    reference?: string;
    display?: string;
  };
  asserter?: {
    reference?: string;
    display?: string;
  };
  lastOccurrence?: FHIRDateTime;
  note?: {
    author?:
      | string
      | {
          reference?: string;
          display?: string;
        };
    time?: FHIRDateTime;
    text: string;
  }[];
  reaction?: {
    substance?: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    };
    manifestation: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    }[];
    description?: string;
    onset?: FHIRDateTime;
    severity?: 'mild' | 'moderate' | 'severe';
    exposureRoute?: {
      coding?: {
        system?: FHIRURI;
        code?: FHIRCode;
        display?: string;
      }[];
      text?: string;
    };
    note?: {
      author?:
        | string
        | {
            reference?: string;
            display?: string;
          };
      time?: FHIRDateTime;
      text: string;
    }[];
  }[];
}

// LGPD Consent Types for patient data processing
export interface LGPDConsent {
  id?: string;
  patient_id: string;
  consent_type:
    | 'explicit'
    | 'legitimate_interest'
    | 'vital_interest'
    | 'public_task'
    | 'legal_obligation'
    | 'contract';
  purpose: string;
  data_categories: string[];
  retention_period_years: number;
  consent_date: FHIRDateTime;
  expiration_date?: FHIRDateTime;
  withdrawal_date?: FHIRDateTime;
  is_active: boolean;
  legal_basis_article: string; // LGPD Article reference
  processing_details: string;
  third_party_sharing?: {
    organization: string;
    purpose: string;
    legal_basis: string;
  }[];
  patient_signature?: string;
  witness_signature?: string;
  created_at: FHIRDateTime;
  updated_at: FHIRDateTime;
}

// NeonPro-specific extensions to FHIR Patient
export interface NeonProPatient extends Omit<FHIRPatient, 'id'> {
  id?: string;
  clinic_id: string;
  medical_record_number: string;
  preferred_language?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  insurance_info?: {
    provider: string;
    plan: string;
    policy_number: string;
    group_number?: string;
  };
  lgpd_consents?: LGPDConsent[];
  created_at: FHIRDateTime;
  updated_at: FHIRDateTime;
  created_by: string;
  updated_by: string;
}

// Database table interfaces matching our Supabase schema
export interface PatientDB {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  fhir_data: FHIRPatient;
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface PatientConsentDB {
  id: string;
  patient_id: string;
  consent_type: string;
  purpose: string;
  data_categories: string[];
  retention_period_years: number;
  consent_date: string;
  expiration_date?: string;
  withdrawal_date?: string;
  is_active: boolean;
  legal_basis_article: string;
  processing_details: string;
  patient_signature?: string;
  witness_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalConditionDB {
  id: string;
  patient_id: string;
  fhir_data: FHIRCondition;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface AllergyIntoleranceDB {
  id: string;
  patient_id: string;
  fhir_data: FHIRAllergyIntolerance;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
