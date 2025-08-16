/**
 * CNPJ Consultation Service
 * Integration with Brasil API for company data consultation
 * Compliant with rate limits and caching strategies
 */

import {
  CNPJCache,
  type CNPJCompanyData,
  type CNPJConsultationResult,
  CNPJRateLimiter,
  cleanCNPJ,
  validateCNPJFormat,
} from './cnpj-validator';

/**
 * Brasil API Response Interface
 */
type BrasilAPIResponse = {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: string;
  nome_cidade_exterior?: string;
  codigo_natureza_juridica: string;
  data_inicio_atividade: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  descricao_tipo_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  codigo_municipio: string;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string;
  ddd_fax: string;
  qualificacao_do_responsavel: string;
  capital_social: string;
  porte: string;
  opcao_pelo_simples: string;
  data_opcao_pelo_simples?: string;
  data_exclusao_do_simples?: string;
  opcao_pelo_mei: string;
  situacao_especial?: string;
  data_situacao_especial?: string;
  cnaes_secundarios: Array<{
    codigo: string;
    descricao: string;
  }>;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: string;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal?: string;
    nome_representante_legal?: string;
    codigo_qualificacao_representante_legal?: string;
  }>;
};

/**
 * Error types for API consultation
 */
export enum CNPJConsultationError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Configuration for CNPJ consultation
 */
type CNPJConsultationConfig = {
  useCache: boolean;
  forceRefresh: boolean;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
};

