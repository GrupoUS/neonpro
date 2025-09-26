/**
 * Basic Inventory Management Service
 * Simplified implementation for healthcare core package
 */

// Category Management Interfaces
export interface CreateCategoryInput {
  clinicId: string
  name: string
  description?: string
  color?: string
  isActive?: boolean
}

export interface Category {
  id: string
  clinicId: string
  name: string
  description?: string
  color?: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
  color?: string
  isActive?: boolean
}

// Product Management Interfaces
export interface CreateProductInput {
  clinicId: string
  categoryId: string
  name: string
  description?: string
  sku: string
  price: number
  stock: number
  minStock: number
  maxStock?: number
  unit: string
  requiresPrescription: boolean
  storageConditions?: string
  isActive?: boolean
}

export interface Product {
  id: string
  clinicId: string
  categoryId: string
  name: string
  description?: string
  sku: string
  price: number
  stock: number
  minStock: number
  maxStock?: number
  unit: string
  requiresPrescription: boolean
  storageConditions?: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface UpdateProductInput {
  categoryId?: string
  name?: string
  description?: string
  sku?: string
  price?: number
  minStock?: number
  maxStock?: number
  unit?: string
  requiresPrescription?: boolean
  storageConditions?: string
  isActive?: boolean
}

export interface StockUpdate {
  id: string
  previousStock: number
  newStock: number
  operation: 'add' | 'subtract'
  quantity: number
  updatedAt: Date
}

// Batch Management Interfaces
export interface CreateBatchInput {
  productId: string
  batchNumber: string
  expiryDate: Date
  quantity: number
  supplierId?: string
  manufacturingDate?: Date
  receivedAt: Date
  qualityCheck?: boolean
  notes?: string
}

export interface InventoryBatch {
  id: string
  productId: string
  batchNumber: string
  expiryDate: Date
  quantity: number
  supplierId?: string
  manufacturingDate?: Date
  receivedAt: Date
  qualityCheck: boolean
  notes?: string
  createdAt: Date
}

// Stock Movement Interfaces
export interface StockMovementInput {
  productId: string
  batchId?: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  referenceId?: string
  performedBy?: string
  notes?: string
}

export interface StockMovement {
  id: string
  productId: string
  batchId?: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  referenceId?: string
  performedBy?: string
  notes?: string
  timestamp: Date
}

// Low Stock Alert Interfaces
export interface LowStockItem {
  productId: string
  name: string
  currentStock: number
  minStock: number
  reorderQuantity: number
  daysOfStock?: number
  lastOrderDate?: Date
}

// Report Interfaces
export interface InventoryReport {
  clinicId: string
  totalProducts: number
  totalStockValue: number
  lowStockItems: number
  expiringSoon: number
  outOfStock: number
  generatedAt: Date
}

export interface CategoryValue {
  categoryId: string
  categoryName: string
  totalValue: number
  productCount: number
}

// Supplier Management Interfaces
export interface CreateSupplierInput {
  clinicId: string
  name: string
  contact: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  paymentTerms?: string
  isActive?: boolean
}

export interface Supplier {
  id: string
  clinicId: string
  name: string
  contact: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  paymentTerms?: string
  isActive: boolean
  products: string[]
  createdAt: Date
  updatedAt?: Date
}

// Purchase Order Interfaces
export interface CreatePurchaseOrderInput {
  clinicId: string
  supplierId: string
  items: PurchaseOrderItem[]
  totalAmount: number
  expectedDelivery?: Date
  notes?: string
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
}

export interface PurchaseOrderItem {
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseOrder {
  id: string
  clinicId: string
  supplierId: string
  items: PurchaseOrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: Date
  expectedDelivery?: Date
  actualDelivery?: Date
  notes?: string
  createdAt: Date
  updatedAt?: Date
}

export class InventoryManagementService {
  // private supabaseUrl: string
  // private supabaseKey: string

