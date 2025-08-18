import { addDays, differenceInDays, isBefore, isAfter } from 'date-fns';
import type {
  Product,
  StockItem,
  StockMovement,
  Supplier,
  PurchaseOrder,
  InventoryAlert,
  CreateProductData,
  CreateStockItemData,
  CreateSupplierData
} from './types';
import { InventoryStatus } from '../types';
import { 
  MovementType, 
  OrderStatus, 
  AlertType, 
  AlertSeverity,
  ProductCategory 
} from './types';

export interface InventoryRepository {
  // Product operations
  createProduct(data: CreateProductData): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  getProduct(id: string): Promise<Product | null>;
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductBySku(sku: string): Promise<Product | null>;
  
  // Stock operations
  createStockItem(data: CreateStockItemData): Promise<StockItem>;
  updateStockItem(id: string, data: Partial<StockItem>): Promise<StockItem>;
  getStockItem(id: string): Promise<StockItem | null>;
  getStockItems(productId?: string): Promise<StockItem[]>;
  
  // Stock movements
  createStockMovement(data: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockMovement>;
  getStockMovements(stockItemId: string): Promise<StockMovement[]>;
  
  // Suppliers
  createSupplier(data: CreateSupplierData): Promise<Supplier>;
  updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier>;
  getSupplier(id: string): Promise<Supplier | null>;
  getSuppliers(): Promise<Supplier[]>;
  
  // Purchase orders
  createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder>;
  getPurchaseOrder(id: string): Promise<PurchaseOrder | null>;
  getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]>;
  
  // Alerts
  createAlert(data: Omit<InventoryAlert, 'id' | 'createdAt'>): Promise<InventoryAlert>;
  getAlerts(filters?: AlertFilters): Promise<InventoryAlert[]>;
  acknowledgeAlert(id: string, acknowledgedBy: string): Promise<void>;
}export interface ProductFilters {
  category?: ProductCategory;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
}

export interface PurchaseOrderFilters {
  status?: OrderStatus;
  supplierId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AlertFilters {
  type?: AlertType;
  severity?: AlertSeverity;
  isRead?: boolean;
  productId?: string;
}

export interface InventoryStats {
  totalProducts: number;
  activeProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  totalValue: number;
  topCategories: { category: ProductCategory; count: number; value: number }[];
  pendingOrders: number;
}

export class InventoryService {
  constructor(private repository: InventoryRepository) {}

  // Product management
  async createProduct(data: CreateProductData): Promise<Product> {
    try {
      // Check if SKU already exists
      const existingProduct = await this.repository.getProductBySku(data.sku);
      if (existingProduct) {
        throw new Error('Product with this SKU already exists');
      }

      const product = await this.repository.createProduct(data);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    // If SKU is being updated, check for duplicates
    if (data.sku) {
      const existingProduct = await this.repository.getProductBySku(data.sku);
      if (existingProduct && existingProduct.id !== id) {
        throw new Error('Another product with this SKU already exists');
      }
    }

    return this.repository.updateProduct(id, data);
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.repository.getProduct(id);
  }

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.repository.getProducts(filters);
  }

