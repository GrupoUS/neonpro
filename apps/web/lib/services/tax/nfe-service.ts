// NFe Integration Service
// Story 5.5: Brazilian electronic invoice generation and management

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  customerInfoSchema,
  type NFEDocument,
  type NFEGenerationRequest,
  nfeDocumentSchema,
  nfeGenerationRequestSchema,
} from '@/lib/types/brazilian-tax';
import { brazilianTaxEngine } from './tax-engine';

export class NFEIntegrationService {
  private readonly supabase = createClientComponentClient();
  private readonly taxEngine = brazilianTaxEngine;

  // Generate NFe document
  async generateNFE(request: NFEGenerationRequest): Promise<NFEDocument> {
    try {
      // Validate request
      const validatedRequest = nfeGenerationRequestSchema.parse(request);

      // Get next NFe number
      const nextNumber = await this.getNextNFENumber(
        validatedRequest.clinic_id
      );

      // Calculate taxes for services
      const taxCalculations = await Promise.all(
        validatedRequest.services.map((service) =>
          this.taxEngine.calculateTaxes({
            clinic_id: validatedRequest.clinic_id,
            valor_base: service.valor_total,
            tipo_servico: service.descricao,
            codigo_servico: service.codigo_servico,
          })
        )
      );

      // Build NFe document
      const totalValue = validatedRequest.services.reduce(
        (sum, service) => sum + service.valor_total,
        0
      );
      const _totalTaxes = taxCalculations.reduce(
        (sum, calc) => sum + calc.total_taxes,
        0
      );

      const nfeDocument: NFEDocument = {
        clinic_id: validatedRequest.clinic_id,
        invoice_id: validatedRequest.invoice_id,
        numero_nfe: nextNumber,
        serie_nfe: 1,
        tipo_documento: 'nfe',
        modelo_documento: '55',
        natureza_operacao:
          validatedRequest.natureza_operacao ||
          'Prestação de Serviços de Saúde',
        valor_total: totalValue,
        valor_base_calculo: totalValue,
        valor_icms: taxCalculations.reduce(
          (sum, calc) => sum + calc.tax_breakdown.icms,
          0
        ),
        valor_iss: taxCalculations.reduce(
          (sum, calc) => sum + calc.tax_breakdown.iss,
          0
        ),
        valor_pis: taxCalculations.reduce(
          (sum, calc) => sum + calc.tax_breakdown.pis,
          0
        ),
        valor_cofins: taxCalculations.reduce(
          (sum, calc) => sum + calc.tax_breakdown.cofins,
          0
        ),
        cliente_cnpj_cpf: validatedRequest.customer.cnpj_cpf,
        cliente_nome: validatedRequest.customer.nome,
        cliente_endereco: validatedRequest.customer.endereco,
        servicos: validatedRequest.services,
        status: 'draft',
        observacoes: validatedRequest.observacoes,
        chave_nfe: this.generateNFEKey(validatedRequest.clinic_id, nextNumber),
        protocolo_autorizacao: undefined,
        xml_nfe: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Validate NFe document
      nfeDocumentSchema.parse(nfeDocument);

      // Save to database
      const { data, error } = await this.supabase
        .from('nfe_documents')
        .insert(nfeDocument)
        .select()
        .single();

      if (error) {
        console.error('Error saving NFe document:', error);
        throw new Error('Failed to save NFe document');
      }

      return data as NFEDocument;
    } catch (error) {
      console.error('NFe generation error:', error);
      throw error;
    }
  }

  // Get next NFe number for clinic
  private async getNextNFENumber(clinicId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('nfe_documents')
        .select('numero_nfe')
        .eq('clinic_id', clinicId)
        .order('numero_nfe', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error getting next NFe number:', error);
        return 1;
      }

      return data && data.length > 0 ? data[0].numero_nfe + 1 : 1;
    } catch (error) {
      console.error('Next NFe number error:', error);
      return 1;
    }
  }

  // Generate NFe access key (simplified version)
  private generateNFEKey(clinicId: string, nfeNumber: number): string {
    // In a real implementation, this would follow the official NFe key format
    // For now, we'll generate a simplified key
    const timestamp = Date.now().toString();
    const clinicHash = clinicId.replace(/-/g, '').substring(0, 8);
    const paddedNumber = nfeNumber.toString().padStart(9, '0');

    return `${timestamp}${clinicHash}${paddedNumber}`;
  }

