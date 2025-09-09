'use client'

import { LoadingWithMessage, } from '@/components/ui/loading-skeleton'
import dynamic from 'next/dynamic'
import React, { Suspense, useCallback, useState, } from 'react'

// TODO: Create missing excel modules
// const ExcelImporter = dynamic(
//   () => import('../excel/excel-importer').then((mod,) => mod.ExcelImporter),
//   {
//     loading: () => <LoadingWithMessage variant="excel" message="Carregando importador Excel..." />,
//     ssr: false,
//   },
// )

// const ExcelExporter = dynamic(
//   () => import('../excel/excel-exporter').then((mod,) => mod.ExcelExporter),
//   {
//     loading: () => <LoadingWithMessage variant="excel" message="Carregando exportador Excel..." />,
//     ssr: false,
//   },
// )

// Temporary placeholders
const ExcelImporter = (_props: any,) => <div className="animate-pulse">Excel Importer</div>
const ExcelExporter = (_props: any,) => <div className="animate-pulse">Excel Exporter</div>

// TODO: Create csv-processor module
// const CSVProcessor = dynamic(
//   () => import('../excel/csv-processor').then((mod,) => mod.CSVProcessor),
//   {
//     loading: () => <LoadingWithMessage variant="excel" message="Carregando processador CSV..." />,
//     ssr: false,
//   },
// )

// Temporary placeholder
const CSVProcessor = (_props: any,) => <div className="animate-pulse">CSV Processor</div>

// Interfaces
interface ExcelData {
  headers: string[]
  rows: unknown[][]
  metadata?: {
    fileName?: string
    sheetName?: string
    totalRows?: number
    processedAt?: Date
  }
}

interface ExcelImporterProps {
  onDataLoaded: (data: ExcelData,) => void
  onError?: (error: Error,) => void
  acceptedFormats?: string[]
  maxFileSize?: number // in bytes
  template?: 'patients' | 'appointments' | 'financial' | 'inventory'
}

interface ExcelExporterProps {
  data: ExcelData
  filename?: string
  format?: 'xlsx' | 'csv'
  template?: 'patients' | 'appointments' | 'financial' | 'inventory'
}

interface CSVProcessorProps {
  data: string | File
  delimiter?: ',' | ';' | '\t'
  encoding?: 'utf-8' | 'latin1'
  onProcessed: (data: ExcelData,) => void
  onError?: (error: Error,) => void
}

// Dynamic Excel Importer
export function DynamicExcelImporter(props: ExcelImporterProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Carregando importador..." />}>
      <ExcelImporter {...props} />
    </Suspense>
  )
}

// Dynamic Excel Exporter
export function DynamicExcelExporter(props: ExcelExporterProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Carregando exportador..." />}>
      <ExcelExporter {...props} />
    </Suspense>
  )
}

// Dynamic CSV Processor
export function DynamicCSVProcessor(props: CSVProcessorProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="excel" message="Processando CSV..." />}>
      <CSVProcessor {...props} />
    </Suspense>
  )
}

