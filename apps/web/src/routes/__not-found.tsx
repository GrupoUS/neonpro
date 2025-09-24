import { Link } from '@tanstack/react-router';
import { Home, Search } from 'lucide-react';
import * as React from 'react';

export function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full text-center'>
        <div className='mx-auto h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-6'>
          <Search className='h-8 w-8 text-gray-500' />
        </div>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
          Página não encontrada
        </h2>
        <p className='text-gray-600 mb-8'>
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <div className='space-y-4'>
          <Link
            to='/'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            <Home className='h-5 w-5 mr-2' />
            Voltar para o início
          </Link>
          <div>
            <Link
              to='/auth/login'
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Ir para login
            </Link>
            {' | '}
            <Link
              to='/dashboard'
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Ir para dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
