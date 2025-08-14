// Inventory Management Types
export type InventoryCategory = 'PRODUTOS' | 'EQUIPAMENTOS' | 'CONSUMIVEIS' | 'MEDICAMENTOS'
export type InventoryStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'RECALLED' | 'MAINTENANCE'

export interface InventoryItem {
  id: string
  name: string
  description?: string
  category: InventoryCategory
  subcategory?: string
  brand: string
  model?: string
  serialNumber?: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  supplierName: string
  supplierCnpj?: string
  supplierContact?: string
  anvisaCode?: string
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  storageConditions?: string
  location: string
  status: InventoryStatus
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  certifications: string[]
  createdAt: string
  updatedAt: string
}