/**
 * @file Login Component
 * 
 * Healthcare-compliant login form with Better Auth integration
 * Supports email/password and Google OAuth authentication
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, CFM, WCAG 2.1 AA
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "@tanstack/react-router"
import { signIn } from "@/lib/auth/client"

interface LoginFormData {
  email: string
  password: string
}

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })
      
      if (result.error) {
        setError(result.error.message || "Erro ao fazer login")
        return
      }
      
      // Redirect to dashboard after successful login
      navigate({ to: "/dashboard" })
      
    } catch (err) {
      setError("Erro interno. Tente novamente.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      })
      
      if (result.error) {
        setError(result.error.message || "Erro ao fazer login com Google")
      }
      
    } catch (err) {
      setError("Erro interno. Tente novamente.")
      console.error("Google login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            NeonPro Login
          </h1>
          <p className="text-gray-600 mt-2">
            Acesse sua conta profissional de saúde
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="seu.email@clinica.com.br"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido"
                }
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("password", {
                required: "Senha é obrigatória",
                minLength: {
                  value: 8,
                  message: "Senha deve ter pelo menos 8 caracteres"
                }
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Ou continue com
              </span>
            </div>
          </div>
          
          <button
            type="button"
            className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Google"}
          </button>
        </div>
        
        <div className="text-center text-sm mt-4">
          <span className="text-gray-600">Não tem uma conta? </span>
          <Link
            to="/auth/register"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Registre-se
          </Link>
        </div>
        
        <div className="text-center text-sm mt-2">
          <Link
            to="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        
        {/* LGPD Compliance Notice */}
        <div className="text-xs text-gray-500 text-center mt-4 p-3 bg-gray-50 rounded">
          🛡️ Seus dados estão protegidos conforme a LGPD
        </div>
      </div>
    </div>
  )
}