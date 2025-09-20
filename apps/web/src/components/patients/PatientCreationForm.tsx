"use client";

import { PatientRegistrationWizard } from "./PatientRegistrationWizard";

interface PatientCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  initialName?: string;
  onPatientCreated?: (patient: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }) => void;
}

/**
 * PatientCreationForm component - now uses the enhanced PatientRegistrationWizard
 *
 * This component serves as a wrapper around the new multi-step PatientRegistrationWizard
 * to maintain backward compatibility with existing code while providing the enhanced
 * user experience with multi-step form, Brazilian data validation, and LGPD compliance.
 */
export function PatientCreationForm({
  open,
  onOpenChange,
  clinicId,
  onPatientCreated,
}: PatientCreationFormProps) {
  return (
    <PatientRegistrationWizard
      open={open}
      onOpenChange={onOpenChange}
      clinicId={clinicId}
      onPatientCreated={onPatientCreated}
    />
  );
}

export default PatientCreationForm;
