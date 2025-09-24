import { api } from '@/lib/api'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Truck,
} from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

export const Route = (createFileRoute as any)('/inventory/product/$productId')({
  component: ProductDetail,
})

interface Product {
  id: string
  name: string
  description: string
  sku: string
  barcode: string
  category_name: string
  unit_of_measure: string
  current_stock: number
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  requires_refrigeration: boolean
  is_controlled_substance: boolean
  anvisa_registration: string
  expiry_required: boolean
  batch_tracking_required: boolean
  contraindications: string[]
  usage_instructions: string
  storage_conditions: string
  manufacturer: string
  supplier: string
  cost_price: number
  selling_price: number
  notes: string
  status: 'normal' | 'low_stock' | 'expiring_soon' | 'out_of_stock'
  created_at: string
  updated_at: string
}

interface Batch {
  id: string
  batch_number: string
  expiry_date: string
  initial_quantity: number
  current_quantity: number
  unit_cost: number
  received_date: string
  status: 'active' | 'expiring_soon' | 'expired' | 'depleted'
}

interface Transaction {
  id: string
  transaction_type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  created_at: string
  user_name: string
  batch_number?: string
}

function ProductDetail() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'transactions'>('overview')

  React.useEffect(() => {
    loadProductData()
  }, [productId])

  const loadProductData = async () => {
    try {
      const [productResponse, batchesResponse, transactionsResponse] = await Promise.all([
        api.inventory.getProductById.query({ id: productId }),
        api.inventory.getProductBatches.query({ productId }),
        api.inventory.getProductTransactions.query({ productId }),
      ])

      setProduct(productResponse)
      setBatches(batchesResponse)
      setTransactions(transactionsResponse)
    } catch (error) {
      console.error('Error loading product data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'expiring_soon':
        return 'bg-orange-100 text-orange-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'low_stock':
        return 'Estoque Baixo'
      case 'expiring_soon':
        return 'Vencendo em Breve'
      case 'out_of_stock':
        return 'Sem Estoque'
      default:
        return 'Normal'
    }
  }

  const getBatchStatusColor = (status: Batch['status']) => {
    switch (status) {
      case 'expiring_soon':
        return 'bg-orange-100 text-orange-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'depleted':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getTransactionTypeColor = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800'
      case 'out':
        return 'bg-blue-100 text-blue-800'
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.',
      )
    ) {
      return
    }

    try {
      await api.inventory.deleteProduct.mutate({ id: productId })
      navigate({ to: '/dashboard' })
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <RefreshCw className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    )
  }

  if (!product) {
    return (
      <div className='p-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Produto não encontrado</h1>
          <Link
            to='/dashboard'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar para Estoque
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link
            to='/dashboard'
            className='flex items-center text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>
            <p className='text-gray-600'>SKU: {product.sku}</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getStatusColor(product.status)
            }`}
          >
            {getStatusText(product.status)}
          </span>
          {product.requires_refrigeration && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
              Refrigeração
            </span>
          )}
          {product.is_controlled_substance && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
              Controlado
            </span>
          )}
          <Link
            to='/dashboard'
            className='p-2 text-gray-400 hover:text-gray-600'
          >
            <Edit className='h-4 w-4' />
          </Link>
          <button
            onClick={handleDelete}
            className='p-2 text-red-400 hover:text-red-600'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <Package className='h-8 w-8 text-blue-600' />
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Estoque Atual
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {product.current_stock} {product.unit_of_measure}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <AlertTriangle className='h-8 w-8 text-yellow-600' />
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Estoque Mínimo
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {product.min_stock_level} {product.unit_of_measure}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <TrendingUp className='h-8 w-8 text-green-600' />
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Preço de Venda
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  R$ {product.selling_price.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <Truck className='h-8 w-8 text-purple-600' />
            <div className='ml-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>
                  Lotes Ativos
                </dt>
                <dd className='text-2xl font-semibold text-gray-900'>
                  {batches.filter(b => b.status === 'active').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-lg shadow'>
        <div className='border-b border-gray-200'>
          <nav className='flex -mb-px'>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Visão Geral
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'batches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('batches')}
            >
              Lotes ({batches.length})
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Movimentações ({transactions.length})
            </button>
          </nav>
        </div>

        <div className='p-6'>
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Informações Básicas</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Categoria</p>
                    <p className='text-sm font-medium text-gray-900'>{product.category_name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Fabricante</p>
                    <p className='text-sm font-medium text-gray-900'>{product.manufacturer}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Fornecedor</p>
                    <p className='text-sm font-medium text-gray-900'>{product.supplier}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Unidade de Medida</p>
                    <p className='text-sm font-medium text-gray-900'>{product.unit_of_measure}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Registro ANVISA</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {product.anvisa_registration || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Código de Barras</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {product.barcode || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Descrição</h3>
                <p className='text-sm text-gray-900'>{product.description || 'Sem descrição'}</p>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Configurações de Estoque</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Estoque Mínimo</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {product.min_stock_level} {product.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Estoque Máximo</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {product.max_stock_level} {product.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Ponto de Reposição</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {product.reorder_point} {product.unit_of_measure}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Informações de Uso</h3>
                <div className='space-y-3'>
                  {product.usage_instructions && (
                    <div>
                      <p className='text-sm text-gray-500'>Instruções de Uso</p>
                      <p className='text-sm text-gray-900'>{product.usage_instructions}</p>
                    </div>
                  )}
                  {product.storage_conditions && (
                    <div>
                      <p className='text-sm text-gray-500'>Condições de Armazenamento</p>
                      <p className='text-sm text-gray-900'>{product.storage_conditions}</p>
                    </div>
                  )}
                  {product.contraindications.length > 0 && (
                    <div>
                      <p className='text-sm text-gray-500'>Contraindicações</p>
                      <ul className='list-disc list-inside text-sm text-gray-900'>
                        {product.contraindications.map((contraindication, index) => (
                          <li key={index}>{contraindication}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {product.notes && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>Observações</h3>
                  <p className='text-sm text-gray-900'>{product.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batches' && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>Lotes do Produto</h3>
                <Link
                  to='/dashboard'
                  className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Adicionar Lote
                </Link>
              </div>
              <div className='divide-y divide-gray-200'>
                {batches.map(batch => (
                  <div key={batch.id} className='py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{batch.batch_number}</p>
                          <p className='text-sm text-gray-500'>
                            Validade: {new Date(batch.expiry_date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Recebido: {new Date(batch.received_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getBatchStatusColor(batch.status)
                          }`}
                        >
                          {batch.status === 'active'
                            ? 'Ativo'
                            : batch.status === 'expiring_soon'
                            ? 'Vencendo em Breve'
                            : batch.status === 'expired'
                            ? 'Vencido'
                            : 'Esgotado'}
                        </span>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium text-gray-900'>
                          {batch.current_quantity} {product.unit_of_measure}
                        </p>
                        <p className='text-sm text-gray-500'>
                          de {batch.initial_quantity} {product.unit_of_measure}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Custo: R$ {batch.unit_cost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900'>Histórico de Movimentações</h3>
              <div className='divide-y divide-gray-200'>
                {transactions.map(transaction => (
                  <div key={transaction.id} className='py-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getTransactionTypeColor(transaction.transaction_type)
                          }`}
                        >
                          {transaction.transaction_type === 'in'
                            ? 'Entrada'
                            : transaction.transaction_type === 'out'
                            ? 'Saída'
                            : 'Ajuste'}
                        </span>
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{transaction.reason}</p>
                          <p className='text-sm text-gray-500'>
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(transaction.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                          <p className='text-sm text-gray-500'>Por: {transaction.user_name}</p>
                          {transaction.batch_number && (
                            <p className='text-sm text-gray-500'>
                              Lote: {transaction.batch_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='text-right'>
                        <p
                          className={`text-sm font-medium ${
                            transaction.transaction_type === 'in'
                              ? 'text-green-600'
                              : transaction.transaction_type === 'out'
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {transaction.transaction_type === 'in'
                            ? '+'
                            : transaction.transaction_type === 'out'
                            ? '-'
                            : ''}
                          {Math.abs(transaction.quantity)} {product.unit_of_measure}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
