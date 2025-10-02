import { useAuth } from '@/contexts/AuthContext.tsx'
import type { AuthCredentials, SignUpData } from '@neonpro/types'

/**
 * @file useAuth.ts
 * 
 * Simplified authentication hooks for NeonPro platform
 * Provides healthcare-compliant authentication with LGPD compliance
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @healthcare-compliance LGPD, ANVISA, CFM
 */

// Re-export do hook principal
export { useAuth }

/**
 * Simplified login hook for healthcare professionals
 * Provides secure authentication with proper error handling
 * 
 * @healthcare-compliance LGPD: Secure credential handling
 * @healthcare-compliance ANVISA: Audit trail for login attempts
 * 
 * @returns {Object} Login functionality
 * @returns {Function} login - Async function to authenticate user
 * @returns {boolean} isLoading - Loading state for login process
 * 
 * @example
 * ```typescript
 * const { login, isLoading } = useLogin()
 * const result = await login('user@clinic.com', 'password123')
 * ```
 */
export const useLogin = () => {
  const { signIn, isLoading } = useAuth()

  /**
   * Authenticate user with provided credentials
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<any>} Authentication result
   * @throws {Error} When authentication fails
   * 
   * @healthcare-compliance LGPD: Secure credential transmission
   * @healthcare-compliance Security: No credential logging
   */
  const login = async (email: string, password: string) => {
    const credentials: AuthCredentials = { email, password }
    return await signIn(credentials)
  }

  return { login, isLoading }
}

/**
 * Simplified signup hook for healthcare professionals
 * Handles user registration with healthcare compliance validation
 * 
 * @healthcare-compliance LGPD: Consent tracking during registration
 * @healthcare-compliance ANVISA: Professional license validation
 * @healthcare-compliance CFM: Medical professional verification
 * 
 * @returns {Object} Registration functionality
 * @returns {Function} register - Async function to register new user
 * @returns {boolean} isLoading - Loading state for registration process
 * 
 * @example
 * ```typescript
 * const { register, isLoading } = useSignUp()
 * const result = await register(
 *   'user@clinic.com',
 *   'password123',
 *   'John',
 *   'Doe',
 *   'medico',
 *   'CRM 12345/SP'
 * )
 * ```
 */
export const useSignUp = () => {
  const { signUp, isLoading } = useAuth()

  /**
   * Register new healthcare professional user
   * 
   * @param {string} email - User's professional email address
   * @param {string} password - User's secure password
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @param {string} profession - User's healthcare profession
   * @param {string} [license] - Professional license (required for most healthcare roles)
   * @returns {Promise<any>} Registration result
   * @throws {Error} When registration fails or validation fails
   * 
   * @healthcare-compliance LGPD: Explicit consent tracking
   * @healthcare-compliance Security: Password strength enforcement
   * @healthcare-compliance ANVISA: Professional license validation
   */
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profession: string,
    license?: string
  ) => {
    const data: SignUpData = {
      email,
      password,
      firstName,
      lastName,
      profession,
      license,
    }
    return await signUp(data)
  }

  return { register, isLoading }
}

/**
 * Logout hook for secure session termination
 * Handles user logout with proper cleanup and audit logging
 * 
 * @healthcare-compliance LGPD: Session cleanup and data retention
 * @healthcare-compliance Security: Secure session termination
 * 
 * @returns {Object} Logout functionality
 * @returns {Function} logout - Async function to terminate user session
 * @returns {boolean} isLoading - Loading state for logout process
 * 
 * @example
 * ```typescript
 * const { logout, isLoading } = useLogout()
 * await logout()
 * ```
 */
export const useLogout = () => {
  const { signOut, isLoading } = useAuth()

  /**
   * Terminate user session securely
   * Performs cleanup operations and audit logging
   * 
   * @returns {Promise<any>} Logout result
   * 
   * @healthcare-compliance LGPD: Session data cleanup
   * @healthcare-compliance Security: Secure session termination
   * @healthcare-compliance Audit: Logout event logging
   */
  const logout = async () => {
    return await signOut()
  }

  return { logout, isLoading }
}

/**
 * Authentication status hook for healthcare applications
 * Provides comprehensive authentication state with healthcare-specific logic
 * 
 * @healthcare-compliance LGPD: User status verification
 * @healthcare-compliance ANVISA: Healthcare professional status tracking
 * 
 * @returns {Object} Authentication status information
 * @returns {Object|null} user - Current authenticated user data
 * @returns {boolean} isAuthenticated - User authentication status
 * @returns {boolean} isLoggedIn - Alias for isAuthenticated
 * @returns {boolean} isEmailVerified - Email verification status
 * @returns {boolean} isLoading - Loading state for status checks
 * @returns {boolean} hasProfile - Whether user has complete profile
 * @returns {boolean} isProfessional - Whether user is healthcare professional
 * 
 * @example
 * ```typescript
 * const { 
 *   user, 
 *   isAuthenticated, 
 *   isProfessional,
 *   hasProfile 
 * } = useAuthStatus()
 * 
 * if (isAuthenticated && isProfessional) {
 *   // Render professional dashboard
 * }
 * ```
 */
export const useAuthStatus = () => {
  const { user, isAuthenticated, isEmailVerified, isLoading } = useAuth()

  return {
    user,
    isAuthenticated,
    isLoggedIn: isAuthenticated,
    isEmailVerified,
    isLoading,
    hasProfile: !!user?.firstName && !!user?.lastName,
    isProfessional: !!user?.profession && user.profession !== 'admin',
  }
}
