import { useState } from "react";
import type { ControlledPrescription } from "../types/compliance";
import { ANVISAControlledSubstancesService } from "../lib/compliance/anvisa-controlled-substances";

export interface PrescriptionFormData {
  substanceId: string;
  patientId: string;
  doctorCRM: string;
  quantity: number;
  dosage: string;
  treatmentDays: number;
  specialInstructions?: string;
}

export interface UseANVISAPrescriptionFormReturn {
  // Form state
  formData: PrescriptionFormData;
  isSubmitting: boolean;
  formErrors: Record<string, string>;
  
  // Form actions
  updateFormData: (field: keyof PrescriptionFormData, value: string | number) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  
  // Form helpers
  setFormErrors: (errors: Record<string, string>) => void;
  clearFormErrors: () => void;
}

const initialFormData: PrescriptionFormData = {
  substanceId: "",
  patientId: "",
  doctorCRM: "",
  quantity: 0,
  dosage: "",
  treatmentDays: 0,
  specialInstructions: "",
};

export const useANVISAPrescriptionForm = (
  onSuccess?: (prescription: ControlledPrescription) => void,
  onError?: (error: string) => void
): UseANVISAPrescriptionFormReturn => {
  const [formData, setFormData] = useState<PrescriptionFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: keyof PrescriptionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.substanceId) {
      errors.substanceId = "Substância é obrigatória";
    }
    if (!formData.patientId) {
      errors.patientId = "ID do paciente é obrigatório";
    }
    if (!formData.doctorCRM) {
      errors.doctorCRM = "CRM do médico é obrigatório";
    }
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = "Quantidade deve ser maior que zero";
    }
    if (!formData.dosage) {
      errors.dosage = "Dosagem é obrigatória";
    }
    if (!formData.treatmentDays || formData.treatmentDays <= 0) {
      errors.treatmentDays = "Dias de tratamento deve ser maior que zero";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const anvisaService = ANVISAControlledSubstancesService.getInstance();
      const result = await anvisaService.createControlledPrescription({
        prescriptionNumber: `RX-${Date.now()}`, // Generate prescription number
        prescriptionType: "receituario-c", // Default prescription type
        substanceId: formData.substanceId,
        patientId: formData.patientId,
        doctorCRM: formData.doctorCRM,
        quantity: formData.quantity,
        dosage: formData.dosage,
        treatmentDays: formData.treatmentDays,
        specialInstructions: formData.specialInstructions,
      });

      if (result.isValid && result.data) {
        resetForm();
        onSuccess?.(result.data);
        return true;
      } else {
        const errorMessage = result.errors.length > 0 ? result.errors.join(", ") : "Erro ao criar prescrição";
        onError?.(errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar prescrição";
      onError?.(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  return {
    // Form state
    formData,
    isSubmitting,
    formErrors,
    
    // Form actions
    updateFormData,
    resetForm,
    validateForm,
    submitForm,
    
    // Form helpers
    setFormErrors,
    clearFormErrors,
  };
};