// components/dashboard/appointments/filters/appointment-search.tsx
// Search component with debounce for appointments
// Story 1.1 Task 6 - Appointment Filtering and Search
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppointmentSearch;
var react_1 = require("react");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
function AppointmentSearch(_a) {
    var value = _a.value, onSearch = _a.onSearch, _b = _a.placeholder, placeholder = _b === void 0 ? 'Buscar agendamentos...' : _b, _c = _a.debounceMs, debounceMs = _c === void 0 ? 500 : _c;
    var _d = (0, react_1.useState)(value), localValue = _d[0], setLocalValue = _d[1];
    var _e = (0, react_1.useState)(false), isSearching = _e[0], setIsSearching = _e[1];
    // Debounce search function
    var debouncedSearch = (0, react_1.useCallback)(debounce(function (query) {
        onSearch(query);
        setIsSearching(false);
    }, debounceMs), [onSearch, debounceMs]);
    // Update local value when external value changes
    (0, react_1.useEffect)(function () {
        setLocalValue(value);
    }, [value]);
    // Handle input change
    var handleInputChange = function (newValue) {
        setLocalValue(newValue);
        if (newValue.trim() !== value.trim()) {
            setIsSearching(true);
            debouncedSearch(newValue);
        }
    };
    // Clear search
    var handleClear = function () {
        setLocalValue('');
        onSearch('');
        setIsSearching(false);
    };
    // Handle key press
    var handleKeyPress = function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            debouncedSearch(localValue);
        }
        if (e.key === 'Escape') {
            handleClear();
        }
    };
    return (<div className="relative">
      <div className="relative">
        <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <input_1.Input type="text" placeholder={placeholder} value={localValue} onChange={function (e) { return handleInputChange(e.target.value); }} onKeyDown={handleKeyPress} className="pl-10 pr-20"/>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isSearching && (<lucide_react_1.Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>)}
          {localValue && (<button_1.Button variant="ghost" size="sm" onClick={handleClear} className="h-6 w-6 p-0">
              <lucide_react_1.X className="h-3 w-3"/>
            </button_1.Button>)}
        </div>
      </div>
      
      {/* Search suggestions could go here in future */}
    </div>);
}
// Debounce utility function
function debounce(func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
