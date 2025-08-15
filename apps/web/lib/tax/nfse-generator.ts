/**
 * NFSe Generator - Brazilian Electronic Service Invoice Generator
 * NeonPro Healthcare System - Story 4.4 Architecture Alignment
 *
 * This module handles automated NFSe (Nota Fiscal de Serviço Eletrônica) generation,
 * validation, and submission to municipal tax systems for Brazilian tax compliance.
 */

import { z } from 'zod';

// =================== TYPES & SCHEMAS ===================

export const NFSeConfigSchema = z.object({
  municipalityCode: z.string().min(7).max(7), // IBGE municipal code
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  municipalInscription: z.string(),
  certificatePath: z.string(),
  certificatePassword: z.string(),
  webserviceUrl: z.string().url(),
  environment: z.enum(['production', 'homolog']),
  schema: z.string().default('v2.04'), // NFSe schema version
});

export type NFSeConfig = z.infer<typeof NFSeConfigSchema>;

export const ServiceDataSchema = z.object({
  serviceCode: z.string(), // Municipal service code
  description: z.string().min(1).max(2000),
  cnaeCode: z.string().optional(),
  taxCode: z.string().optional(),
  grossAmount: z.number().min(0),
  deductions: z.number().min(0).default(0),
  netAmount: z.number().min(0),
  issRate: z.number().min(0).max(1), // ISS tax rate as decimal
  issAmount: z.number().min(0),
  irAmount: z.number().min(0).default(0),
  pisAmount: z.number().min(0).default(0),
  cofinsAmount: z.number().min(0).default(0),
  csllAmount: z.number().min(0).default(0),
  inssAmount: z.number().min(0).default(0),
});

export type ServiceData = z.infer<typeof ServiceDataSchema>;

export const CustomerDataSchema = z.object({
  document: z.string(), // CPF or CNPJ
  documentType: z.enum(['cpf', 'cnpj']),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    district: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
  }),
});

export type CustomerData = z.infer<typeof CustomerDataSchema>;

export const NFSeRequestSchema = z.object({
  externalId: z.string(), // Internal system reference
  issueDate: z.date(),
  competenceDate: z.date(),
  serviceData: ServiceDataSchema,
  customerData: CustomerDataSchema,
  observations: z.string().optional(),
  retainIss: z.boolean().default(false),
  specialRegime: z.string().optional(),
  optantSimplesNacional: z.boolean().default(false),
  issExigibility: z.enum(['1', '2', '3', '4', '5', '6', '7']).default('1'),
});

export type NFSeRequest = z.infer<typeof NFSeRequestSchema>;

export interface NFSeResponse {
  success: boolean;
  nfseNumber: string | null;
  verificationCode: string | null;
  accessKey: string | null;
  issueDate: Date | null;
  xmlContent: string | null;
  pdfUrl: string | null;
  protocol: string | null;
  errors: string[];
  warnings: string[];
  status:
    | 'generated'
    | 'sent'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'error';
}

export interface NFSeBatchRequest {
  batchId: string;
  requests: NFSeRequest[];
  priority: 'high' | 'normal' | 'low';
  callbackUrl?: string;
}

export interface NFSeBatchResponse {
  batchId: string;
  totalRequests: number;
  processedRequests: number;
  successfulRequests: number;
  failedRequests: number;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  results: NFSeResponse[];
  processingStartTime: Date;
  processingEndTime?: Date;
}

// =================== NFSe GENERATOR CLASS ===================

export class NFSeGenerator {
  private readonly config: NFSeConfig;

  constructor(config: NFSeConfig) {
    this.config = NFSeConfigSchema.parse(config);
    this.initializeMunicipalityServices();
  }

  /**
   * Generate single NFSe
   */
  async generateNFSe(request: NFSeRequest): Promise<NFSeResponse> {
    try {
      // Validate request data
      const validatedRequest = NFSeRequestSchema.parse(request);

      // Validate business rules
      await this.validateBusinessRules(validatedRequest);

      // Generate XML
      const xmlContent = await this.generateXML(validatedRequest);

      // Sign XML with digital certificate
      const signedXML = await this.signXML(xmlContent);

      // Submit to municipal system
      const submissionResult = await this.submitToMunicipality(
        signedXML,
        validatedRequest
      );

      // Process response
      const response = await this.processSubmissionResponse(
        submissionResult,
        validatedRequest
      );

      // Store in database
      await this.storeNFSeRecord(validatedRequest, response);

      return response;
    } catch (error) {
      console.error('Error generating NFSe:', error);
      return this.createErrorResponse(error, request.externalId);
    }
  }

