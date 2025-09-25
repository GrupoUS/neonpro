/**
 * Basic Inventory Management Service
 * Simplified implementation for healthcare core package
 */

export class InventoryManagementService {
  private supabaseUrl: string
  private supabaseKey: string

  constructor(config: { supabaseUrl: string; supabaseKey: string }) {
    this.supabaseUrl = config.supabaseUrl
    this.supabaseKey = config.supabaseKey
  }

  // Categories Management
  async createCategory(data: any) {
    return {
      id: `category_${Date.now()}`,
      ...data,
      createdAt: new Date()
    }
  }

  async getCategories() {
    return [
      {
        id: 'category_1',
        name: 'Cosméticos',
        description: 'Produtos para tratamento de pele',
        createdAt: new Date()
      },
      {
        id: 'category_2',
        name: 'Injetáveis',
        description: 'Botox, preenchimentos',
        createdAt: new Date()
      }
    ]
  }

  async updateCategory(categoryId: string, data: any) {
    return {
      id: categoryId,
      ...data,
      updatedAt: new Date()
    }
  }

  // Products Management
  async createProduct(data: any) {
    return {
      id: `product_${Date.now()}`,
      ...data,
      createdAt: new Date()
    }
  }

  async getProducts(categoryId?: string) {
    const products = [
      {
        id: 'product_1',
        categoryId: 'category_1',
        name: 'Ácido Hialurônico',
        sku: 'AH001',
        price: 250,
        stock: 15,
        minStock: 5,
        unit: 'ml'
      },
      {
        id: 'product_2',
        categoryId: 'category_2',
        name: 'Botox',
        sku: 'BT001',
        price: 800,
        stock: 8,
        minStock: 3,
        unit: 'unidade'
      }
    ]
    
    return categoryId ? products.filter(p => p.categoryId === categoryId) : products
  }

  async updateProduct(productId: string, data: any) {
    return {
      id: productId,
      ...data,
      updatedAt: new Date()
    }
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
  async createBatch(data: any) {
    return {
      id: `batch_${Date.now()}`,
      ...data,
      createdAt: new Date()
    }
  }

  async getBatches(productId?: string) {
    const batches = [
      {
        id: 'batch_1',
        productId: 'product_1',
        batchNumber: 'AH001-2024-001',
        expiryDate: new Date(Date.now() + 365 * 86400000),
        quantity: 10,
        receivedAt: new Date(Date.now() - 30 * 86400000)
      }
    ]
    
    return productId ? batches.filter(b => b.productId === productId) : batches
  }

  // Low Stock Alerts
  async getLowStockItems() {
    const products = await this.getProducts()
    return products.filter(p => p.stock <= p.minStock).map(p => ({
      productId: p.id,
      name: p.name,
      currentStock: p.stock,
      minStock: p.minStock,
      reorderQuantity: p.minStock * 2
    }))
  }

  // Stock Movement History
  async recordStockMovement(data: any) {
    return {
      id: `movement_${Date.now()}`,
      ...data,
      timestamp: new Date()
    }
  }

  async getStockHistory(productId: string, limit: number = 50) {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: `movement_${i}`,
      productId,
      type: ['in', 'out'][i % 2],
      quantity: Math.floor(Math.random() * 10) + 1,
      reason: ['Purchase', 'Usage', 'Adjustment'][i % 3],
      timestamp: new Date(Date.now() - i * 86400000)
    }))
  }

  // Inventory Reports
  async getInventoryReport(clinicId: string) {
    const products = await this.getProducts()
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    
    return {
      clinicId,
      totalProducts: products.length,
      totalStockValue: totalValue,
      lowStockItems: products.filter(p => p.stock <= p.minStock).length,
      expiringSoon: 2, // This would be calculated from batch expiry dates
      generatedAt: new Date()
    }
  }

  async getInventoryValueByCategory() {
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
    })
  }

  // Supplier Management
  async createSupplier(data: any) {
    return {
      id: `supplier_${Date.now()}`,
      ...data,
      createdAt: new Date()
    }
  }

  async getSuppliers() {
    return [
      {
        id: 'supplier_1',
        name: 'Dermocosméticos LTDA',
        contact: 'contato@dermo.com.br',
        phone: '+55 11 9999-8888',
        products: ['product_1', 'product_2']
      }
    ]
  }

  // Purchase Orders
  async createPurchaseOrder(data: any) {
    return {
      id: `po_${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    }
  }

  async getPurchaseOrders(status?: string) {
    const orders = [
      {
        id: 'po_1',
        supplierId: 'supplier_1',
        status: 'pending',
        totalAmount: 1500,
        orderDate: new Date(Date.now() - 7 * 86400000),
        expectedDelivery: new Date(Date.now() + 14 * 86400000)
      }
    ]
    
    return status ? orders.filter(o => o.status === status) : orders
  }
}