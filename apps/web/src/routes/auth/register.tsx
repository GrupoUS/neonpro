import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    clinicName: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to login after successful registration
      window.location.href = '/auth/login';
    }, 2000);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Building2 className='h-8 w-8 text-white' />
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>Criar Conta</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Junte-se ao NeonPro Healthcare
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                Nome completo
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Seu nome completo'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email profissional
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='seu@email.com'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700'
              >
                Telefone
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Phone className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  required
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='(11) 99999-9999'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='clinicName'
                className='block text-sm font-medium text-gray-700'
              >
                Nome da clínica
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Building2 className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='clinicName'
                  name='clinicName'
                  type='text'
                  required
                  value={formData.clinicName}
                  onChange={e => handleChange('clinicName', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Nome da sua clínica'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Senha
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff className='h-5 w-5 text-gray-400' />
                    : <Eye className='h-5 w-5 text-gray-400' />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'
              >
                Confirmar senha
              </label>
              <div className='mt-1 relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword
                    ? <EyeOff className='h-5 w-5 text-gray-400' />
                    : <Eye className='h-5 w-5 text-gray-400' />}
                </button>
              </div>
            </div>
          </div>

          <div className='flex items-center'>
            <input
              id='accept-terms'
              name='acceptTerms'
              type='checkbox'
              required
              checked={formData.acceptTerms}
              onChange={e => handleChange('acceptTerms', e.target.checked)}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='accept-terms'
              className='ml-2 block text-sm text-gray-900'
            >
              Eu concordo com os{' '}
              <a href='#' className='text-blue-600 hover:text-blue-500'>
                Termos de Serviço
              </a>{' '}
              e{' '}
              <a href='#' className='text-blue-600 hover:text-blue-500'>
                Política de Privacidade
              </a>
            </label>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading || !formData.acceptTerms}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading
                ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'>
                    </div>
                    Criando conta...
                  </div>
                )
                : (
                  'Criar Conta'
                )}
            </button>
          </div>

          <div className='text-center'>
            <span className='text-sm text-gray-600'>
              Já tem uma conta?{' '}
              <Link
                to='/auth/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Faça login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