  constructor(config: { supabaseUrl: string; supabaseKey: string }) {
    // this.supabaseUrl = config.supabaseUrl
    // this.supabaseKey = config.supabaseKey
    console.log('InventoryManagementService initialized with:', config.supabaseUrl)
  }

  // Categories Management
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    return {
      id: `category_${Date.now()}`,
      clinicId: data.clinicId,
      ...data,
      isActive: data.isActive ?? true,
      createdAt: new Date()
    } as Category
  }

  async getCategories(): Promise<Category[]> {
    return [
      {
        id: 'category_1',
        clinicId: 'clinic_1',
        name: 'Cosméticos',
        description: 'Produtos para tratamento de pele',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'category_2',
        clinicId: 'clinic_1',
        name: 'Injetáveis',
        description: 'Botox, preenchimentos',
        isActive: true,
        createdAt: new Date()
      }
    ] as Category[]
  }

  async updateCategory(categoryId: string, data: UpdateCategoryInput): Promise<Category> {
    return {
      id: categoryId,
      clinicId: 'clinic_1',
      name: data.name || '',
      ...data,
      updatedAt: new Date()
    } as Category
  }

  // Products Management
  async createProduct(data: CreateProductInput): Promise<Product> {
    return {
      id: `product_${Date.now()}`,
      ...data,
      isActive: data.isActive ?? true,
      createdAt: new Date()
    } as Product
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    const products: Product[] = [
      {
        id: 'product_1',
        clinicId: 'clinic_1',
        categoryId: 'category_1',
        name: 'Ácido Hialurônico',
        description: 'Ácido hialurônico para preenchimento',
        sku: 'AH001',
        price: 250,
        stock: 15,
        minStock: 5,
        maxStock: 50,
        unit: 'ml',
        requiresPrescription: true,
        storageConditions: 'Refrigerar entre 2-8°C',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'product_2',
        clinicId: 'clinic_1',
        categoryId: 'category_2',
        name: 'Botox',
        description: 'Toxina botulínica tipo A',
        sku: 'BT001',
        price: 800,
        stock: 8,
        minStock: 3,
        maxStock: 20,
        unit: 'unidade',
        requiresPrescription: true,
        storageConditions: 'Refrigerar entre 2-8°C',
        isActive: true,
        createdAt: new Date()
      }
    ]

    return categoryId ? products.filter(p => p.categoryId === categoryId) : products
  }

  async updateProduct(productId: string, data: UpdateProductInput): Promise<Product> {
    return {
      id: productId,
      clinicId: 'clinic_1',
      categoryId: data.categoryId || 'category_1',
      name: data.name || '',
      ...data,
      updatedAt: new Date()
    } as Product
  }

  async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract') {
    const product = await this.getProduct(productId)
    const newStock = operation === 'add' ? product.stock + quantity : Math.max(0, product.stock - quantity)
    
    return {
      id: productId,
      previousStock: product.stock,
      newStock,
      operation,
      quantity,
      updatedAt: new Date()
    }
  }

  private async getProduct(productId: string) {
    const products = await this.getProducts()
    return products.find(p => p.id === productId) || { stock: 0 }
  }

  // Inventory Batches
  async createBatch(data: CreateBatchInput): Promise<InventoryBatch> {
    return {
      id: `batch_${Date.now()}`,
      ...data,
      qualityCheck: data.qualityCheck ?? true,
      createdAt: new Date()
    } as InventoryBatch
  }

  async getBatches(productId?: string): Promise<InventoryBatch[]> {
    const batches: InventoryBatch[] = [
      {
        id: 'batch_1',
        productId: 'product_1',
        batchNumber: 'AH001-2024-001',
        expiryDate: new Date(Date.now() + 365 * 86400000),
        quantity: 10,
        receivedAt: new Date(Date.now() - 30 * 86400000),
        qualityCheck: true,
        createdAt: new Date(Date.now() - 30 * 86400000)
      }
    ]

    return productId ? batches.filter(b => b.productId === productId) : batches
  }

