/**
 * Auth Components - UI components for authentication
 * @package @neonpro/auth
 */

import type { ComponentType } from 'react';

// Define component types that will be implemented in the web app
export interface LoginFormProps {
  onLogin?: (credentials: { email: string; password: string; }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface RegisterFormProps {
  onRegister?: (data: { email: string; password: string; name: string; }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface AuthButtonProps {
  onClick?: () => void;
  loading?: boolean;
  variant?: 'login' | 'logout' | 'register';
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
  LoginForm: undefined as LoginForm | null,
  RegisterForm: undefined as RegisterForm | null,
  AuthButton: undefined as AuthButton | null,
  ProtectedRoute: undefined as ProtectedRoute | null,
};

// Component registration utility
export function registerAuthComponents(components: Partial<typeof AuthComponents>) {
  Object.assign(AuthComponents, components);
}

// Validation helpers for component props
export const validateLoginFormProps = (props: LoginFormProps): boolean => {
  return typeof props === 'object' && props !== null;
};

export const validateRegisterFormProps = (props: RegisterFormProps): boolean => {
  return typeof props === 'object' && props !== null;
};

export const validateAuthButtonProps = (props: AuthButtonProps): boolean => {
  return typeof props === 'object' && props !== null;
};

export const validateProtectedRouteProps = (props: ProtectedRouteProps): boolean => {
  return typeof props === 'object' && props !== null && props.children !== undefined;
};
