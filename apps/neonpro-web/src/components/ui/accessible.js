"use strict";
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipLink = SkipLink;
exports.AccessibleButton = AccessibleButton;
exports.AccessibleInput = AccessibleInput;
exports.AccessibleSelect = AccessibleSelect;
exports.LiveRegion = LiveRegion;
exports.FocusTrap = FocusTrap;
exports.AccessibleDialog = AccessibleDialog;
var accessibility_context_1 = require("@/contexts/accessibility-context");
var utils_1 = require("@/lib/utils");
var react_1 = require("react");
function SkipLink(_a) {
  var href = _a.href,
    children = _a.children,
    className = _a.className;
  return (
    <a
      href={href}
      className={(0, utils_1.cn)(
        "skip-link",
        "absolute -top-10 left-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium",
        "focus:top-6 transition-[top] duration-300",
        className,
      )}
    >
      {children}
    </a>
  );
}
function AccessibleButton(_a) {
  var _b = _a.variant,
    variant = _b === void 0 ? "default" : _b,
    _c = _a.size,
    size = _c === void 0 ? "default" : _c,
    children = _a.children,
    _d = _a.loading,
    loading = _d === void 0 ? false : _d,
    _e = _a.loadingText,
    loadingText = _e === void 0 ? "Carregando..." : _e,
    className = _a.className,
    disabled = _a.disabled,
    onClick = _a.onClick,
    props = __rest(_a, [
      "variant",
      "size",
      "children",
      "loading",
      "loadingText",
      "className",
      "disabled",
      "onClick",
    ]);
  var announceToScreenReader = (0, accessibility_context_1.useAccessibility)()
    .announceToScreenReader;
  var handleClick = function (e) {
    if (loading || disabled) return;
    if (onClick) {
      onClick(e);
      // Announce action for screen readers
      if (props["aria-label"]) {
        announceToScreenReader("".concat(props["aria-label"], " acionado"));
      }
    }
  };
  return (
    <button
      className={(0, utils_1.cn)(
        "touch-target inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90":
            variant === "destructive",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
            variant === "outline",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "text-primary underline-offset-4 hover:underline": variant === "link",
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className,
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      {loading
        ? <>
            <span className="sr-only">{loadingText}</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            {loadingText}
          </>
        : children}
    </button>
  );
}
function AccessibleInput(_a) {
  var label = _a.label,
    description = _a.description,
    error = _a.error,
    _b = _a.required,
    required = _b === void 0 ? false : _b,
    id = _a.id,
    className = _a.className,
    props = __rest(_a, ["label", "description", "error", "required", "id", "className"]);
  var inputId = id || "input-".concat(Math.random().toString(36).substr(2, 9));
  var descriptionId = description ? "".concat(inputId, "-description") : undefined;
  var errorId = error ? "".concat(inputId, "-error") : undefined;
  var describedBy = [descriptionId, errorId].filter(Boolean).join(" ");
  return (
    <div className="form-field">
      <label htmlFor={inputId} className={(0, utils_1.cn)("form-label", { required: required })}>
        {label}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>

      {description && (
        <p id={descriptionId} className="form-description">
          {description}
        </p>
      )}

      <input
        id={inputId}
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        aria-required={required}
        className={(0, utils_1.cn)("form-input", { error: !!error }, className)}
        {...props}
      />

      {error && (
        <p id={errorId} className="form-error" role="alert">
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
function AccessibleSelect(_a) {
  var label = _a.label,
    description = _a.description,
    error = _a.error,
    _b = _a.required,
    required = _b === void 0 ? false : _b,
    options = _a.options,
    _c = _a.placeholder,
    placeholder = _c === void 0 ? "Selecione uma opção" : _c,
    id = _a.id,
    className = _a.className,
    props = __rest(_a, [
      "label",
      "description",
      "error",
      "required",
      "options",
      "placeholder",
      "id",
      "className",
    ]);
  var selectId = id || "select-".concat(Math.random().toString(36).substr(2, 9));
  var descriptionId = description ? "".concat(selectId, "-description") : undefined;
  var errorId = error ? "".concat(selectId, "-error") : undefined;
  var describedBy = [descriptionId, errorId].filter(Boolean).join(" ");
  return (
    <div className="form-field">
      <label htmlFor={selectId} className={(0, utils_1.cn)("form-label", { required: required })}>
        {label}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>

      {description && (
        <p id={descriptionId} className="form-description">
          {description}
        </p>
      )}

      <select
        id={selectId}
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        aria-required={required}
        className={(0, utils_1.cn)("form-input", { error: !!error }, className)}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(function (option) {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>

      {error && (
        <p id={errorId} className="form-error" role="alert">
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
function LiveRegion(_a) {
  var children = _a.children,
    _b = _a.politeness,
    politeness = _b === void 0 ? "polite" : _b,
    _c = _a.atomic,
    atomic = _c === void 0 ? true : _c,
    className = _a.className;
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={(0, utils_1.cn)("sr-only", className)}
      role="status"
    >
      {children}
    </div>
  );
}
function FocusTrap(_a) {
  var children = _a.children,
    _b = _a.active,
    active = _b === void 0 ? true : _b,
    className = _a.className;
  var containerRef = react_1.default.useRef(null);
  var trapFocus = (0, accessibility_context_1.useAccessibility)().trapFocus;
  react_1.default.useEffect(
    function () {
      if (!active || !containerRef.current) return;
      var cleanup = trapFocus(containerRef.current);
      return cleanup;
    },
    [active, trapFocus],
  );
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
function AccessibleDialog(_a) {
  var open = _a.open,
    onClose = _a.onClose,
    title = _a.title,
    description = _a.description,
    children = _a.children,
    className = _a.className;
  var announceToScreenReader = (0, accessibility_context_1.useAccessibility)()
    .announceToScreenReader;
  var titleId = "dialog-title-".concat(Math.random().toString(36).substr(2, 9));
  var descriptionId = description ? "dialog-description-".concat(titleId) : undefined;
  react_1.default.useEffect(
    function () {
      if (open) {
        announceToScreenReader("Di\u00E1logo aberto: ".concat(title), "assertive");
        // Prevent body scroll
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return function () {
        document.body.style.overflow = "unset";
      };
    },
    [open, title, announceToScreenReader],
  );
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <FocusTrap>
        <div
          className={(0, utils_1.cn)("dialog-content", className)}
          onClick={function (e) {
            return e.stopPropagation();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="Fechar diálogo"
            data-close-modal
          >
            ×
          </button>

          <h2 id={titleId} className="dialog-title">
            {title}
          </h2>

          {description && (
            <p id={descriptionId} className="text-muted-foreground mb-4">
              {description}
            </p>
          )}

          {children}
        </div>
      </FocusTrap>
    </div>
  );
}
