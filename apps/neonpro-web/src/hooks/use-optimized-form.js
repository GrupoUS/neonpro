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
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOptimizedForm = useOptimizedForm;
exports.usePatientForm = usePatientForm;
exports.useAppointmentForm = useAppointmentForm;
var react_1 = require("react");
var zod_1 = require("zod");
function useOptimizedForm(options) {
  var initialValues = options.initialValues,
    validationSchema = options.validationSchema,
    _a = options.validationMode,
    validationMode = _a === void 0 ? "onBlur" : _a,
    _b = options.validateOnMount,
    validateOnMount = _b === void 0 ? false : _b,
    _c = options.enableReinitialize,
    enableReinitialize = _c === void 0 ? false : _c,
    onSubmit = options.onSubmit,
    onValidationError = options.onValidationError,
    _d = options.debounceMs,
    debounceMs = _d === void 0 ? 300 : _d;
  // =====================================================================================
  // STATE MANAGEMENT
  // =====================================================================================
  var _e = (0, react_1.useState)(() => ({
      values: __assign({}, initialValues),
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      isDirty: false,
      submitCount: 0,
    })),
    state = _e[0],
    setState = _e[1];
  var initialValuesRef = (0, react_1.useRef)(initialValues);
  var validationTimeoutRef = (0, react_1.useRef)();
  var mountedRef = (0, react_1.useRef)(true);
  // Update initial values if enableReinitialize is true
  (0, react_1.useEffect)(() => {
    if (enableReinitialize && initialValues !== initialValuesRef.current) {
      initialValuesRef.current = initialValues;
      setState((prev) =>
        __assign(__assign({}, prev), {
          values: __assign({}, initialValues),
          errors: {},
          touched: {},
          isDirty: false,
        }),
      );
    }
  }, [initialValues, enableReinitialize]);
  // Cleanup on unmount
  (0, react_1.useEffect)(
    () => () => {
      mountedRef.current = false;
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    },
    [],
  );
  // =====================================================================================
  // VALIDATION FUNCTIONS
  // =====================================================================================
  var validateField = (0, react_1.useCallback)(
    (field) =>
      __awaiter(this, void 0, void 0, function () {
        var fieldSchema, error_1;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              if (!validationSchema) return [2 /*return*/, undefined];
              _c.label = 1;
            case 1:
              _c.trys.push([1, 3, , 4]);
              fieldSchema =
                (_a = validationSchema.shape) === null || _a === void 0 ? void 0 : _a[field];
              if (!fieldSchema) return [2 /*return*/, undefined];
              return [4 /*yield*/, fieldSchema.parseAsync(state.values[field])];
            case 2:
              _c.sent();
              return [2 /*return*/, undefined];
            case 3:
              error_1 = _c.sent();
              if (error_1 instanceof zod_1.z.ZodError) {
                return [
                  2 /*return*/,
                  ((_b = error_1.errors[0]) === null || _b === void 0 ? void 0 : _b.message) ||
                    "Validation error",
                ];
              }
              return [2 /*return*/, "Validation error"];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [validationSchema, state.values],
  );
  var validateForm = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var error_2, errors_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!validationSchema) return [2 /*return*/, {}];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, validationSchema.parseAsync(state.values)];
            case 2:
              _a.sent();
              return [2 /*return*/, {}];
            case 3:
              error_2 = _a.sent();
              if (error_2 instanceof zod_1.z.ZodError) {
                errors_1 = {};
                error_2.errors.forEach((err) => {
                  var path = err.path.join(".");
                  if (!errors_1[path]) {
                    errors_1[path] = err.message;
                  }
                });
                return [2 /*return*/, errors_1];
              }
              return [2 /*return*/, {}];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [validationSchema, state.values],
  );
  var debouncedValidation = (0, react_1.useCallback)(
    (field) => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      validationTimeoutRef.current = setTimeout(
        () =>
          __awaiter(this, void 0, void 0, function () {
            var error_4, errors_2, error_3;
            return __generator(this, (_a) => {
              switch (_a.label) {
                case 0:
                  if (!mountedRef.current) return [2 /*return*/];
                  setState((prev) => __assign(__assign({}, prev), { isValidating: true }));
                  _a.label = 1;
                case 1:
                  _a.trys.push([1, 6, , 7]);
                  if (!field) return [3 /*break*/, 3];
                  return [4 /*yield*/, validateField(field)];
                case 2:
                  error_4 = _a.sent();
                  if (mountedRef.current) {
                    setState((prev) => {
                      var _a;
                      return __assign(__assign({}, prev), {
                        errors: __assign(
                          __assign({}, prev.errors),
                          ((_a = {}), (_a[field] = error_4), _a),
                        ),
                        isValidating: false,
                      });
                    });
                  }
                  return [3 /*break*/, 5];
                case 3:
                  return [4 /*yield*/, validateForm()];
                case 4:
                  errors_2 = _a.sent();
                  if (mountedRef.current) {
                    setState((prev) =>
                      __assign(__assign({}, prev), {
                        errors: errors_2,
                        isValid: Object.keys(errors_2).length === 0,
                        isValidating: false,
                      }),
                    );
                    if (Object.keys(errors_2).length > 0) {
                      onValidationError === null || onValidationError === void 0
                        ? void 0
                        : onValidationError(errors_2);
                    }
                  }
                  _a.label = 5;
                case 5:
                  return [3 /*break*/, 7];
                case 6:
                  error_3 = _a.sent();
                  if (mountedRef.current) {
                    setState((prev) => __assign(__assign({}, prev), { isValidating: false }));
                  }
                  return [3 /*break*/, 7];
                case 7:
                  return [2 /*return*/];
              }
            });
          }),
        debounceMs,
      );
    },
    [validateField, validateForm, debounceMs, onValidationError],
  );
  // =====================================================================================
  // FORM HELPERS
  // =====================================================================================
  var setFieldValue = (0, react_1.useCallback)(
    (field, value) => {
      setState((prev) => {
        var _a;
        var newValues = __assign(__assign({}, prev.values), ((_a = {}), (_a[field] = value), _a));
        var isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
        return __assign(__assign({}, prev), { values: newValues, isDirty: isDirty });
      });
      // Trigger validation based on mode
      if (validationMode === "onChange" || validationMode === "all") {
        debouncedValidation(field);
      }
    },
    [validationMode, debouncedValidation],
  );
  var setFieldError = (0, react_1.useCallback)((field, error) => {
    setState((prev) => {
      var _a;
      return __assign(__assign({}, prev), {
        errors: __assign(__assign({}, prev.errors), ((_a = {}), (_a[field] = error), _a)),
      });
    });
  }, []);
  var setFieldTouched = (0, react_1.useCallback)(
    (field, touched) => {
      setState((prev) => {
        var _a;
        return __assign(__assign({}, prev), {
          touched: __assign(__assign({}, prev.touched), ((_a = {}), (_a[field] = touched), _a)),
        });
      });
      // Trigger validation on blur if field is touched
      if (touched && (validationMode === "onBlur" || validationMode === "all")) {
        debouncedValidation(field);
      }
    },
    [validationMode, debouncedValidation],
  );
  var setValues = (0, react_1.useCallback)(
    (values) => {
      setState((prev) => {
        var newValues = __assign(__assign({}, prev.values), values);
        var isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
        return __assign(__assign({}, prev), { values: newValues, isDirty: isDirty });
      });
      if (validationMode === "onChange" || validationMode === "all") {
        debouncedValidation();
      }
    },
    [validationMode, debouncedValidation],
  );
  var setErrors = (0, react_1.useCallback)((errors) => {
    setState((prev) =>
      __assign(__assign({}, prev), { errors: __assign(__assign({}, prev.errors), errors) }),
    );
  }, []);
  var setTouched = (0, react_1.useCallback)((touched) => {
    setState((prev) =>
      __assign(__assign({}, prev), {
        touched: __assign(__assign({}, prev.touched), touched),
      }),
    );
  }, []);
  var resetForm = (0, react_1.useCallback)(
    (newValues) => {
      var resetValues = newValues
        ? __assign(__assign({}, initialValues), newValues)
        : initialValues;
      setState({
        values: resetValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        isDirty: false,
        submitCount: 0,
      });
      if (newValues) {
        initialValuesRef.current = resetValues;
      }
    },
    [initialValues],
  );
  var setSubmitting = (0, react_1.useCallback)((isSubmitting) => {
    setState((prev) => __assign(__assign({}, prev), { isSubmitting: isSubmitting }));
  }, []);
  // =====================================================================================
  // FIELD HELPERS
  // =====================================================================================
  var getFieldProps = (0, react_1.useCallback)(
    (field) => ({
      value: state.values[field],
      error: state.errors[field],
      touched: state.touched[field] || false,
      dirty: state.values[field] !== initialValuesRef.current[field],
    }),
    [state.values, state.errors, state.touched],
  );
  var getFieldHelpers = (0, react_1.useCallback)(
    (field) => ({
      onChange: (value) => setFieldValue(field, value),
      onBlur: () => setFieldTouched(field, true),
      onFocus: () => {
        // Clear field error on focus if needed
        if (state.errors[field]) {
          setFieldError(field, undefined);
        }
      },
    }),
    [setFieldValue, setFieldTouched, setFieldError, state.errors],
  );
  // =====================================================================================
  // FORM SUBMISSION
  // =====================================================================================
  var handleSubmit = (0, react_1.useCallback)(
    (e) =>
      __awaiter(this, void 0, void 0, function () {
        var errors_3, allTouched_1, error_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              e === null || e === void 0 ? void 0 : e.preventDefault();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  isSubmitting: true,
                  submitCount: prev.submitCount + 1,
                }),
              );
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              return [4 /*yield*/, validateForm()];
            case 2:
              errors_3 = _a.sent();
              if (Object.keys(errors_3).length > 0) {
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    errors: errors_3,
                    isValid: false,
                    isSubmitting: false,
                  }),
                );
                onValidationError === null || onValidationError === void 0
                  ? void 0
                  : onValidationError(errors_3);
                return [2 /*return*/];
              }
              allTouched_1 = Object.keys(state.values).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {});
              setState((prev) =>
                __assign(__assign({}, prev), {
                  touched: allTouched_1,
                  errors: {},
                  isValid: true,
                }),
              );
              if (!onSubmit) return [3 /*break*/, 4];
              return [4 /*yield*/, onSubmit(state.values, helpers)];
            case 3:
              _a.sent();
              _a.label = 4;
            case 4:
              return [3 /*break*/, 7];
            case 5:
              error_5 = _a.sent();
              console.error("Form submission error:", error_5);
              return [3 /*break*/, 7];
            case 6:
              if (mountedRef.current) {
                setState((prev) => __assign(__assign({}, prev), { isSubmitting: false }));
              }
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [state.values, validateForm, onValidationError, onSubmit],
  );
  // =====================================================================================
  // HELPERS OBJECT
  // =====================================================================================
  var helpers = (0, react_1.useMemo)(
    () => ({
      setFieldValue: setFieldValue,
      setFieldError: setFieldError,
      setFieldTouched: setFieldTouched,
      setValues: setValues,
      setErrors: setErrors,
      setTouched: setTouched,
      resetForm: resetForm,
      validateField: validateField,
      validateForm: validateForm,
      setSubmitting: setSubmitting,
    }),
    [
      setFieldValue,
      setFieldError,
      setFieldTouched,
      setValues,
      setErrors,
      setTouched,
      resetForm,
      validateField,
      validateForm,
      setSubmitting,
    ],
  );
  // =====================================================================================
  // INITIAL VALIDATION
  // =====================================================================================
  (0, react_1.useEffect)(() => {
    if (validateOnMount) {
      debouncedValidation();
    }
  }, [validateOnMount, debouncedValidation]);
  // =====================================================================================
  // RETURN INTERFACE
  // =====================================================================================
  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    isValid: state.isValid,
    isDirty: state.isDirty,
    submitCount: state.submitCount,
    getFieldProps: getFieldProps,
    getFieldHelpers: getFieldHelpers,
    handleSubmit: handleSubmit,
    helpers: helpers,
  };
}
// =====================================================================================
// SPECIALIZED FORM HOOKS
// =====================================================================================
// Patient form hook
function usePatientForm(initialValues) {
  var patientSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: zod_1.z.string().email("Email inválido").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    birthDate: zod_1.z.date().optional(),
    cpf: zod_1.z.string().min(11, "CPF inválido").optional().or(zod_1.z.literal("")),
    address: zod_1.z.string().optional(),
  });
  return useOptimizedForm({
    initialValues: initialValues,
    validationSchema: patientSchema,
    validationMode: "onBlur",
    debounceMs: 300,
  });
}
// Appointment form hook
function useAppointmentForm(initialValues) {
  var appointmentSchema = zod_1.z.object({
    patientId: zod_1.z.string().min(1, "Paciente é obrigatório"),
    professionalId: zod_1.z.string().min(1, "Profissional é obrigatório"),
    serviceId: zod_1.z.string().min(1, "Serviço é obrigatório"),
    date: zod_1.z.date({ required_error: "Data é obrigatória" }),
    time: zod_1.z.string().min(1, "Horário é obrigatório"),
    notes: zod_1.z.string().optional(),
  });
  return useOptimizedForm({
    initialValues: initialValues,
    validationSchema: appointmentSchema,
    validationMode: "onBlur",
    debounceMs: 500,
  });
}
exports.default = useOptimizedForm;
