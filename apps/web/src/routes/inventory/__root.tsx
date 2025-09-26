import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AlertTriangle, Package, ShoppingCart, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/inventory/__root')({
  component: InventoryRoot,
})

function InventoryRoot() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200'>
        <div className='flex items-center'>
          <Package className='h-8 w-8 text-blue-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-900'>Gestão de Estoque</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <AlertTriangle className='h-4 w-4' />
            <span>0 Alertas</span>
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <TrendingUp className='h-4 w-4' />
            <span>0 Itens Baixo</span>
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <ShoppingCart className='h-4 w-4' />
            <span>0 Pedidos</span>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
