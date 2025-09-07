// Minimal patient type to satisfy linter and enable imports
export interface PatientSummary {
  id: string;
  name: string;
  birthDate?: string;
}

export interface PatientReportFilter {
  from?: string; // ISO date
  to?: string; // ISO date
}
