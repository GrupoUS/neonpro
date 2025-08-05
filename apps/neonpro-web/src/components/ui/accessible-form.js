/**
 * NeonPro - Accessible Form Components
 * WCAG 2.1 AA compliant form components with healthcare-specific patterns
 *
 * Features:
 * - ARIA attributes and screen reader support
 * - Keyboard navigation
 * - Form validation with accessible error handling
 * - Brazilian healthcare form patterns
 * - Integration with React Hook Form and Zod
 */
"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibleTextarea = exports.AccessibleInput = void 0;
exports.AccessibleFormField = AccessibleFormField;
exports.AccessibleSelect = AccessibleSelect;
exports.AccessibleCheckboxGroup = AccessibleCheckboxGroup;
exports.AccessibleRadioGroup = AccessibleRadioGroup;
exports.FormErrorSummary = FormErrorSummary;
exports.StatusMessage = StatusMessage;
var alert_1 = require("@/components/ui/alert");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var radio_group_1 = require("@/components/ui/radio-group");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var use_translation_1 = require("@/hooks/use-translation");
var accessibility_utils_1 = require("@/lib/accessibility/accessibility-utils");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
/**
 * Accessible Form Field Wrapper
 * Provides consistent ARIA labeling and error handling
 */
function AccessibleFormField(_a) {
  var id = _a.id,
    name = _a.name,
    label = _a.label,
    description = _a.description,
    error = _a.error,
    _b = _a.required,
    required = _b === void 0 ? false : _b,
    _c = _a.disabled,
    disabled = _c === void 0 ? false : _c,
    className = _a.className,
    children = _a.children;
  var fieldId = id || (0, react_1.useId)();
  var labelId = (0, accessibility_utils_1.generateAriaId)("label");
  var descriptionId = description ? (0, accessibility_utils_1.generateAriaId)("desc") : undefined;
  var errorId = error ? (0, accessibility_utils_1.generateAriaId)("error") : undefined;
  var t = (0, use_translation_1.useTranslation)().t;
  return (
    <div className={(0, utils_1.cn)("space-y-2", className)}>
      <label_1.Label
        id={labelId}
        htmlFor={fieldId}
        className={(0, utils_1.cn)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {label}
        {required && <span className="sr-only">{t("common.required")}</span>}
      </label_1.Label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {react_1.default.Children.map(children, (child) => {
          if (react_1.default.isValidElement(child)) {
            return react_1.default.cloneElement(child, {
              id: fieldId,
              name: name,
              "aria-required": required,
              "aria-invalid": !!error,
              "aria-labelledby": labelId,
              "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
              disabled: disabled,
              className: (0, utils_1.cn)(
                child.props.className,
                error && "border-destructive focus:ring-destructive",
              ),
            });
          }
          return child;
        })}
      </div>

      {error && (
        <alert_1.Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription className="text-sm">{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}
    </div>
  );
}
exports.AccessibleInput = (0, react_1.forwardRef)((_a, ref) => {
  var label = _a.label,
    description = _a.description,
    error = _a.error,
    required = _a.required,
    _b = _a.format,
    format = _b === void 0 ? "default" : _b,
    onChange = _a.onChange,
    props = __rest(_a, ["label", "description", "error", "required", "format", "onChange"]);
  var _c = (0, react_1.useState)(props.value || ""),
    value = _c[0],
    setValue = _c[1];
  var handleChange = (e) => {
    var formattedValue = e.target.value;
    // Apply Brazilian formatting
    switch (format) {
      case "cpf":
        formattedValue = formatCPF(formattedValue);
        break;
      case "phone":
        formattedValue = formatPhone(formattedValue);
        break;
      case "cep":
        formattedValue = formatCEP(formattedValue);
        break;
      case "rg":
        formattedValue = formatRG(formattedValue);
        break;
    }
    setValue(formattedValue);
    if (onChange) {
      var syntheticEvent = __assign(__assign({}, e), {
        target: __assign(__assign({}, e.target), { value: formattedValue }),
      });
      onChange(syntheticEvent);
    }
  };
  return (
    <AccessibleFormField
      name={props.name || ""}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <input_1.Input ref={ref} value={value} onChange={handleChange} {...props} />
    </AccessibleFormField>
  );
});
exports.AccessibleInput.displayName = "AccessibleInput";
function AccessibleSelect(_a) {
  var name = _a.name,
    label = _a.label,
    description = _a.description,
    error = _a.error,
    required = _a.required,
    disabled = _a.disabled,
    placeholder = _a.placeholder,
    options = _a.options,
    value = _a.value,
    onValueChange = _a.onValueChange;
  var t = (0, use_translation_1.useTranslation)().t;
  return (
    <AccessibleFormField
      name={name}
      label={label}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
    >
      <select_1.Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <select_1.SelectTrigger
          className={(0, utils_1.cn)(error && "border-destructive focus:ring-destructive")}
        >
          <select_1.SelectValue placeholder={placeholder || t("common.select")} />
        </select_1.SelectTrigger>
        <select_1.SelectContent>
          {options.map((option) => (
            <select_1.SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </select_1.SelectItem>
          ))}
        </select_1.SelectContent>
      </select_1.Select>
    </AccessibleFormField>
  );
}
exports.AccessibleTextarea = (0, react_1.forwardRef)((_a, ref) => {
  var _b;
  var label = _a.label,
    description = _a.description,
    error = _a.error,
    required = _a.required,
    maxLength = _a.maxLength,
    showCharCount = _a.showCharCount,
    props = __rest(_a, ["label", "description", "error", "required", "maxLength", "showCharCount"]);
  var _c = (0, react_1.useState)(
      ((_b = props.value) === null || _b === void 0 ? void 0 : _b.toString()) || "",
    ),
    value = _c[0],
    setValue = _c[1];
  var t = (0, use_translation_1.useTranslation)().t;
  var handleChange = (e) => {
    var _a;
    setValue(e.target.value);
    (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, e);
  };
  var charCount = value.length;
  var isNearLimit = maxLength && charCount > maxLength * 0.8;
  return (
    <AccessibleFormField
      name={props.name || ""}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <textarea_1.Textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div
          className={(0, utils_1.cn)(
            "text-xs text-muted-foreground text-right",
            isNearLimit && "text-warning",
            charCount >= maxLength && "text-destructive",
          )}
          aria-live="polite"
        >
          {charCount} / {maxLength}
        </div>
      )}
    </AccessibleFormField>
  );
});
exports.AccessibleTextarea.displayName = "AccessibleTextarea";
function AccessibleCheckboxGroup(_a) {
  var name = _a.name,
    legend = _a.legend,
    description = _a.description,
    error = _a.error,
    required = _a.required,
    disabled = _a.disabled,
    options = _a.options,
    _b = _a.value,
    value = _b === void 0 ? [] : _b,
    onChange = _a.onChange;
  var fieldsetId = (0, react_1.useId)();
  var legendId = (0, accessibility_utils_1.generateAriaId)("legend");
  var descriptionId = description ? (0, accessibility_utils_1.generateAriaId)("desc") : undefined;
  var errorId = error ? (0, accessibility_utils_1.generateAriaId)("error") : undefined;
  var handleCheckedChange = (optionValue) => (checked) => {
    if (onChange) {
      var newValue = checked
        ? __spreadArray(__spreadArray([], value, true), [optionValue], false)
        : value.filter((v) => v !== optionValue);
      onChange(newValue);
    }
  };
  return (
    <fieldset
      id={fieldsetId}
      className="space-y-3"
      disabled={disabled}
      aria-labelledby={legendId}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend
        id={legendId}
        className={(0, utils_1.cn)(
          "text-sm font-medium leading-none",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {legend}
      </legend>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="space-y-2">
        {options.map((option) => {
          var optionId = (0, accessibility_utils_1.generateAriaId)("checkbox");
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <checkbox_1.Checkbox
                id={optionId}
                name={"".concat(name, "[]")}
                value={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={handleCheckedChange(option.value)}
                disabled={disabled || option.disabled}
                aria-describedby={error ? errorId : undefined}
              />
              <label_1.Label htmlFor={optionId} className="text-sm font-normal cursor-pointer">
                {option.label}
              </label_1.Label>
            </div>
          );
        })}
      </div>

      {error && (
        <alert_1.Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription className="text-sm">{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}
    </fieldset>
  );
}
function AccessibleRadioGroup(_a) {
  var name = _a.name,
    legend = _a.legend,
    description = _a.description,
    error = _a.error,
    required = _a.required,
    disabled = _a.disabled,
    options = _a.options,
    value = _a.value,
    onValueChange = _a.onValueChange;
  var fieldsetId = (0, react_1.useId)();
  var legendId = (0, accessibility_utils_1.generateAriaId)("legend");
  var descriptionId = description ? (0, accessibility_utils_1.generateAriaId)("desc") : undefined;
  var errorId = error ? (0, accessibility_utils_1.generateAriaId)("error") : undefined;
  return (
    <fieldset
      id={fieldsetId}
      className="space-y-3"
      disabled={disabled}
      aria-labelledby={legendId}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend
        id={legendId}
        className={(0, utils_1.cn)(
          "text-sm font-medium leading-none",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {legend}
      </legend>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <radio_group_1.RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className="space-y-2"
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((option) => {
          var optionId = (0, accessibility_utils_1.generateAriaId)("radio");
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <radio_group_1.RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={disabled || option.disabled}
              />
              <label_1.Label htmlFor={optionId} className="text-sm font-normal cursor-pointer">
                {option.label}
              </label_1.Label>
            </div>
          );
        })}
      </radio_group_1.RadioGroup>

      {error && (
        <alert_1.Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription className="text-sm">{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}
    </fieldset>
  );
}
function FormErrorSummary(_a) {
  var errors = _a.errors,
    title = _a.title,
    className = _a.className;
  var t = (0, use_translation_1.useTranslation)().t;
  var summaryId = (0, react_1.useId)();
  var titleId = (0, accessibility_utils_1.generateAriaId)("error-title");
  var errorCount = Object.keys(errors).length;
  if (errorCount === 0) return null;
  // Announce errors to screen readers
  (0, react_1.useEffect)(() => {
    var message =
      errorCount === 1
        ? t("errors.validationError")
        : "".concat(errorCount, " erros encontrados no formul\u00E1rio");
    (0, accessibility_utils_1.announceToScreenReader)(message, "assertive");
  }, [errors, errorCount, t]);
  return (
    <alert_1.Alert
      id={summaryId}
      variant="destructive"
      className={(0, utils_1.cn)("mb-6", className)}
      role="alert"
      tabIndex={-1}
    >
      <lucide_react_1.AlertTriangle className="h-4 w-4" />
      <div className="ml-2">
        <h2 id={titleId} className="text-sm font-medium text-destructive mb-2">
          {title ||
            (errorCount === 1
              ? t("errors.validationError")
              : "".concat(errorCount, " erros encontrados"))}
        </h2>
        <ul className="space-y-1">
          {Object.entries(errors).map((_a) => {
            var field = _a[0],
              message = _a[1];
            return (
              <li key={field}>
                <button
                  type="button"
                  className="text-sm text-destructive underline hover:no-underline focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded"
                  onClick={() => {
                    var element = document.getElementById(field);
                    element === null || element === void 0 ? void 0 : element.focus();
                    element === null || element === void 0
                      ? void 0
                      : element.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  {message}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </alert_1.Alert>
  );
}
function StatusMessage(_a) {
  var type = _a.type,
    title = _a.title,
    message = _a.message,
    className = _a.className;
  var iconMap = {
    success: lucide_react_1.CheckCircle,
    info: lucide_react_1.Info,
    warning: lucide_react_1.AlertTriangle,
    error: lucide_react_1.AlertTriangle,
  };
  var Icon = iconMap[type];
  return (
    <alert_1.Alert
      variant={type === "error" ? "destructive" : "default"}
      className={(0, utils_1.cn)("mb-4", className)}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-4 w-4" />
      <div className="ml-2">
        {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
        <alert_1.AlertDescription className="text-sm">{message}</alert_1.AlertDescription>
      </div>
    </alert_1.Alert>
  );
}
/**
 * Brazilian formatting utilities
 */
function formatCPF(value) {
  var numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
}
function formatPhone(value) {
  var numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
}
function formatCEP(value) {
  var numbers = value.replace(/\D/g, "");
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return value;
}
function formatRG(value) {
  var numbers = value.replace(/\D/g, "");
  if (numbers.length <= 9) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  }
  return value;
}