  // Stock management
  async receiveStock(data: CreateStockItemData): Promise<StockItem> {
    try {
      const product = await this.repository.getProduct(data.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const stockItem = await this.repository.createStockItem(data);

      // Record stock movement
      await this.repository.createStockMovement({
        stockItemId: stockItem.id,
        movementType: MovementType.RECEIVED,
        quantity: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        reason: 'Stock received',
        performedBy: 'system' // This should be the actual user ID
      });

      // Check if this resolves any low stock alerts
      await this.checkAndResolveStockAlerts(data.productId);

      return stockItem;
    } catch (error) {
      console.error('Error receiving stock:', error);
      throw error;
    }
  }  async useStock(productId: string, quantity: number, reason: string, reference?: string): Promise<StockMovement[]> {
    const stockItems = await this.repository.getStockItems(productId);
    const availableStock = stockItems.filter(item => 
      item.status === InventoryStatus.IN_STOCK && item.quantity > 0
    );

    if (availableStock.length === 0) {
      throw new Error('No stock available for this product');
    }

    // Calculate total available quantity
    const totalAvailable = availableStock.reduce((sum, item) => sum + item.quantity, 0);
    if (totalAvailable < quantity) {
      throw new Error(`Insufficient stock. Available: ${totalAvailable}, Required: ${quantity}`);
    }

    const movements: StockMovement[] = [];
    let remainingQuantity = quantity;

    // Use FIFO (First In, First Out) approach
    const sortedStock = availableStock.sort((a, b) => a.receivedDate.getTime() - b.receivedDate.getTime());

    for (const stockItem of sortedStock) {
      if (remainingQuantity <= 0) break;

      const useFromThisItem = Math.min(stockItem.quantity, remainingQuantity);
      const newQuantity = stockItem.quantity - useFromThisItem;

      // Update stock item
      await this.repository.updateStockItem(stockItem.id, {
        quantity: newQuantity,
        status: newQuantity === 0 ? InventoryStatus.OUT_OF_STOCK : stockItem.status
      });

      // Record movement
      const movement = await this.repository.createStockMovement({
        stockItemId: stockItem.id,
        movementType: MovementType.USED,
        quantity: useFromThisItem,
        previousQuantity: stockItem.quantity,
        newQuantity,
        reason,
        reference,
        performedBy: 'system' // This should be the actual user ID
      });

      movements.push(movement);
      remainingQuantity -= useFromThisItem;
    }

    // Check if this triggers any low stock alerts
    await this.checkLowStock(productId);

    return movements;
  }  // Alert management
  async checkLowStock(productId?: string): Promise<InventoryAlert[]> {
    const products = productId 
      ? [await this.repository.getProduct(productId)].filter(Boolean) as Product[]
      : await this.repository.getProducts({ isActive: true });

    const alerts: InventoryAlert[] = [];

    for (const product of products) {
      const stockItems = await this.repository.getStockItems(product.id);
      const totalStock = stockItems
        .filter(item => item.status === InventoryStatus.IN_STOCK)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (totalStock === 0) {
        const alert = await this.repository.createAlert({
          type: AlertType.OUT_OF_STOCK,
          productId: product.id,
          message: `Product ${product.name} is out of stock`,
          severity: AlertSeverity.CRITICAL,
          isRead: false
        });
        alerts.push(alert);
      } else if (totalStock <= product.reorderPoint) {
        const alert = await this.repository.createAlert({
          type: AlertType.LOW_STOCK,
          productId: product.id,
          message: `Product ${product.name} is low in stock (${totalStock} remaining)`,
          severity: AlertSeverity.HIGH,
          isRead: false
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async checkExpiringItems(): Promise<InventoryAlert[]> {
    const stockItems = await this.repository.getStockItems();
    const alerts: InventoryAlert[] = [];
    const today = new Date();

    for (const item of stockItems) {
      if (!item.expiryDate || item.status !== InventoryStatus.IN_STOCK) {
        continue;
      }

      const daysUntilExpiry = differenceInDays(item.expiryDate, today);
      
      if (daysUntilExpiry < 0) {
        // Already expired
        await this.repository.updateStockItem(item.id, {
          status: InventoryStatus.EXPIRED
        });

        const alert = await this.repository.createAlert({
          type: AlertType.EXPIRED,
          productId: item.productId,
          stockItemId: item.id,
          message: `Stock item has expired (Batch: ${item.batchNumber || 'N/A'})`,
          severity: AlertSeverity.CRITICAL,
          isRead: false
        });
        alerts.push(alert);
      } else if (daysUntilExpiry <= 30) {
        // Expiring soon
        const alert = await this.repository.createAlert({
          type: AlertType.EXPIRING_SOON,
          productId: item.productId,
          stockItemId: item.id,
          message: `Stock item expires in ${daysUntilExpiry} days (Batch: ${item.batchNumber || 'N/A'})`,
          severity: daysUntilExpiry <= 7 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
          isRead: false
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }  private async checkAndResolveStockAlerts(productId: string): Promise<void> {
    const product = await this.repository.getProduct(productId);
    if (!product) return;

    const stockItems = await this.repository.getStockItems(productId);
    const totalStock = stockItems
      .filter(item => item.status === InventoryStatus.IN_STOCK)
      .reduce((sum, item) => sum + item.quantity, 0);

    // If stock is now above reorder point, we don't need to generate new alerts
    if (totalStock > product.reorderPoint) {
      // Could mark existing alerts as resolved here
      return;
    }
  }

  // Supplier management
  async createSupplier(data: CreateSupplierData): Promise<Supplier> {
    return this.repository.createSupplier(data);
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    return this.repository.updateSupplier(id, data);
  }

  async getSupplier(id: string): Promise<Supplier | null> {
    return this.repository.getSupplier(id);
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.repository.getSuppliers();
  }

  // Analytics and reporting
  async getInventoryStats(): Promise<InventoryStats> {
    const products = await this.repository.getProducts();
    const stockItems = await this.repository.getStockItems();
    const purchaseOrders = await this.repository.getPurchaseOrders({ 
      status: OrderStatus.PENDING 
    });

    const activeProducts = products.filter(p => p.isActive);
    
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringCount = 0;

    const categoryStats = new Map<ProductCategory, { count: number; value: number }>();

    for (const product of activeProducts) {
      const productStockItems = stockItems.filter(item => 
        item.productId === product.id && item.status === InventoryStatus.IN_STOCK
      );
      
      const totalStock = productStockItems.reduce((sum, item) => sum + item.quantity, 0);
      const stockValue = productStockItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      
      totalValue += stockValue;
      
      if (totalStock === 0) {
        outOfStockCount++;
      } else if (totalStock <= product.reorderPoint) {
        lowStockCount++;
      }

      // Check for expiring items
      const today = new Date();
      const expiringItems = productStockItems.filter(item => 
        item.expiryDate && differenceInDays(item.expiryDate, today) <= 30
      );
      expiringCount += expiringItems.length;

      // Category statistics
      const categoryData = categoryStats.get(product.category) || { count: 0, value: 0 };
      categoryData.count++;
      categoryData.value += stockValue;
      categoryStats.set(product.category, categoryData);
    }

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, data]) => ({ category, count: data.count, value: data.value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      expiringItems: expiringCount,
      totalValue,
      topCategories,
      pendingOrders: purchaseOrders.length
    };
  }  async getStockLevel(productId: string): Promise<{
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    expiringStock: number;
    stockItems: StockItem[];
  }> {
    const stockItems = await this.repository.getStockItems(productId);
    
    const availableItems = stockItems.filter(item => item.status === InventoryStatus.IN_STOCK);
    const totalStock = availableItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const today = new Date();
    const expiringItems = availableItems.filter(item => 
      item.expiryDate && differenceInDays(item.expiryDate, today) <= 30
    );
    const expiringStock = expiringItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      totalStock,
      availableStock: totalStock, // In this simple implementation, all stock is available
      reservedStock: 0, // Would need reservation system
      expiringStock,
      stockItems: availableItems
    };
  }

  async generateReorderSuggestions(): Promise<Array<{
    product: Product;
    currentStock: number;
    suggestedOrderQuantity: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>> {
    const products = await this.repository.getProducts({ isActive: true });
    const suggestions = [];

    for (const product of products) {
      const stockLevel = await this.getStockLevel(product.id);
      
      if (stockLevel.totalStock <= product.reorderPoint) {
        let priority: 'low' | 'medium' | 'high' | 'critical';
        
        if (stockLevel.totalStock === 0) {
          priority = 'critical';
        } else if (stockLevel.totalStock <= product.minimumStock) {
          priority = 'high';
        } else {
          priority = 'medium';
        }

        suggestions.push({
          product,
          currentStock: stockLevel.totalStock,
          suggestedOrderQuantity: product.reorderQuantity,
          priority
        });
      }
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Alert management
  async getAlerts(filters?: AlertFilters): Promise<InventoryAlert[]> {
    return this.repository.getAlerts(filters);
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string): Promise<void> {
    return this.repository.acknowledgeAlert(id, acknowledgedBy);
  }

  // Utility methods
  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.repository.getProducts({ category });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.repository.getProducts({ search: query });
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.repository.getProducts({ lowStock: true });
  }
}