  /**
   * Generate multiple NFSe in batch
   */
  async generateNFSeBatch(
    batchRequest: NFSeBatchRequest
  ): Promise<NFSeBatchResponse> {
    try {
      const response: NFSeBatchResponse = {
        batchId: batchRequest.batchId,
        totalRequests: batchRequest.requests.length,
        processedRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        status: 'processing',
        results: [],
        processingStartTime: new Date(),
      };

      // Process requests with concurrency control
      const batchSize = this.getBatchSize(batchRequest.priority);
      const batches = this.chunkArray(batchRequest.requests, batchSize);

      for (const batch of batches) {
        const promises = batch.map((request) => this.generateNFSe(request));
        const batchResults = await Promise.allSettled(promises);

        for (const result of batchResults) {
          response.processedRequests++;

          if (result.status === 'fulfilled') {
            response.results.push(result.value);
            if (result.value.success) {
              response.successfulRequests++;
            } else {
              response.failedRequests++;
            }
          } else {
            response.failedRequests++;
            response.results.push(
              this.createErrorResponse(result.reason, 'batch')
            );
          }
        }

        // Respect rate limits between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await this.delay(this.getBatchDelay(batchRequest.priority));
        }
      }

      response.status = response.failedRequests === 0 ? 'completed' : 'failed';
      response.processingEndTime = new Date();

      // Send callback if configured
      if (batchRequest.callbackUrl) {
        await this.sendBatchCallback(batchRequest.callbackUrl, response);
      }

      return response;
    } catch (error) {
      console.error('Error processing NFSe batch:', error);
      throw new Error('Failed to process NFSe batch');
    }
  }

  /**
   * Cancel NFSe
   */
  async cancelNFSe(
    nfseNumber: string,
    reason: string
  ): Promise<{
    success: boolean;
    cancellationDate?: Date;
    protocol?: string;
    errors: string[];
  }> {
    try {
      // Validate cancellation request
      if (!(nfseNumber && reason)) {
        throw new Error('NFSe number and cancellation reason are required');
      }

      // Generate cancellation XML
      const cancellationXML = await this.generateCancellationXML(
        nfseNumber,
        reason
      );

      // Sign XML
      const signedXML = await this.signXML(cancellationXML);

      // Submit cancellation to municipality
      const cancellationResult = await this.submitCancellation(
        signedXML,
        nfseNumber
      );

      // Update database record
      await this.updateNFSeStatus(nfseNumber, 'cancelled', cancellationResult);

      return {
        success: true,
        cancellationDate: new Date(),
        protocol: cancellationResult.protocol,
        errors: [],
      };
    } catch (error) {
      console.error('Error cancelling NFSe:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Query NFSe status
   */
  async queryNFSeStatus(nfseNumber: string): Promise<{
    status: string;
    issueDate?: Date;
    cancellationDate?: Date;
    xmlContent?: string;
    pdfUrl?: string;
    errors: string[];
  }> {
    try {
      // Query municipality system
      const queryResult = await this.queryMunicipality(nfseNumber);

      // Update local database if needed
      await this.syncNFSeStatus(nfseNumber, queryResult);

      return queryResult;
    } catch (error) {
      console.error('Error querying NFSe status:', error);
      return {
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // =================== PRIVATE METHODS ===================

  private async validateBusinessRules(request: NFSeRequest): Promise<void> {
    // Validate dates
    if (request.issueDate > new Date()) {
      throw new Error('Issue date cannot be in the future');
    }

    // Validate tax calculations
    const expectedIssAmount =
      request.serviceData.netAmount * request.serviceData.issRate;
    if (Math.abs(request.serviceData.issAmount - expectedIssAmount) > 0.01) {
      throw new Error('ISS amount calculation is incorrect');
    }

    // Validate net amount
    const expectedNetAmount =
      request.serviceData.grossAmount - request.serviceData.deductions;
    if (Math.abs(request.serviceData.netAmount - expectedNetAmount) > 0.01) {
      throw new Error('Net amount calculation is incorrect');
    }

    // Municipality-specific validations
    await this.validateMunicipalityRules(request);
  }

  private async generateXML(request: NFSeRequest): Promise<string> {
    // This would generate the actual NFSe XML based on municipality schema
    // Implementation varies by municipality but follows ABRASF standards

    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<GerarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps Id="${request.externalId}">
    <NumeroLote>${this.generateLoteNumber()}</NumeroLote>
    <Cnpj>${this.config.cnpj.replace(/[^\d]/g, '')}</Cnpj>
    <InscricaoMunicipal>${this.config.municipalInscription}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfRps Id="${request.externalId}">
          <IdentificacaoRps>
            <Numero>${this.generateRpsNumber()}</Numero>
            <Serie>001</Serie>
            <Tipo>1</Tipo>
          </IdentificacaoRps>
          <DataEmissao>${this.formatDateForXML(request.issueDate)}</DataEmissao>
          <NaturezaOperacao>1</NaturezaOperacao>
          <RegimeEspecialTributacao>${request.specialRegime || ''}</RegimeEspecialTributacao>
          <OptanteSimplesNacional>${request.optantSimplesNacional ? '1' : '2'}</OptanteSimplesNacional>
          <IncentivadorCultural>2</IncentivadorCultural>
          <Status>1</Status>
          <Servico>
            <Valores>
              <ValorServicos>${this.formatCurrency(request.serviceData.grossAmount)}</ValorServicos>
              <ValorDeducoes>${this.formatCurrency(request.serviceData.deductions)}</ValorDeducoes>
              <ValorPis>${this.formatCurrency(request.serviceData.pisAmount)}</ValorPis>
              <ValorCofins>${this.formatCurrency(request.serviceData.cofinsAmount)}</ValorCofins>
              <ValorInss>${this.formatCurrency(request.serviceData.inssAmount)}</ValorInss>
              <ValorIr>${this.formatCurrency(request.serviceData.irAmount)}</ValorIr>
              <ValorCsll>${this.formatCurrency(request.serviceData.csllAmount)}</ValorCsll>
              <IssRetido>${request.retainIss ? '1' : '2'}</IssRetido>
              <ValorIss>${this.formatCurrency(request.serviceData.issAmount)}</ValorIss>
              <OutrasRetencoes>0.00</OutrasRetencoes>
              <BaseCalculo>${this.formatCurrency(request.serviceData.netAmount)}</BaseCalculo>
              <Aliquota>${(request.serviceData.issRate * 100).toFixed(4)}</Aliquota>
              <ValorLiquidoNfse>${this.formatCurrency(request.serviceData.netAmount)}</ValorLiquidoNfse>
              <DescontoIncondicionado>0.00</DescontoIncondicionado>
              <DescontoCondicionado>0.00</DescontoCondicionado>
            </Valores>
            <ItemListaServico>${request.serviceData.serviceCode}</ItemListaServico>
            <CodigoCnae>${request.serviceData.cnaeCode || ''}</CodigoCnae>
            <CodigoTributacaoMunicipio>${request.serviceData.taxCode || ''}</CodigoTributacaoMunicipio>
            <Discriminacao><![CDATA[${request.serviceData.description}]]></Discriminacao>
            <CodigoMunicipio>${this.config.municipalityCode}</CodigoMunicipio>
            <ExigibilidadeISS>${request.issExigibility}</ExigibilidadeISS>
          </Servico>
          <Prestador>
            <Cnpj>${this.config.cnpj.replace(/[^\d]/g, '')}</Cnpj>
            <InscricaoMunicipal>${this.config.municipalInscription}</InscricaoMunicipal>
          </Prestador>
          <Tomador>
            <IdentificacaoTomador>
              <CpfCnpj>
                ${
                  request.customerData.documentType === 'cpf'
                    ? `<Cpf>${request.customerData.document.replace(/[^\d]/g, '')}</Cpf>`
                    : `<Cnpj>${request.customerData.document.replace(/[^\d]/g, '')}</Cnpj>`
                }
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${request.customerData.name}</RazaoSocial>
            <Endereco>
              <Endereco>${request.customerData.address.street}</Endereco>
              <Numero>${request.customerData.address.number}</Numero>
              <Complemento>${request.customerData.address.complement || ''}</Complemento>
              <Bairro>${request.customerData.address.district}</Bairro>
              <CodigoMunicipio>${this.config.municipalityCode}</CodigoMunicipio>
              <Uf>${request.customerData.address.state}</Uf>
              <Cep>${request.customerData.address.zipCode.replace(/[^\d]/g, '')}</Cep>
            </Endereco>
            <Contato>
              <Telefone>${request.customerData.phone || ''}</Telefone>
              <Email>${request.customerData.email || ''}</Email>
            </Contato>
          </Tomador>
        </InfRps>
      </Rps>
    </ListaRps>
  </LoteRps>
</GerarNfseEnvio>`;

    return xmlTemplate;
  }

  private async signXML(xmlContent: string): Promise<string> {
    // Digital signature implementation would go here
    // This involves X.509 certificate handling and XML-DSig
    // Implementation depends on the digital certificate and signature requirements

    // For now, return the unsigned XML (in production, this would be properly signed)
    return xmlContent;
  }

  private async submitToMunicipality(
    signedXML: string,
    _request: NFSeRequest
  ): Promise<any> {
    // HTTP/SOAP request to municipality webservice
    // Implementation varies by municipality but follows standard patterns

    try {
      const response = await fetch(this.config.webserviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'GerarNfse',
        },
        body: this.wrapInSOAPEnvelope(signedXML),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      return this.parseSOAPResponse(responseText);
    } catch (error) {
      console.error('Error submitting to municipality:', error);
      throw error;
    }
  }

  private async processSubmissionResponse(
    submissionResult: any,
    _request: NFSeRequest
  ): Promise<NFSeResponse> {
    // Process municipality response and extract NFSe data
    // Implementation varies by municipality response format

    if (submissionResult.success) {
      return {
        success: true,
        nfseNumber: submissionResult.nfseNumber,
        verificationCode: submissionResult.verificationCode,
        accessKey: submissionResult.accessKey,
        issueDate: new Date(submissionResult.issueDate),
        xmlContent: submissionResult.xmlContent,
        pdfUrl: submissionResult.pdfUrl,
        protocol: submissionResult.protocol,
        errors: [],
        warnings: submissionResult.warnings || [],
        status: 'approved',
      };
    }
    return {
      success: false,
      nfseNumber: null,
      verificationCode: null,
      accessKey: null,
      issueDate: null,
      xmlContent: null,
      pdfUrl: null,
      protocol: null,
      errors: submissionResult.errors || [],
      warnings: submissionResult.warnings || [],
      status: 'rejected',
    };
  }

  private createErrorResponse(error: any, _externalId: string): NFSeResponse {
    return {
      success: false,
      nfseNumber: null,
      verificationCode: null,
      accessKey: null,
      issueDate: null,
      xmlContent: null,
      pdfUrl: null,
      protocol: null,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: [],
      status: 'error',
    };
  }

  // Helper methods
  private initializeMunicipalityServices(): void {
    // Initialize municipality-specific configurations
    // This would load specific configurations for different municipalities
  }

  private validateMunicipalityRules(_request: NFSeRequest): Promise<void> {
    // Municipality-specific business rule validation
    return Promise.resolve();
  }

  private generateLoteNumber(): string {
    return Date.now().toString();
  }

  private generateRpsNumber(): string {
    return Date.now().toString();
  }

  private formatDateForXML(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  private wrapInSOAPEnvelope(content: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header />
  <soap:Body>
    ${content}
  </soap:Body>
</soap:Envelope>`;
  }

  private parseSOAPResponse(_responseText: string): any {
    // Parse SOAP response and extract relevant data
    // This would include XML parsing and error handling
    return { success: true }; // Simplified for now
  }

  private getBatchSize(priority: string): number {
    switch (priority) {
      case 'high':
        return 2;
      case 'normal':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }

  private getBatchDelay(priority: string): number {
    switch (priority) {
      case 'high':
        return 1000; // 1 second
      case 'normal':
        return 2000; // 2 seconds
      case 'low':
        return 5000; // 5 seconds
      default:
        return 2000;
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async storeNFSeRecord(
    _request: NFSeRequest,
    _response: NFSeResponse
  ): Promise<void> {
    // Store NFSe record in database
    // Implementation would use Supabase/database integration
  }

  private async updateNFSeStatus(
    _nfseNumber: string,
    _status: string,
    _data: any
  ): Promise<void> {
    // Update NFSe status in database
  }

  private async syncNFSeStatus(
    _nfseNumber: string,
    _queryResult: any
  ): Promise<void> {
    // Sync NFSe status with database
  }

  private async sendBatchCallback(
    callbackUrl: string,
    response: NFSeBatchResponse
  ): Promise<void> {
    // Send batch completion callback
    try {
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    } catch (error) {
      console.error('Failed to send batch callback:', error);
    }
  }

  private async generateCancellationXML(
    nfseNumber: string,
    _reason: string
  ): Promise<string> {
    return `<?xml version="1.0" encoding="UTF-8"?>
<CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Pedido>
    <InfPedidoCancelamento Id="cancel_${nfseNumber}">
      <IdentificacaoNfse>
        <Numero>${nfseNumber}</Numero>
        <Cnpj>${this.config.cnpj.replace(/[^\d]/g, '')}</Cnpj>
        <InscricaoMunicipal>${this.config.municipalInscription}</InscricaoMunicipal>
        <CodigoMunicipio>${this.config.municipalityCode}</CodigoMunicipio>
      </IdentificacaoNfse>
      <CodigoCancelamento>1</CodigoCancelamento>
    </InfPedidoCancelamento>
  </Pedido>
</CancelarNfseEnvio>`;
  }

  private async submitCancellation(
    _signedXML: string,
    _nfseNumber: string
  ): Promise<any> {
    // Submit cancellation to municipality
    return { protocol: `CANCEL_${Date.now()}` };
  }

  private async queryMunicipality(_nfseNumber: string): Promise<any> {
    // Query municipality for NFSe status
    return { status: 'approved', issueDate: new Date(), errors: [] };
  }
}

// =================== FACTORY & EXPORTS ===================

/**
 * Factory function to create NFSeGenerator instance
 */
export const createNFSeGenerator = (config: NFSeConfig): NFSeGenerator => {
  return new NFSeGenerator(config);
};

/**
 * Default export
 */
export default createNFSeGenerator;

/**
 * Utility functions for NFSe operations
 */
export const NFSeUtils = {
  validateCNPJ: (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    if (cleanCNPJ.length !== 14) {
      return false;
    }

    // CNPJ validation algorithm
    const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digits = cleanCNPJ.split('').map(Number);

    const checkDigit1 = NFSeUtils.calculateCheckDigit(
      digits.slice(0, 12),
      weights
    );
    const checkDigit2 = NFSeUtils.calculateCheckDigit(digits.slice(0, 13), [
      6,
      ...weights,
    ]);

    return digits[12] === checkDigit1 && digits[13] === checkDigit2;
  },

  validateCPF: (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    const digits = cleanCPF.split('').map(Number);
    const checkDigit1 = NFSeUtils.calculateCPFCheckDigit(
      digits.slice(0, 9),
      [10, 9, 8, 7, 6, 5, 4, 3, 2]
    );
    const checkDigit2 = NFSeUtils.calculateCPFCheckDigit(
      digits.slice(0, 10),
      [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    return digits[9] === checkDigit1 && digits[10] === checkDigit2;
  },

  calculateCheckDigit: (digits: number[], weights: number[]): number => {
    const sum = digits.reduce(
      (acc, digit, index) => acc + digit * weights[index],
      0
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  },

  calculateCPFCheckDigit: (digits: number[], weights: number[]): number => {
    const sum = digits.reduce(
      (acc, digit, index) => acc + digit * weights[index],
      0
    );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  },

  formatCNPJ: (cnpj: string): string => {
    const clean = cnpj.replace(/[^\d]/g, '');
    return clean.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  },

  formatCPF: (cpf: string): string => {
    const clean = cpf.replace(/[^\d]/g, '');
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  },
};
