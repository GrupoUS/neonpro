/**
 * Hook for managing professional selection in MultiSessionScheduler
 */
import { useState } from 'react';

interface UseProfessionalSelectionReturn {
  preferredProfessionals: string[];
  handleProfessionalSelect: (professionalId: string, checked: boolean) => void;
}

export function useProfessionalSelection(): UseProfessionalSelectionReturn {
  const [preferredProfessionals, setPreferredProfessionals] = useState<string[]>([]);

  const handleProfessionalSelect = (professionalId: string, checked: boolean) => {
    if (checked) {
      setPreferredProfessionals([...preferredProfessionals, professionalId]);
    } else {
      setPreferredProfessionals(preferredProfessionals.filter(id => id !== professionalId));
    }
  };

  return {
    preferredProfessionals,
    handleProfessionalSelect,
  };
}