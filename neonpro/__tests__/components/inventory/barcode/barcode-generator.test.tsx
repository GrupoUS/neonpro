/**
 * Story 6.1 Task 2: Barcode Generator Component Tests
 * Comprehensive tests for barcode generation functionality
 * Quality: ≥9.5/10 with full coverage and edge cases
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BarcodeGenerator from '@/app/components/inventory/barcode/barcode-generator'

// Mock the hooks
vi.mock('@/app/hooks/use-barcode-scanner', () => ({
  useBarcodeGeneration: vi.fn(() => ({
    generateBarcode: vi.fn(),
    isGenerating: false,
    error: null,
    data: null
  })),
  useBarcodeData: vi.fn(() => ({
    data: [],
    isLoading: false
  })),
  useLabelPrinting: vi.fn(() => ({
    printLabel: vi.fn(),
    isPrinting: false
  }))
}))

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('BarcodeGenerator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders generator interface correctly', () => {
    render(<BarcodeGenerator />)
    
    expect(screen.getByText('Gerador de Códigos')).toBeInTheDocument()
    expect(screen.getByLabelText('Item do Inventário')).toBeInTheDocument()
    expect(screen.getByText('Gerar Códigos')).toBeInTheDocument()
  })

  it('pre-fills item ID when provided', () => {
    const testItemId = 'test-item-123'
    render(<BarcodeGenerator itemId={testItemId} />)
    
    const itemInput = screen.getByPlaceholderText('ID do item (UUID)')
    expect(itemInput.value).toBe(testItemId)
  })

  it('handles barcode type selection', () => {
    render(<BarcodeGenerator />)
    
    const select = screen.getByRole('combobox')
    fireEvent.click(select)
    
    expect(screen.getByText('CODE128')).toBeInTheDocument()
    expect(screen.getByText('EAN13')).toBeInTheDocument()
    expect(screen.getByText('CODE39')).toBeInTheDocument()
  })

  it('toggles QR code inclusion', () => {
    render(<BarcodeGenerator />)
    
    const qrSwitch = screen.getByRole('switch')
    expect(qrSwitch).not.toBeChecked()
    
    fireEvent.click(qrSwitch)
    expect(qrSwitch).toBeChecked()
  })

  it('validates required fields before generation', async () => {
    render(<BarcodeGenerator />)
    
    const generateButton = screen.getByText('Gerar Códigos')
    fireEvent.click(generateButton)
    
    // Should show error for missing item ID
    await waitFor(() => {
      const { toast } = require('sonner')
      expect(toast.error).toHaveBeenCalledWith('Selecione um item')
    })
  })

  it('generates barcode with valid input', async () => {
    const mockGenerate = vi.fn()
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: mockGenerate,
      isGenerating: false,
      error: null,
      data: null
    })
    
    render(<BarcodeGenerator />)
    
    // Fill in required fields
    const itemInput = screen.getByPlaceholderText('ID do item (UUID)')
    fireEvent.change(itemInput, { target: { value: 'test-item-123' } })
    
    const generateButton = screen.getByText('Gerar Códigos')
    fireEvent.click(generateButton)
    
    expect(mockGenerate).toHaveBeenCalledWith({
      item_id: 'test-item-123',
      barcode_type: 'CODE128',
      include_qr: false,
      batch_number: '',
      expiration_date: '',
      location_id: ''
    })
  })

  it('displays generated barcode preview', () => {
    const mockData = {
      barcode: '1234567890123',
      barcode_type: 'EAN13',
      qr_code: null,
      item_name: 'Test Item',
      item_id: 'test-item-123'
    }
    
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData
    })
    
    render(<BarcodeGenerator />)
    
    expect(screen.getByText('Códigos Gerados')).toBeInTheDocument()
    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(screen.getByText('1234567890123')).toBeInTheDocument()
  })

  it('handles generation errors', () => {
    const mockError = new Error('Generation failed')
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vi.fn(),
      isGenerating: false,
      error: mockError,
      data: null
    })
    
    render(<BarcodeGenerator />)
    
    expect(screen.getByText('Generation failed')).toBeInTheDocument()
  })

  it('enables print functionality when barcode is generated', () => {
    const mockPrint = vi.fn()
    const mockData = {
      barcode: '1234567890123',
      barcode_type: 'EAN13',
      item_name: 'Test Item',
      item_id: 'test-item-123'
    }
    
    const { useBarcodeGeneration, useLabelPrinting } = require('@/app/hooks/use-barcode-scanner')
    
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData
    })
    
    useLabelPrinting.mockReturnValue({
      printLabel: mockPrint,
      isPrinting: false
    })
    
    render(<BarcodeGenerator />)
    
    const printButton = screen.getByText('Imprimir Etiqueta')
    fireEvent.click(printButton)
    
    expect(mockPrint).toHaveBeenCalled()
  })

  it('copies barcode to clipboard', async () => {
    const mockData = {
      barcode: '1234567890123',
      barcode_type: 'EAN13',
      item_name: 'Test Item',
      item_id: 'test-item-123'
    }
    
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })
    
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData
    })
    
    render(<BarcodeGenerator />)
    
    const copyButton = screen.getByText('Copiar')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('1234567890123')
    })
  })

  it('calls onGenerated callback when barcode is created', () => {
    const onGenerated = vi.fn()
    const mockData = {
      barcode: '1234567890123',
      barcode_type: 'EAN13',
      item_name: 'Test Item',
      item_id: 'test-item-123'
    }
    
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData
    })
    
    render(<BarcodeGenerator onGenerated={onGenerated} />)
    
    expect(onGenerated).toHaveBeenCalledWith(mockData)
  })

  it('shows existing barcodes for item', () => {
    const existingBarcodes = [
      {
        barcode: '9876543210',
        barcode_type: 'CODE128',
        qr_code: null,
        created_at: '2025-01-26T10:00:00Z'
      }
    ]
    
    const { useBarcodeData } = require('@/app/hooks/use-barcode-scanner')
    useBarcodeData.mockReturnValue({
      data: existingBarcodes,
      isLoading: false
    })
    
    render(<BarcodeGenerator itemId="test-item" />)
    
    expect(screen.getByText('Códigos Existentes')).toBeInTheDocument()
    expect(screen.getByText('9876543210')).toBeInTheDocument()
  })

  it('warns about duplicate barcode types', () => {
    const existingBarcodes = [
      {
        barcode: '9876543210',
        barcode_type: 'CODE128',
        qr_code: null,
        created_at: '2025-01-26T10:00:00Z'
      }
    ]
    
    const { useBarcodeData } = require('@/app/hooks/use-barcode-scanner')
    useBarcodeData.mockReturnValue({
      data: existingBarcodes,
      isLoading: false
    })
    
    render(<BarcodeGenerator itemId="test-item" />)
    
    // Should show warning about existing CODE128
    expect(screen.getByText(/Já existe um código CODE128/)).toBeInTheDocument()
  })

  it('handles optional fields correctly', () => {
    const mockGenerate = vi.fn()
    const { useBarcodeGeneration } = require('@/app/hooks/use-barcode-scanner')
    
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: mockGenerate,
      isGenerating: false,
      error: null,
      data: null
    })
    
    render(<BarcodeGenerator />)
    
    // Fill in all fields including optional ones
    fireEvent.change(screen.getByPlaceholderText('ID do item (UUID)'), {
      target: { value: 'test-item-123' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ex: LOTE-2025-001'), {
      target: { value: 'BATCH-001' }
    })
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: '2025-12-31' }
    })
    
    const generateButton = screen.getByText('Gerar Códigos')
    fireEvent.click(generateButton)
    
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31'
      })
    )
  })
})