const DEFAULT_CONFIG: CNPJConsultationConfig = {
  useCache: true,
  forceRefresh: false,
  timeout: 10_000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Main CNPJ consultation service
 */
export class CNPJConsultationService {
  private static readonly BASE_URL = 'https://brasilapi.com.br/api/cnpj/v1';

  /**
   * Consult CNPJ data from Brasil API
   */
  static async consultCNPJ(
    cnpj: string,
    clientIP = 'unknown',
    config: Partial<CNPJConsultationConfig> = {}
  ): Promise<CNPJConsultationResult> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Validate CNPJ format first
    const validation = validateCNPJFormat(cnpj);
    if (!validation.valid) {
      return {
        success: false,
        cached: false,
        errors: validation.errors || ['CNPJ inválido'],
      };
    }

    const cleanedCNPJ = cleanCNPJ(cnpj);

    // Check cache first (unless force refresh)
    if (finalConfig.useCache && !finalConfig.forceRefresh) {
      const cached = CNPJCache.get(cleanedCNPJ);
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
          cache_expiry: CNPJCache.getCacheExpiry(cleanedCNPJ)?.toISOString(),
        };
      }
    }

    // Check rate limiting
    if (!CNPJRateLimiter.canMakeRequest(clientIP)) {
      return {
        success: false,
        cached: false,
        errors: [CNPJConsultationError.RATE_LIMIT_EXCEEDED],
        rate_limit: {
          remaining: CNPJRateLimiter.getRemainingRequests(clientIP),
          reset_time: CNPJRateLimiter.getResetTime(clientIP).toISOString(),
        },
      };
    }

    // Make API request with retry logic
    try {
      const data = await CNPJConsultationService.fetchWithRetry(
        `${CNPJConsultationService.BASE_URL}/${cleanedCNPJ}`,
        finalConfig
      );

      const transformed =
        CNPJConsultationService.transformBrasilAPIResponse(data);

      // Cache successful result
      if (finalConfig.useCache) {
        CNPJCache.set(cleanedCNPJ, transformed);
      }

      return {
        success: true,
        data: transformed,
        cached: false,
        rate_limit: {
          remaining: CNPJRateLimiter.getRemainingRequests(clientIP),
          reset_time: CNPJRateLimiter.getResetTime(clientIP).toISOString(),
        },
      };
    } catch (error) {
      return CNPJConsultationService.handleConsultationError(error, clientIP);
    }
  }

  /**
   * Fetch with retry logic and timeout
   */
  private static async fetchWithRetry(
    url: string,
    config: CNPJConsultationConfig,
    attempt = 1
  ): Promise<BrasilAPIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'NeonPro/1.0 (Clinic Management System)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(CNPJConsultationError.NOT_FOUND);
        }
        if (response.status === 403 || response.status === 429) {
          throw new Error(CNPJConsultationError.RATE_LIMIT_EXCEEDED);
        }
        throw new Error(CNPJConsultationError.API_ERROR);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic
      if (
        attempt < config.retryAttempts &&
        error instanceof Error &&
        error.name !== CNPJConsultationError.NOT_FOUND
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.retryDelay * attempt)
        );

        return CNPJConsultationService.fetchWithRetry(url, config, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Transform Brasil API response to our interface
   */
  private static transformBrasilAPIResponse(
    response: BrasilAPIResponse
  ): CNPJCompanyData {
    return {
      cnpj: response.cnpj,
      razao_social: response.razao_social,
      nome_fantasia: response.nome_fantasia || undefined,
      porte: response.porte,
      atividade_principal: {
        code: response.cnae_fiscal,
        text: response.cnae_fiscal_descricao,
      },
      atividades_secundarias: response.cnaes_secundarios.map((cnae) => ({
        code: cnae.codigo,
        text: cnae.descricao,
      })),
      endereco: {
        logradouro: `${response.descricao_tipo_logradouro} ${response.logradouro}`,
        numero: response.numero,
        complemento: response.complemento || undefined,
        bairro: response.bairro,
        municipio: response.municipio,
        uf: response.uf,
        cep: response.cep,
      },
      telefone: response.ddd_telefone_1
        ? `(${response.ddd_telefone_1.slice(0, 2)}) ${response.ddd_telefone_1.slice(2)}`
        : undefined,
      situacao: response.descricao_situacao_cadastral,
      data_situacao: response.data_situacao_cadastral,
      motivo_situacao: response.motivo_situacao_cadastral || undefined,
      natureza_juridica: response.codigo_natureza_juridica,
      capital_social: Number.parseFloat(
        response.capital_social.replace(',', '.')
      ),
      data_inicio_atividade: response.data_inicio_atividade,
      qsa: response.qsa?.map((socio) => ({
        nome: socio.nome_socio,
        qual: socio.codigo_qualificacao_socio,
        nome_rep_legal: socio.nome_representante_legal,
        qual_rep_legal: socio.codigo_qualificacao_representante_legal,
      })),
    };
  }

  /**
   * Handle consultation errors
   */
  private static handleConsultationError(
    error: any,
    clientIP: string
  ): CNPJConsultationResult {
    let _errorType = CNPJConsultationError.API_ERROR;
    let errorMessage = 'Erro desconhecido na consulta';

    if (error instanceof Error) {
      switch (error.message) {
        case CNPJConsultationError.NOT_FOUND:
          _errorType = CNPJConsultationError.NOT_FOUND;
          errorMessage = 'CNPJ não encontrado na Receita Federal';
          break;
        case CNPJConsultationError.RATE_LIMIT_EXCEEDED:
          _errorType = CNPJConsultationError.RATE_LIMIT_EXCEEDED;
          errorMessage =
            'Limite de consultas excedido. Tente novamente em alguns minutos.';
          break;
        case 'AbortError':
          _errorType = CNPJConsultationError.NETWORK_ERROR;
          errorMessage = 'Timeout na consulta. Tente novamente.';
          break;
        default:
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            _errorType = CNPJConsultationError.NETWORK_ERROR;
            errorMessage = 'Erro de conexão. Verifique sua internet.';
          }
      }
    }

    return {
      success: false,
      cached: false,
      errors: [errorMessage],
      rate_limit: {
        remaining: CNPJRateLimiter.getRemainingRequests(clientIP),
        reset_time: CNPJRateLimiter.getResetTime(clientIP).toISOString(),
      },
    };
  }

  /**
   * Batch consultation for multiple CNPJs
   */
  static async batchConsultCNPJ(
    cnpjs: string[],
    clientIP = 'unknown',
    config: Partial<CNPJConsultationConfig> = {}
  ): Promise<Map<string, CNPJConsultationResult>> {
    const results = new Map<string, CNPJConsultationResult>();

    // Process in batches to respect rate limits
    const batchSize = 2; // Conservative batch size
    const delay = 1000; // 1 second between batches

    for (let i = 0; i < cnpjs.length; i += batchSize) {
      const batch = cnpjs.slice(i, i + batchSize);

      const batchPromises = batch.map(async (cnpj) => {
        const result = await CNPJConsultationService.consultCNPJ(
          cnpj,
          clientIP,
          config
        );
        results.set(cnpj, result);
      });

      await Promise.all(batchPromises);

      // Add delay between batches (except for the last one)
      if (i + batchSize < cnpjs.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  /**
   * Clear all caches (for admin purposes)
   */
  static clearCache(): void {
    CNPJCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    cached_entries: number;
    cache_size_estimate: string;
  } {
    // Note: This is a simplified implementation
    // In production, you might want more detailed statistics
    const entriesCount = (CNPJCache as any).cache?.size || 0;

    return {
      cached_entries: entriesCount,
      cache_size_estimate: `~${entriesCount * 2}KB`,
    };
  }
}

export default CNPJConsultationService;
