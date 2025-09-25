import { createFileRoute, redirect } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: () => {
    // Redirect to login page
    throw redirect({
      to: '/auth/login',
    })
  },
})

function Home() {
  // This component won't be rendered due to the redirect
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='text-center'>
        <div className='mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4'>
          <Building2 className='h-10 w-10 text-white' />
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          NeonPro Healthcare
        </h1>
        <p className='text-xl text-gray-600 mb-8'>
          Plataforma para clínicas de estética brasileiras
        </p>
        <div className='animate-pulse'>
          <p className='text-blue-600'>Redirecionando para login...</p>
        </div>
      </div>
    </div>
  )
}
