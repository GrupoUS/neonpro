"use strict";
/**
 * useDebounce Hook
 * Story 3.4: Smart Search + NLP Integration
 * Debounces values to prevent excessive API calls
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebounce = useDebounce;
var react_1 = require("react");
/**
 * Hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
function useDebounce(value, delay) {
  var _a = (0, react_1.useState)(value),
    debouncedValue = _a[0],
    setDebouncedValue = _a[1];
  (0, react_1.useEffect)(
    function () {
      // Set up a timer to update the debounced value after the delay
      var handler = setTimeout(function () {
        setDebouncedValue(value);
      }, delay);
      // Clean up the timer if the value changes before the delay
      return function () {
        clearTimeout(handler);
      };
    },
    [value, delay],
  );
  return debouncedValue;
}
exports.default = useDebounce;
