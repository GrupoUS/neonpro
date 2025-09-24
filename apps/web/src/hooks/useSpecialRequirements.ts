/**
 * Hook for managing special requirements in MultiSessionScheduler
 */
import { useState } from 'react';

interface UseSpecialRequirementsReturn {
  specialRequirements: string[];
  newRequirement: string;
  setNewRequirement: (value: string) => void;
  handleAddRequirement: () => void;
  handleRemoveRequirement: (requirement: string) => void;
}

export function useSpecialRequirements(): UseSpecialRequirementsReturn {
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !specialRequirements.includes(newRequirement.trim())) {
      setSpecialRequirements([...specialRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setSpecialRequirements(specialRequirements.filter(req => req !== requirement));
  };

  return {
    specialRequirements,
    newRequirement,
    setNewRequirement,
    handleAddRequirement,
    handleRemoveRequirement,
  };
}
