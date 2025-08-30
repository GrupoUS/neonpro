"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ValidationSchema} from "./validation";
import { ValidationResult, validateSchema } from "./validation";

export interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
  submitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormContextType {
  state: FormState;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  clearErrors: () => void;
  setTouched: (name: string, touched?: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  validateField: (name: string) => void;
  validateForm: () => boolean;
  resetForm: (initialData?: Record<string, any>) => void;
  submitForm: (onSubmit: (data: Record<string, any>) => Promise<void> | void) => Promise<void>;
}

const FormContext = createContext<FormContextType | null>(null);

export interface FormProviderProps {
  children: React.ReactNode;
  initialData?: Record<string, any>;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  initialData = {},
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  resetOnSubmit = false,
}) => {
  const [state, setState] = useState<FormState>({
    data: initialData,
    errors: {},
    touched: {},
    loading: false,
    submitting: false,
    isValid: true,
    isDirty: false,
  });

  const setValue = useCallback((name: string, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [name]: value };
      const isDirty = JSON.stringify(newData) !== JSON.stringify(initialData);
      
      let newErrors = { ...prev.errors };
      
      // Clear error when value changes
      if (prev.errors[name]) {
        delete newErrors[name];
      }
      
      // Validate on change if enabled
      if (validateOnChange && validationSchema?.[name]) {
        const result = validateSchema(newData, { [name]: validationSchema[name] });
        if (result.errors[name]) {
          newErrors[name] = result.errors[name];
        }
      }
      
      const isValid = Object.keys(newErrors).length === 0;
      
      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isValid,
        isDirty,
      };
    });
  }, [initialData, validationSchema, validateOnChange]);

  const setError = useCallback((name: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  const clearError = useCallback((name: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      const isValid = Object.keys(newErrors).length === 0;
      
      return {
        ...prev,
        errors: newErrors,
        isValid,
      };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  const setTouched = useCallback((name: string, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({ ...prev, submitting }));
  }, []);

  const validateField = useCallback((name: string) => {
    if (!validationSchema?.[name]) {return;}

    const result = validateSchema(state.data, { [name]: validationSchema[name] });
    
    setState(prev => {
      const newErrors = { ...prev.errors };
      
      if (result.errors[name]) {
        newErrors[name] = result.errors[name];
      } else {
        delete newErrors[name];
      }
      
      const isValid = Object.keys(newErrors).length === 0;
      
      return {
        ...prev,
        errors: newErrors,
        isValid,
        touched: { ...prev.touched, [name]: true },
      };
    });
  }, [state.data, validationSchema]);

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) {return true;}

    const result = validateSchema(state.data, validationSchema);
    
    setState(prev => ({
      ...prev,
      errors: result.errors,
      isValid: result.isValid,
      touched: Object.keys(validationSchema).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>),
    }));
    
    return result.isValid;
  }, [state.data, validationSchema]);

  const resetForm = useCallback((newInitialData?: Record<string, any>) => {
    const resetData = newInitialData || initialData;
    setState({
      data: resetData,
      errors: {},
      touched: {},
      loading: false,
      submitting: false,
      isValid: true,
      isDirty: false,
    });
  }, [initialData]);

  const submitForm = useCallback(async (
    onSubmit: (data: Record<string, any>) => Promise<void> | void
  ) => {
    setSubmitting(true);
    
    try {
      // Validate form before submission
      const isFormValid = validateForm();
      
      if (!isFormValid) {
        throw new Error("Por favor, corrija os erros do formulário");
      }
      
      await onSubmit(state.data);
      
      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [state.data, validateForm, resetForm, resetOnSubmit]);

  const contextValue: FormContextType = {
    state,
    setValue,
    setError,
    clearError,
    clearErrors,
    setTouched,
    setLoading,
    setSubmitting,
    validateField,
    validateForm,
    resetForm,
    submitForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

// Enhanced form field hook
export const useFormField = (name: string) => {
  const form = useForm();
  const { state, setValue, setError, clearError, setTouched, validateField } = form;

  const fieldProps = {
    value: state.data[name],
    error: state.errors[name],
    loading: state.loading,
    onChange: (value: any) => setValue(name, value),
    onBlur: () => {
      setTouched(name);
      validateField(name);
    },
  };

  const fieldHelpers = {
    setValue: (value: any) => setValue(name, value),
    setError: (error: string) => setError(name, error),
    clearError: () => clearError(name),
    setTouched: (touched = true) => setTouched(name, touched),
    validate: () => validateField(name),
    isValid: !state.errors[name],
    isTouched: state.touched[name],
    isDirty: JSON.stringify(state.data[name]) !== JSON.stringify(form.state.data[name]),
  };

  return { fieldProps, fieldHelpers };
};