import { useAuth } from '@/contexts/AuthContext'
import type { AuthCredentials, SignUpData } from '@neonpro/types'

// Re-export do hook principal
export { useAuth }

// Hook simplificado para login
export const useLogin = () => {
  const { signIn, isLoading } = useAuth()
  
  const login = async (email: string, password: string) => {
    const credentials: AuthCredentials = { email, password }
    return await signIn(credentials)
  }
  
  return { login, isLoading }
}

// Hook simplificado para cadastro
export const useSignUp = () => {
  const { signUp, isLoading } = useAuth()
  
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

// Hook para logout
export const useLogout = () => {
  const { signOut, isLoading } = useAuth()
  
  const logout = async () => {
    return await signOut()
  }
  
  return { logout, isLoading }
}

// Hook para verificar status de autenticação
export const useAuthStatus = () => {
  const { user, isAuthenticated, isEmailVerified, isLoading } = useAuth()
  
  return {
    user,
    isLoggedIn: isAuthenticated,
    isEmailVerified,
    isLoading,
    hasProfile: !!user?.firstName && !!user?.lastName,
    isProfessional: !!user?.profession && user.profession !== 'admin',
  }
}