  // Low Stock Alerts
  async getLowStockItems(): Promise<LowStockItem[]> {
    const products = await this.getProducts()
    return products.filter(p => p.stock <= p.minStock).map(p => ({
      productId: p.id,
      name: p.name,
      currentStock: p.stock,
      minStock: p.minStock,
      reorderQuantity: p.minStock * 2,
      daysOfStock: Math.floor(p.stock / (p.minStock * 0.1))
    }))
  }

  // Stock Movement History
  async recordStockMovement(data: StockMovementInput): Promise<StockMovement> {
    return {
      id: `movement_${Date.now()}`,
      ...data,
      timestamp: new Date()
    } as StockMovement
  }

  async getStockHistory(productId: string, limit: number = 50): Promise<StockMovement[]> {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `movement_${i}`,
      productId,
      type: ['in', 'out', 'adjustment'][i % 3] as 'in' | 'out' | 'adjustment',
      quantity: Math.floor(Math.random() * 10) + 1,
      reason: ['Purchase', 'Usage', 'Adjustment', 'Return'][i % 4],
      timestamp: new Date(Date.now() - i * 86400000)
    })) as StockMovement[]
  }

  // Inventory Reports
  async getInventoryReport(clinicId: string): Promise<InventoryReport> {
    const products = await this.getProducts()
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

    return {
      clinicId,
      totalProducts: products.length,
      totalStockValue: totalValue,
      lowStockItems: products.filter(p => p.stock <= p.minStock).length,
      expiringSoon: 2,
      outOfStock: products.filter(p => p.stock === 0).length,
      generatedAt: new Date()
    } as InventoryReport
  }

  async getInventoryValueByCategory(): Promise<CategoryValue[]> {
    const products = await this.getProducts()
    const categories = await this.getCategories()

    return categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id)
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalValue,
        productCount: categoryProducts.length
      }
    }) as CategoryValue[]
  }

  // Supplier Management
  async createSupplier(data: CreateSupplierInput): Promise<Supplier> {
    return {
      id: `supplier_${Date.now()}`,
      ...data,
      isActive: data.isActive ?? true,
      products: [],
      createdAt: new Date()
    } as Supplier
  }

  async getSuppliers(): Promise<Supplier[]> {
    return [
      {
        id: 'supplier_1',
        clinicId: 'clinic_1',
        name: 'Dermocosméticos LTDA',
        contact: 'contato@dermo.com.br',
        email: 'vendas@dermo.com.br',
        phone: '+55 11 9999-8888',
        address: 'Av. Paulista, 1000 - São Paulo/SP',
        taxId: '12.345.678/0001-00',
        paymentTerms: '30 dias',
        isActive: true,
        products: ['product_1', 'product_2'],
        createdAt: new Date()
      }
    ] as Supplier[]
  }

  // Purchase Orders
  async createPurchaseOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    return {
      id: `po_${Date.now()}`,
      ...data,
      status: data.status || 'pending',
      orderDate: new Date(),
      createdAt: new Date()
    } as PurchaseOrder
  }

  async getPurchaseOrders(status?: string): Promise<PurchaseOrder[]> {
    const orders: PurchaseOrder[] = [
      {
        id: 'po_1',
        clinicId: 'clinic_1',
        supplierId: 'supplier_1',
        items: [
          { productId: 'product_1', quantity: 5, unitPrice: 250, totalPrice: 1250 },
          { productId: 'product_2', quantity: 1, unitPrice: 250, totalPrice: 250 }
        ],
        totalAmount: 1500,
        status: 'pending',
        orderDate: new Date(Date.now() - 7 * 86400000),
        expectedDelivery: new Date(Date.now() + 14 * 86400000),
        createdAt: new Date(Date.now() - 7 * 86400000)
      }
    ]

    return status ? orders.filter(o => o.status === status) : orders
  }
}