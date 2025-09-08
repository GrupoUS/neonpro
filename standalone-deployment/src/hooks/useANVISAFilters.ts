import { useMemo, useState } from "react";
import type {
  ANVISAControlledClass,
  ANVISASubstance,
  ControlledPrescription,
} from "../types/compliance";

export interface UseANVISAFiltersReturn {
  // Search states
  substanceSearchTerm: string;
  prescriptionSearchTerm: string;
  setSubstanceSearchTerm: (term: string) => void;
  setPrescriptionSearchTerm: (term: string) => void;

  // Filter states
  selectedClass: ANVISAControlledClass | "all";
  selectedStatus: string;
  setSelectedClass: (classType: ANVISAControlledClass | "all") => void;
  setSelectedStatus: (status: string) => void;

  // Filtered data
  filteredSubstances: ANVISASubstance[];
  filteredPrescriptions: ControlledPrescription[];

  // Reset function
  resetFilters: () => void;
}

export const useANVISAFilters = (
  substances: ANVISASubstance[],
  prescriptions: ControlledPrescription[],
): UseANVISAFiltersReturn => {
  // Search states
  const [substanceSearchTerm, setSubstanceSearchTerm] = useState("");
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState("");

  // Filter states
  const [selectedClass, setSelectedClass] = useState<ANVISAControlledClass | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Filtered substances
  const filteredSubstances = useMemo(() => {
    return substances.filter((substance) => {
      const matchesSearch = substanceSearchTerm === ""
        || substance.substanceName.toLowerCase().includes(substanceSearchTerm.toLowerCase())
        || substance.commercialName.toLowerCase().includes(substanceSearchTerm.toLowerCase())
        || substance.activeIngredient.toLowerCase().includes(substanceSearchTerm.toLowerCase());

      const matchesClass = selectedClass === "all" || substance.controlledClass === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [substances, substanceSearchTerm, selectedClass]);

  // Filtered prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const matchesSearch = prescriptionSearchTerm === ""
        || prescription.prescriptionNumber.toLowerCase().includes(
          prescriptionSearchTerm.toLowerCase(),
        )
        || prescription.patientId.toLowerCase().includes(prescriptionSearchTerm.toLowerCase())
        || prescription.doctorCRM.toLowerCase().includes(prescriptionSearchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "all" || prescription.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, prescriptionSearchTerm, selectedStatus]);

  // Reset all filters
  const resetFilters = () => {
    setSubstanceSearchTerm("");
    setPrescriptionSearchTerm("");
    setSelectedClass("all");
    setSelectedStatus("all");
  };

  return {
    // Search states
    substanceSearchTerm,
    prescriptionSearchTerm,
    setSubstanceSearchTerm,
    setPrescriptionSearchTerm,

    // Filter states
    selectedClass,
    selectedStatus,
    setSelectedClass,
    setSelectedStatus,

    // Filtered data
    filteredSubstances,
    filteredPrescriptions,

    // Reset function
    resetFilters,
  };
};
