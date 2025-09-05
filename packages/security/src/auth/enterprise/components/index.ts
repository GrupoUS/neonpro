/**
 * Auth Components - UI components for authentication
 * @package @neonpro/auth
 */

import React, { isValidElement, type ComponentType } from "react";

// Define component types that will be implemented in the web app
export interface LoginFormProps {
  onLogin?: (credentials: { email: string; password: string; }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface RegisterFormProps {
  onRegister?: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface AuthButtonProps {
  onClick?: () => void;
  loading?: boolean;
  variant?: "login" | "logout" | "register";
  children?: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

// Export component interfaces for use in the frontend
export type LoginForm = ComponentType<LoginFormProps>;
export type RegisterForm = ComponentType<RegisterFormProps>;
export type AuthButton = ComponentType<AuthButtonProps>;
export type ProtectedRoute = ComponentType<ProtectedRouteProps>;

// Component factory types for dependency injection
export interface AuthComponentFactory {
  createLoginForm: (props: LoginFormProps) => React.ReactElement;
  createRegisterForm: (props: RegisterFormProps) => React.ReactElement;
  createAuthButton: (props: AuthButtonProps) => React.ReactElement;
  createProtectedRoute: (props: ProtectedRouteProps) => React.ReactElement;
}

// Default component registry (to be implemented in frontend)
export const AuthComponents = {
  LoginForm: null as LoginForm | null,
  RegisterForm: null as RegisterForm | null,
  AuthButton: null as AuthButton | null,
  ProtectedRoute: null as ProtectedRoute | null,
};

// Component registration utility
export function registerAuthComponents(
  components: Partial<typeof AuthComponents>,
) {
  Object.assign(AuthComponents, components);
}

// Validation helpers for component props
const isFunction = (v: unknown): v is (...args: any[]) => any => typeof v === "function";
const isString = (v: unknown): v is string => typeof v === "string";
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";
const isReactNode = (v: unknown): boolean => {
  if (v == null) return true;
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return true;
  if (Array.isArray(v)) return v.every(isReactNode);
  return isValidElement(v as any);
};

export const validateLoginFormProps = (props: LoginFormProps): boolean => {
  if (typeof props !== "object" || props === null) return false;
  if (props.onLogin !== undefined && !isFunction(props.onLogin)) return false;
  if (props.loading !== undefined && !isBoolean(props.loading)) return false;
  if (props.error !== undefined && !isString(props.error)) return false;
  return true;
};

export const validateRegisterFormProps = (props: RegisterFormProps): boolean => {
  if (typeof props !== "object" || props === null) return false;
  if (props.onRegister !== undefined && !isFunction(props.onRegister)) return false;
  if (props.loading !== undefined && !isBoolean(props.loading)) return false;
  if (props.error !== undefined && !isString(props.error)) return false;
  return true;
};

export const validateAuthButtonProps = (props: AuthButtonProps): boolean => {
  if (typeof props !== "object" || props === null) return false;
  if (props.onClick !== undefined && !isFunction(props.onClick)) return false;
  if (props.loading !== undefined && !isBoolean(props.loading)) return false;
  if (props.variant !== undefined && !["login", "logout", "register"].includes(props.variant)) return false;
  if (props.children !== undefined && !isReactNode(props.children)) return false;
  return true;
};

export const validateProtectedRouteProps = (props: ProtectedRouteProps): boolean => {
  if (typeof props !== "object" || props === null) return false;
  if (!isReactNode(props.children)) return false;
  if (props.fallback !== undefined && !isReactNode(props.fallback)) return false;
  if (props.requireAuth !== undefined && !isBoolean(props.requireAuth)) return false;
  return true;
};
