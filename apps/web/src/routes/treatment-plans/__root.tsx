import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Calendar, FileText, Target, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/treatment-plans/__root')({
  component: TreatmentPlansRoot,
})

function TreatmentPlansRoot() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200'>
        <div className='flex items-center'>
          <FileText className='h-8 w-8 text-blue-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-900'>Planos de Tratamento</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <Calendar className='h-4 w-4' />
            <span>0 Ativos</span>
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <Target className='h-4 w-4' />
            <span>0 Pendentes</span>
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <TrendingUp className='h-4 w-4' />
            <span>0 Concluídos</span>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
