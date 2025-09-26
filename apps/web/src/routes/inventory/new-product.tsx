import { apiClient as api } from '@/lib/api'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { logger } from '@/utils/logger'


export const Route = createFileRoute('/inventory/new-product')({
  component: NewProduct,
})

interface Category {
  id: string
  name: string
  description?: string
}

interface ProductFormData {
  name: string
  description: string
  sku: string
  barcode: string
  category_id: string
  unit_of_measure: string
  requires_refrigeration: boolean
  is_controlled_substance: boolean
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
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
}

function NewProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category_id: '',
    unit_of_measure: 'un',
    requires_refrigeration: false,
    is_controlled_substance: false,
    min_stock_level: 0,
    max_stock_level: 1000,
    reorder_point: 10,
    anvisa_registration: '',
    expiry_required: true,
    batch_tracking_required: true,
    contraindications: [],
    usage_instructions: '',
    storage_conditions: '',
    manufacturer: '',
    supplier: '',
    cost_price: 0,
    selling_price: 0,
    notes: '',
  })

  React.useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.inventory.getCategories.query()
      setCategories(response)
    } catch (error) {
      await logger.error('Error loading categories:')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.inventory.createProduct.mutate(formData)
      navigate({ to: '/inventory' })
    } catch (error) {
      await logger.error('Error creating product:')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = <T extends keyof ProductFormData>(field: T, value: ProductFormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addContraindication = () => {
    setFormData(prev => ({
      ...prev,
      contraindications: [...prev.contraindications, ''],
    }))
  }

  const removeContraindication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter((_, i) => i !== index),
    }))
  }

  const updateContraindication = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.map((item, i) => i === index ? value : item),
    }))
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Novo Produto</h1>
        <p className='text-gray-600'>Adicionar novo produto ao estoque</p>
      </div>

      <div className='bg-white rounded-lg shadow'>
        <form onSubmit={handleSubmit} className='space-y-6 p-6'>
          {/* Basic Information */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Informações Básicas</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='product-name' className='block text-sm font-medium text-gray-700 mb-1'>
                  Nome do Produto *
                </label>
                <input
                  id='product-name'
                  type='text'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor='product-sku' className='block text-sm font-medium text-gray-700 mb-1'>
                  SKU *
                </label>
                <input
                  id='product-sku'
                  type='text'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.sku}
                  onChange={e => handleInputChange('sku', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor='product-barcode' className='block text-sm font-medium text-gray-700 mb-1'>
                  Código de Barras
                </label>
                <input
                  id='product-barcode'
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.barcode}
                  onChange={e => handleInputChange('barcode', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor='product-category' className='block text-sm font-medium text-gray-700 mb-1'>
                  Categoria *
                </label>
                <select
                  id='product-category'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.category_id}
                  onChange={e => handleInputChange('category_id', e.target.value)}
                >
                  <option value=''>Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor='product-unit' className='block text-sm font-medium text-gray-700 mb-1'>
                  Unidade de Medida *
                </label>
                <select
                  id='product-unit'
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.unit_of_measure}
                  onChange={e => handleInputChange('unit_of_measure', e.target.value)}
                >
                  <option value='un'>Unidade</option>
                  <option value='ml'>Mililitro</option>
                  <option value='mg'>Miligrama</option>
                  <option value='g'>Grama</option>
                  <option value='kg'>Quilograma</option>
                  <option value='l'>Litro</option>
                </select>
              </div>
              <div>
                <label htmlFor='product-manufacturer' className='block text-sm font-medium text-gray-700 mb-1'>
                  Fabricante
                </label>
                <input
                  id='product-manufacturer'
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.manufacturer}
                  onChange={e => handleInputChange('manufacturer', e.target.value)}
                />
              </div>
            </div>
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Descrição
              </label>
              <textarea
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Stock Settings */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Configurações de Estoque</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estoque Mínimo
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.min_stock_level}
                  onChange={e => handleInputChange('min_stock_level', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Estoque Máximo
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.max_stock_level}
                  onChange={e => handleInputChange('max_stock_level', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Ponto de Reposição
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.reorder_point}
                  onChange={e => handleInputChange('reorder_point', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Preços</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Preço de Custo
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.cost_price}
                  onChange={e => handleInputChange('cost_price', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Preço de Venda
                </label>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.selling_price}
                  onChange={e => handleInputChange('selling_price', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Requisitos Especiais</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Registro ANVISA
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.anvisa_registration}
                  onChange={e => handleInputChange('anvisa_registration', e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Fornecedor
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.supplier}
                  onChange={e => handleInputChange('supplier', e.target.value)}
                />
              </div>
            </div>
            <div className='mt-4 space-y-4'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  checked={formData.requires_refrigeration}
                  onChange={e => handleInputChange('requires_refrigeration', e.target.checked)}
                />
                <label className='ml-2 block text-sm text-gray-700'>
                  Requer Refrigeração
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  checked={formData.is_controlled_substance}
                  onChange={e => handleInputChange('is_controlled_substance', e.target.checked)}
                />
                <label className='ml-2 block text-sm text-gray-700'>
                  Substância Controlada
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  checked={formData.expiry_required}
                  onChange={e => handleInputChange('expiry_required', e.target.checked)}
                />
                <label className='ml-2 block text-sm text-gray-700'>
                  Requer Validade
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  checked={formData.batch_tracking_required}
                  onChange={e => handleInputChange('batch_tracking_required', e.target.checked)}
                />
                <label className='ml-2 block text-sm text-gray-700'>
                  Rastreio por Lote
                </label>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Informações de Uso</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Instruções de Uso
                </label>
                <textarea
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.usage_instructions}
                  onChange={e => handleInputChange('usage_instructions', e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Condições de Armazenamento
                </label>
                <textarea
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  value={formData.storage_conditions}
                  onChange={e => handleInputChange('storage_conditions', e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Contraindicações
                </label>
                <div className='space-y-2'>
                  {formData.contraindications.map((contraindication, index) => (
                    <div key={`contraindication-${index}`} className='flex items-center space-x-2'>
                      <input
                        type='text'
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                        value={contraindication}
                        onChange={e =>
                          updateContraindication(index, e.target.value)}
                        placeholder='Adicionar contraindicação'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          removeContraindication(index)}
                        className='p-2 text-red-600 hover:text-red-800'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={addContraindication}
                    className='flex items-center text-blue-600 hover:text-blue-800'
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Adicionar Contraindicação
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Observações
            </label>
            <textarea
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => navigate({ to: '/inventory' })}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'
            >
              <X className='h-4 w-4 mr-2 inline' />
              Cancelar
            </button>
            <button
              type='submit'
              className='px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
            >
              <Save className='h-4 w-4 mr-2 inline' />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