// Hook para Excel processing com lazy loading
export function useExcelProcessing() {
  const [isProcessing, setIsProcessing,] = useState(false,)
  const [progress, setProgress,] = useState(0,)
  const [error, setError,] = useState<Error | null>(null,)

  // Import Excel file
  const importExcel = useCallback(
    async (file: File, template?: string, maxFileSize?: number,): Promise<ExcelData> => {
      setIsProcessing(true,)
      setProgress(0,)
      setError(null,)

      try {
        // Check file size before processing
        if (maxFileSize && file.size > maxFileSize) {
          const errorMsg = `Arquivo muito grande (${
            Math.round(file.size / 1024 / 1024,)
          }MB). Tamanho máximo permitido: ${Math.round(maxFileSize / 1024 / 1024,)}MB`
          setError(new Error(errorMsg,),)
          setIsProcessing(false,)
          setProgress(0,)
          throw new Error(errorMsg,)
        }

        // Lazy load ExcelJS library (secure replacement for xlsx)
        const ExcelJS = await import('exceljs')

        return new Promise((resolve, reject,) => {
          const reader = new FileReader()

          reader.addEventListener('load', async (e,) => {
            try {
              setProgress(30,)

              const data = e.target?.result as ArrayBuffer
              const workbook = new ExcelJS.Workbook()
              await workbook.xlsx.load(data,)

              const worksheet = workbook.worksheets[0]
              const sheetName = worksheet.name

              setProgress(60,)

              // Convert ExcelJS data to our format
              const rows: unknown[][] = []
              let headers: string[] = []

              worksheet.eachRow((row, rowNumber,) => {
                const rowValues = row.values as unknown[]
                // Remove first element (ExcelJS includes undefined at index 0)
                const cleanValues = rowValues.slice(1,)

                if (rowNumber === 1) {
                  headers = cleanValues.map(val => String(val || '',))
                } else {
                  rows.push(cleanValues,)
                }
              },)

              setProgress(90,)

              const result: ExcelData = {
                headers,
                rows,
                metadata: {
                  fileName: file.name,
                  sheetName,
                  totalRows: rows.length,
                  processedAt: new Date(),
                },
              }

              setProgress(100,)
              resolve(result,)
            } catch (err) {
              reject(new Error(`Erro ao processar arquivo Excel: ${(err as Error).message}`,),)
            }
          },)

          reader.addEventListener('error', () => {
            reject(new Error('Erro ao ler arquivo',),)
          },)

          reader.readAsArrayBuffer(file,)
        },)
      } catch (err) {
        const error = err as Error
        setError(error,)
        throw error
      } finally {
        setIsProcessing(false,)
        setProgress(0,)
      }
    },
    [],
  )

  // Export to Excel
  const exportToExcel = useCallback(async (data: ExcelData, filename = 'export.xlsx',) => {
    setIsProcessing(true,)
    setError(null,)

    try {
      // Lazy load ExcelJS library (secure replacement for xlsx)
      const ExcelJS = await import('exceljs')

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Data',)

      // Add headers
      worksheet.addRow(data.headers,)

      // Add data rows
      data.rows.forEach(row => {
        worksheet.addRow(row,)
      },)

      // Style the header row
      const headerRow = worksheet.getRow(1,)
      headerRow.font = { bold: true, }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092', },
      }
      headerRow.font.color = { argb: 'FFFFFFFF', }

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        if (column.header) {
          column.width = Math.max(12, String(column.header,).length + 2,)
        }
      },)

      // Generate buffer and trigger download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer,], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },)
      const url = URL.createObjectURL(blob,)

      const a = document.createElement('a',)
      a.href = url
      a.download = filename
      document.body.append(a,)
      a.click()
      document.body.removeChild(a,)
      URL.revokeObjectURL(url,)
    } catch (err) {
      const error = err as Error
      setError(error,)
      throw error
    } finally {
      setIsProcessing(false,)
    }
  }, [],)

  // Process CSV with lazy loading
  const processCSV = useCallback(async (csvData: string, delimiter = ',',): Promise<ExcelData> => {
    setIsProcessing(true,)
    setError(null,)

    try {
      // Lazy load csv-parse library
      const { parse, } = await import('csv-parse/sync')

      const records = parse(csvData, {
        delimiter,
        skip_empty_lines: true,
        trim: true,
      },)

      const [headers, ...rows] = records

      return {
        headers,
        rows,
        metadata: {
          totalRows: rows.length,
          processedAt: new Date(),
        },
      }
    } catch (err) {
      const error = err as Error
      setError(error,)
      throw error
    } finally {
      setIsProcessing(false,)
    }
  }, [],)

  return {
    importExcel,
    exportToExcel,
    processCSV,
    isProcessing,
    progress,
    error,
  }
}

// Template validation for healthcare data
export const ExcelTemplates = {
  patients: {
    requiredHeaders: ['nome', 'cpf', 'telefone', 'email',],
    optionalHeaders: ['data_nascimento', 'endereco', 'observacoes',],
    validation: (data: ExcelData,) => {
      // Validate patient data structure - ensure all required headers are present
      if (!data.headers) return false
      const requiredHeaders = ['nome', 'cpf',]
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()),)
      return requiredHeaders.every(h => normalizedHeaders.has(h,))
    },
  },
  appointments: {
    requiredHeaders: ['paciente', 'data', 'horario', 'procedimento',],
    optionalHeaders: ['observacoes', 'valor', 'status',],
    validation: (data: ExcelData,) => {
      // Validate appointment data structure - ensure all required headers are present
      if (!data.headers) return false
      const requiredHeaders = ['data', 'horario', 'paciente', 'procedimento',]
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()),)
      return requiredHeaders.every(h => normalizedHeaders.has(h,))
    },
  },
  financial: {
    requiredHeaders: ['descricao', 'valor', 'data', 'tipo',],
    optionalHeaders: ['categoria', 'observacoes', 'paciente',],
    validation: (data: ExcelData,) => {
      // Validate financial data structure - ensure all required headers are present
      if (!data.headers) return false
      const requiredHeaders = ['descricao', 'valor', 'data', 'tipo',]
      const normalizedHeaders = new Set(data.headers.map(h => h.toLowerCase().trim()),)
      return requiredHeaders.every(h => normalizedHeaders.has(h,))
    },
  },
} as const
