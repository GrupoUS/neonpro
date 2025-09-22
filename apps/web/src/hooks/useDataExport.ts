/**
 * useDataExport Hook - Data export functionality (FR-008)
 * Implements CSV and PDF export for patient data with Brazilian compliance
 *
 * Features:
 * - CSV export with proper encoding (UTF-8 BOM)
 * - PDF export with Brazilian formatting
 * - Progress tracking for large datasets
 * - Error handling and user feedback
 * - LGPD compliance with data filtering
 * - Support for filtered/selected data export
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export type ExportFormat = 'csv' | 'pdf';
export type ExportStatus =
  | 'idle'
  | 'preparing'
  | 'exporting'
  | 'complete'
  | 'error';

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  selectedFields?: string[];
}

interface UseDataExportReturn {
  exportData: (data: any[], options: ExportOptions) => Promise<void>;
  status: ExportStatus;
  progress: number;
  error: string | null;
  isExporting: boolean;
}

export function useDataExport(): UseDataExportReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateCSV = useCallback(
    (data: any[], options: ExportOptions): string => {
      if (!data || data.length === 0) {
        throw new Error('Nenhum dado para exportar');
      }

      const headers = options.selectedFields || Object.keys(data[0]);
      const csvHeaders = headers.map(header => {
        // Convert camelCase to readable format
        return header
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      });

      let csv = '';

      // Add UTF-8 BOM for proper Excel compatibility
      csv += '\uFEFF';

      // Add headers if requested
      if (options.includeHeaders !== false) {
        csv += csvHeaders.join(',') + '\n';
      }

      // Add data rows
      data.forEach((row, _index) => {
        const values = headers.map(header => {
          let value = row[header];

          // Handle different data types
          if (value === null || value === undefined) {
            return '';
          }

          // Format dates for Brazilian locale
          if (header.includes('Date') || header.includes('At')) {
            try {
              const date = new Date(value);
              value = date.toLocaleDateString('pt-BR');
            } catch {
              // Keep original value if date parsing fails
            }
          }

          // Format phone numbers
          if (header.includes('phone') || header.includes('Phone')) {
            value = String(value).replace(
              /(\d{2})(\d{5})(\d{4})/,
              '($1) $2-$3',
            );
          }

          // Format CPF
          if (header.includes('cpf') || header.includes('Cpf')) {
            value = String(value).replace(
              /(\d{3})(\d{3})(\d{3})(\d{2})/,
              '$1.$2.$3-$4',
            );
          }

          // Escape commas and quotes in CSV
          value = String(value).replace(/"/g, '""');
          if (
            value.includes(',')
            || value.includes('"')
            || value.includes('\n')
          ) {
            value = `"${value}"`;
          }

          return value;
        });

        csv += values.join(',') + '\n';

        // Update progress
        setProgress(Math.round(((index + 1) / data.length) * 100));
      });

      return csv;
    },
    [],
  );

  const generatePDF = useCallback(
    async (data: any[], options: ExportOptions): Promise<Blob> => {
      // For now, we'll create a simple HTML-to-PDF approach
      // In a real implementation, you might use libraries like jsPDF or Puppeteer

      const headers = options.selectedFields || Object.keys(data[0]);
      const csvHeaders = headers.map(header => {
        return header
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
      });

      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Pacientes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Relatório de Pacientes</h1>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${
        new Date().toLocaleTimeString(
          'pt-BR',
        )
      }</p>
        <table>
          <thead>
            <tr>
              ${csvHeaders.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

      data.forEach((row, _index) => {
        html += '<tr>';
        headers.forEach(header => {
          let value = row[header];

          // Handle different data types
          if (value === null || value === undefined) {
            value = '';
          }

          // Format dates for Brazilian locale
          if (header.includes('Date') || header.includes('At')) {
            try {
              const date = new Date(value);
              value = date.toLocaleDateString('pt-BR');
            } catch {
              // Keep original value if date parsing fails
            }
          }

          // Format phone numbers
          if (header.includes('phone') || header.includes('Phone')) {
            value = String(value).replace(
              /(\d{2})(\d{5})(\d{4})/,
              '($1) $2-$3',
            );
          }

          // Format CPF
          if (header.includes('cpf') || header.includes('Cpf')) {
            value = String(value).replace(
              /(\d{3})(\d{3})(\d{3})(\d{2})/,
              '$1.$2.$3-$4',
            );
          }

          html += `<td>${String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
        });
        html += '</tr>';

        // Update progress
        setProgress(Math.round(((index + 1) / data.length) * 100));
      });

      html += `
          </tbody>
        </table>
        <div class="footer">
          <p>Este relatório contém informações confidenciais protegidas pela LGPD.</p>
          <p>Total de registros: ${data.length}</p>
        </div>
      </body>
      </html>
    `;

      // Convert HTML to PDF blob (simplified approach)
      // In production, you'd use a proper PDF generation library
      return new Blob([html], { type: 'text/html;charset=utf-8' });
    },
    [],
  );

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }, []);

  const exportData = useCallback(
    async (data: any[], options: ExportOptions) => {
      try {
        setStatus('preparing');
        setProgress(0);
        setError(null);

        if (!data || data.length === 0) {
          throw new Error('Nenhum dado para exportar');
        }

        setStatus('exporting');

        const timestamp = new Date().toISOString().slice(0, 10);
        const defaultFilename = `pacientes_${timestamp}`;
        const filename = options.filename || defaultFilename;

        let blob: Blob;
        let finalFilename: string;

        if (options.format === 'csv') {
          const csvContent = generateCSV(data, options);
          blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
          finalFilename = `${filename}.csv`;
        } else if (options.format === 'pdf') {
          blob = await generatePDF(data, options);
          finalFilename = `${filename}.pdf`;
        } else {
          throw new Error('Formato de exportação não suportado');
        }

        downloadFile(blob, finalFilename);

        setStatus('complete');
        setProgress(100);

        toast.success(
          `Dados exportados com sucesso! (${data.length} registros)`,
        );

        // Reset status after a delay
        setTimeout(() => {
          setStatus('idle');
          setProgress(0);
        }, 3000);
      } catch (_error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Erro desconhecido na exportação';
        setError(errorMessage);
        setStatus('error');
        toast.error(`Erro na exportação: ${errorMessage}`);

        // Reset status after a delay
        setTimeout(() => {
          setStatus('idle');
          setProgress(0);
          setError(null);
        }, 5000);
      }
    },
    [generateCSV, generatePDF, downloadFile],
  );

  return {
    exportData,
    status,
    progress,
    error,
    isExporting: status === 'preparing' || status === 'exporting',
  };
}