  // Submit NFe for authorization
  async authorizeNFE(nfeId: string): Promise<{
    success: boolean;
    protocol?: string;
    message: string;
  }> {
    try {
      // Get NFe document
      const { data: nfe, error } = await this.supabase
        .from('nfe_documents')
        .select('*')
        .eq('id', nfeId)
        .single();

      if (error || !nfe) {
        throw new Error('NFe document not found');
      }

      if (nfe.status !== 'draft') {
        throw new Error('NFe is not in draft status');
      }

      // In a real implementation, this would:
      // 1. Generate the XML according to NFe schema
      // 2. Sign the XML with digital certificate
      // 3. Submit to SEFAZ webservice
      // 4. Process the response

      // For demo purposes, we'll simulate authorization
      const protocol = `${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      // Update NFe status
      const { error: updateError } = await this.supabase
        .from('nfe_documents')
        .update({
          status: 'authorized',
          protocolo_autorizacao: protocol,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nfeId);

      if (updateError) {
        throw new Error('Failed to update NFe status');
      }

      return {
        success: true,
        protocol,
        message: 'NFe authorized successfully',
      };
    } catch (error) {
      console.error('NFe authorization error:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Authorization failed',
      };
    }
  }

  // Cancel NFe
  async cancelNFE(
    nfeId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Get NFe document
      const { data: nfe, error } = await this.supabase
        .from('nfe_documents')
        .select('*')
        .eq('id', nfeId)
        .single();

      if (error || !nfe) {
        throw new Error('NFe document not found');
      }

      if (nfe.status !== 'authorized') {
        throw new Error('Only authorized NFe can be cancelled');
      }

      // In a real implementation, this would submit cancellation to SEFAZ

      // Update NFe status
      const { error: updateError } = await this.supabase
        .from('nfe_documents')
        .update({
          status: 'cancelled',
          observacoes: `${nfe.observacoes || ''}\nCancelada: ${reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nfeId);

      if (updateError) {
        throw new Error('Failed to update NFe status');
      }

      return {
        success: true,
        message: 'NFe cancelled successfully',
      };
    } catch (error) {
      console.error('NFe cancellation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  }

  // Get NFe by ID
  async getNFE(nfeId: string): Promise<NFEDocument | null> {
    try {
      const { data, error } = await this.supabase
        .from('nfe_documents')
        .select('*')
        .eq('id', nfeId)
        .single();

      if (error || !data) {
        console.error('Error fetching NFe:', error);
        return null;
      }

      return data as NFEDocument;
    } catch (error) {
      console.error('NFe fetch error:', error);
      return null;
    }
  }

  // List NFe documents for clinic
  async listNFEDocuments(
    clinicId: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      customerName?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    documents: NFEDocument[];
    total: number;
  }> {
    try {
      let query = this.supabase
        .from('nfe_documents')
        .select('*, count(*)', { count: 'exact' })
        .eq('clinic_id', clinicId);

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.customerName) {
        query = query.ilike('cliente_nome', `%${filters.customerName}%`);
      }

      // Add pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error listing NFe documents:', error);
        throw new Error('Failed to list NFe documents');
      }

      return {
        documents: (data || []) as NFEDocument[],
        total: count || 0,
      };
    } catch (error) {
      console.error('NFe list error:', error);
      throw error;
    }
  }

  // Get NFe statistics for clinic
  async getNFEStatistics(
    clinicId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    total_documents: number;
    total_value: number;
    by_status: Record<string, number>;
    by_month: Array<{
      month: string;
      count: number;
      value: number;
    }>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('nfe_documents')
        .select('status, valor_total, created_at')
        .eq('clinic_id', clinicId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        console.error('Error fetching NFe statistics:', error);
        throw new Error('Failed to fetch NFe statistics');
      }

      const documents = data || [];
      const totalDocuments = documents.length;
      const totalValue = documents.reduce(
        (sum, doc) => sum + (doc.valor_total || 0),
        0
      );

      // Group by status
      const byStatus = documents.reduce(
        (acc, doc) => {
          acc[doc.status] = (acc[doc.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Group by month
      const byMonth = documents.reduce(
        (acc, doc) => {
          const month = doc.created_at.substring(0, 7); // YYYY-MM
          const existing = acc.find((item) => item.month === month);
          if (existing) {
            existing.count += 1;
            existing.value += doc.valor_total || 0;
          } else {
            acc.push({
              month,
              count: 1,
              value: doc.valor_total || 0,
            });
          }
          return acc;
        },
        [] as Array<{ month: string; count: number; value: number }>
      );

      // Sort by month
      byMonth.sort((a, b) => a.month.localeCompare(b.month));

      return {
        total_documents: totalDocuments,
        total_value: totalValue,
        by_status: byStatus,
        by_month: byMonth,
      };
    } catch (error) {
      console.error('NFe statistics error:', error);
      throw error;
    }
  }

  // Validate NFe data before generation
  async validateNFEData(request: NFEGenerationRequest): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate request structure
      nfeGenerationRequestSchema.parse(request);

      // Additional business validations
      if (request.services.length === 0) {
        errors.push('At least one service is required');
      }

      // Validate service totals
      for (const service of request.services) {
        const calculatedTotal = service.quantidade * service.valor_unitario;
        if (Math.abs(calculatedTotal - service.valor_total) > 0.01) {
          errors.push(
            `Service "${service.descricao}": total value doesn't match quantity × unit value`
          );
        }
      }

      // Check tax configuration
      const taxValidation = await this.taxEngine.validateTaxSetup(
        request.clinic_id
      );
      if (!taxValidation.isValid) {
        errors.push(...taxValidation.errors);
      }
      warnings.push(...taxValidation.warnings);

      // Customer validation
      try {
        customerInfoSchema.parse(request.customer);
      } catch (customerError: any) {
        errors.push(`Customer validation: ${customerError.message}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error: any) {
      console.error('NFe validation error:', error);
      return {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings,
      };
    }
  }
}

// Export the NFe service
export const nfeIntegrationService = new NFEIntegrationService();

// Export types
export type { NFeDocument, NFeItem, NFeStatus };
