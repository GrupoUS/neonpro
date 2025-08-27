/**
 * useDebounce Hook
 * Story 3.4: Smart Search + NLP Integration
 * Debounces values to prevent excessive API calls
 */

import { useEffect, useState } from "react";

/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = function useDebounce<ValueType>(
  value: ValueType,
  delay: number,
): ValueType {
  const [debouncedValue, setDebouncedValue] = useState<ValueType>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
