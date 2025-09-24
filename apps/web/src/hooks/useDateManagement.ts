/**
 * Hook for managing date selection in MultiSessionScheduler
 */
import { useState } from 'react';

interface UseDateManagementReturn {
  preferredDates: Date[];
  handleAddDate: (dateString: string) => void;
  handleRemoveDate: (date: Date) => void;
}

export function useDateManagement(): UseDateManagementReturn {
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);

  const handleAddDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!preferredDates.some(d => d.toDateString() === date.toDateString())) {
      setPreferredDates([...preferredDates, date]);
    }
  };

  const handleRemoveDate = (date: Date) => {
    setPreferredDates(preferredDates.filter(d => d !== date));
  };

  return {
    preferredDates,
    handleAddDate,
    handleRemoveDate,
  };
}
