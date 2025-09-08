'use client'

import { zodResolver, } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus, } from 'lucide-react'
import Link from 'next/link'
import { useRouter, } from 'next/navigation'
import { useState, } from 'react'
import { useForm, } from 'react-hook-form'

import { LoadingButton, } from '@/components/ui/loading'
import { useAuth, } from '@/hooks/use-auth'
import { RegisterSchema, } from '@/lib/validations'
import type { RegisterInput, } from '@/lib/validations'

export default function RegisterPage() {
  const [showPassword, setShowPassword,] = useState(false,)
  const [showConfirmPassword, setShowConfirmPassword,] = useState(false,)
  const { login, } = useAuth() // Will register then auto-login
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema,),
  },)

  const onSubmit = async (data: RegisterInput,) => {
    try {
      // TODO: Implement registration API call
      // For now, simulate registration
      // console.log("Registration data:", data);

      // After successful registration, auto-login
      await login(data.email, data.password,)
      router.push('/dashboard',)
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Erro ao criar conta',
      },)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-6">
        <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="text-gray-600 mt-2">Cadastre-se como profissional</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit,)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome completo
          </label>
          <input
            {...register('name',)}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Seu nome completo"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email profissional
          </label>
          <input
            {...register('email',)}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Senha
          </label>
          <div className="relative">
            <input
              {...register('password',)}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword,)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword
                ? <EyeOff className="h-4 w-4 text-gray-400" />
                : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmar senha
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword',)}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword,)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirmPassword
                ? <EyeOff className="h-4 w-4 text-gray-400" />
                : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-xs text-blue-600">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade,
            incluindo as diretrizes LGPD para proteção de dados.
          </p>
        </div>

        <LoadingButton isLoading={isSubmitting} className="w-full">
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </LoadingButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
