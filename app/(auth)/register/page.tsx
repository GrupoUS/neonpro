'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  Shield,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Validation schema for registration
const registerSchema = z
  .object({
    // Personal Information
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),

    // Professional Information
    profession: z.enum(
      ['dermatologist', 'aesthetician', 'therapist', 'admin', 'receptionist'],
      {
        message: 'Selecione uma profissão',
      }
    ),
    crm: z.string().optional(),

    // Clinic Information
    clinicName: z
      .string()
      .min(2, 'Nome da clínica deve ter pelo menos 2 caracteres'),
    cnpj: z
      .string()
      .min(14, 'CNPJ deve ter 14 dígitos')
      .max(18, 'CNPJ inválido'),

    // Security
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter ao menos: 1 minúscula, 1 maiúscula, 1 número'
      ),
    confirmPassword: z.string(),

    // Terms and Privacy
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar a política de privacidade',
    }),
    marketingConsent: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      marketingConsent: false,
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement registration API call
      console.log('Registration data:', data);

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to email verification or dashboard
      // router.push('/auth/verify-email')
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const professionOptions = [
    { value: 'dermatologist', label: 'Dermatologista', icon: Stethoscope },
    { value: 'aesthetician', label: 'Esteticista', icon: Heart },
    { value: 'therapist', label: 'Terapeuta', icon: Users },
    { value: 'admin', label: 'Administrador', icon: Shield },
    { value: 'receptionist', label: 'Recepcionista', icon: UserPlus },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
              NeonPro
            </span>
          </div>
          <CardTitle className="font-bold text-2xl text-gray-900">
            Criar Conta Profissional
          </CardTitle>
          <CardDescription className="text-gray-600">
            Cadastre-se para começar a usar o NeonPro na sua clínica
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-lg">
                Informações Pessoais
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="name"
                  >
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="email"
                  >
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="cpf"
                  >
                    CPF *
                  </label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    className={errors.cpf ? 'border-red-500' : ''}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <p className="text-red-600 text-sm">{errors.cpf.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="phone"
                  >
                    Telefone *
                  </label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-lg">
                Informações Profissionais
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="profession"
                  >
                    Profissão *
                  </label>
                  <select
                    {...register('profession')}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.profession ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione sua profissão</option>
                    {professionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.profession && (
                    <p className="text-red-600 text-sm">
                      {errors.profession.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="crm"
                  >
                    CRM/COREN (se aplicável)
                  </label>
                  <Input
                    id="crm"
                    {...register('crm')}
                    className={errors.crm ? 'border-red-500' : ''}
                    placeholder="123456/SP"
                  />
                  {errors.crm && (
                    <p className="text-red-600 text-sm">{errors.crm.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Clinic Information */}
            <div className="space-y-4">
              <h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-lg">
                Informações da Clínica
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="clinicName"
                  >
                    Nome da Clínica *
                  </label>
                  <Input
                    id="clinicName"
                    {...register('clinicName')}
                    className={errors.clinicName ? 'border-red-500' : ''}
                    placeholder="Clínica de Estética"
                  />
                  {errors.clinicName && (
                    <p className="text-red-600 text-sm">
                      {errors.clinicName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="cnpj"
                  >
                    CNPJ *
                  </label>
                  <Input
                    id="cnpj"
                    {...register('cnpj')}
                    className={errors.cnpj ? 'border-red-500' : ''}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <p className="text-red-600 text-sm">
                      {errors.cnpj.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-lg">
                Segurança
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="password"
                  >
                    Senha *
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={
                        errors.password ? 'border-red-500 pr-10' : 'pr-10'
                      }
                      placeholder="Senha segura"
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    className="font-medium text-gray-700 text-sm"
                    htmlFor="confirmPassword"
                  >
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={
                        errors.confirmPassword
                          ? 'border-red-500 pr-10'
                          : 'pr-10'
                      }
                      placeholder="Confirme sua senha"
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      type="button"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-lg">
                Termos e Privacidade
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    className="text-gray-700 text-sm"
                    htmlFor="acceptTerms"
                  >
                    Eu aceito os{' '}
                    <Link
                      className="text-blue-600 hover:underline"
                      href="/terms"
                    >
                      Termos de Uso
                    </Link>{' '}
                    do NeonPro *
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="ml-7 text-red-600 text-sm">
                    {errors.acceptTerms.message}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    id="acceptPrivacy"
                    type="checkbox"
                    {...register('acceptPrivacy')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    className="text-gray-700 text-sm"
                    htmlFor="acceptPrivacy"
                  >
                    Eu aceito a{' '}
                    <Link
                      className="text-blue-600 hover:underline"
                      href="/privacy"
                    >
                      Política de Privacidade
                    </Link>{' '}
                    e o tratamento dos meus dados conforme a LGPD *
                  </label>
                </div>
                {errors.acceptPrivacy && (
                  <p className="ml-7 text-red-600 text-sm">
                    {errors.acceptPrivacy.message}
                  </p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    id="marketingConsent"
                    type="checkbox"
                    {...register('marketingConsent')}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    className="text-gray-700 text-sm"
                    htmlFor="marketingConsent"
                  >
                    Aceito receber comunicações de marketing e novidades do
                    NeonPro (opcional)
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-lg text-white hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Criando conta...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Criar Conta</span>
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="space-y-4 border-gray-200 border-t pt-6 text-center">
            <p className="text-gray-600 text-sm">
              Já tem uma conta?{' '}
              <Link
                className="font-medium text-blue-600 hover:underline"
                href="/login"
              >
                Fazer login
              </Link>
            </p>

            <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
              <Shield className="h-4 w-4" />
              <span>
                Seus dados estão protegidos com criptografia de ponta a ponta
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
