import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  AIModelCategory,
  AIProvider,
  HealthcareAIUseCase,
  HealthcareDataClassification,
  LGPDDataCategory,
} from '@neonpro/shared';
import { AIProviderRouterService, ProviderStatus, RoutingStrategy } from '../ai-provider-router';
import { AuditTrailService } from '../audit-trail';
import { SemanticCacheService } from '../semantic-cache';

// Mock dependencies
jest.mock('../semantic-cache')
jest.mock('../audit-trail')

describe(_'AIProviderRouterService'), () => {
  let routerService: AIProviderRouterService;
  let mockSemanticCache: jest.Mocked<SemanticCacheService>;
  let mockAuditService: jest.Mocked<AuditTrailService>;

  beforeEach(() => {
    // Create mocked services
    mockSemanticCache = {
      findSimilarEntry: jest.fn(),
      addEntry: jest.fn(),
      isEnabled: jest.fn().mockReturnValue(true),
    } as any;

    mockAuditService = {
      logEvent: jest.fn(),
    } as any;

    // Initialize router with empty config to test default providers
    routerService = new AIProviderRouterService(
      mockSemanticCache,
      mockAuditService,
      [], // Empty config to trigger default provider initialization
    

  afterEach(() => {
    routerService.destroy(

<<<<<<< HEAD
  describe('Initialization', () => {
    it('should initialize with default healthcare-compliant providers', () => {
      const availableProviders = routerService.getAvailableProvidersList(
=======
  describe(_'Initialization'), () => {
    it(_'should initialize with default healthcare-compliant providers'), () => {
      const availableProviders = routerService.getAvailableProvidersList();
>>>>>>> origin/main

      expect(availableProviders).toContain(AIProvider.OPENAI
      expect(availableProviders).toContain(AIProvider.ANTHROPIC
      expect(availableProviders).toContain(AIProvider.AZURE
      expect(availableProviders).toContain(AIProvider.AWS_BEDROCK

<<<<<<< HEAD
    it('should have all providers in healthy state initially', () => {
      const healthChecks = routerService.getProviderHealth(
=======
    it(_'should have all providers in healthy state initially'), () => {
      const healthChecks = routerService.getProviderHealth();
>>>>>>> origin/main

      expect(Array.isArray(healthChecks)).toBe(true);
      healthChecks.forEach((health: any) => {
        expect(health.status).toBe(ProviderStatus.AVAILABLE
        expect(health.success_rate).toBe(100

<<<<<<< HEAD
  describe('Request Routing', () => {
    it('should route a basic healthcare request successfully',async () => {
=======
  describe(_'Request Routing'), () => {
    it(_'should route a basic healthcare request successfully',async () => {
>>>>>>> origin/main
      const request = {
        prompt: 'Como posso ajudar com sua consulta médica?',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          patient_id: 'patient_123',
          healthcare_professional_id: 'doctor_456',
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          max_tokens: 1000,
          temperature: 0.7,
          fallback_enabled: true,
          cache_enabled: true,
        },
        routing_config: {
          strategy: RoutingStrategy.HEALTHCARE_SPECIFIC,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_123',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      // Mock cache miss
      mockSemanticCache.findSimilarEntry.mockResolvedValue(null

      const response = await routerService.routeRequest(request

      expect(response).toBeDefined(
      expect(response.content).toBeTruthy(
      expect(response.provider_used).toBeDefined(
      expect(response.model_used).toBeTruthy(
      expect(response.compliance.lgpd_compliant).toBe(true);
      expect(response.compliance.audit_logged).toBe(true);
      expect(response.metrics.total_latency_ms).toBeGreaterThan(0
      expect(response.metrics.cache_hit).toBe(false);

<<<<<<< HEAD
    it('should handle emergency requests with priority routing',async () => {
=======
    it(_'should handle emergency requests with priority routing',async () => {
>>>>>>> origin/main
      const emergencyRequest = {
        prompt: 'Paciente com dor no peito urgente',
        healthcare_context: {
          use_case: HealthcareAIUseCase.SYMPTOMS_ANALYSIS,
          patient_id: 'patient_emergency',
          healthcare_professional_id: 'doctor_456',
          is_emergency: true,
          contains_pii: true,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: true,
          cache_enabled: false, // Emergency requests shouldn't use cache
        },
        routing_config: {
          strategy: RoutingStrategy.EMERGENCY_PRIORITY,
          priority_level: 'emergency' as const,
        },
        request_metadata: {
          request_id: 'req_emergency',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(emergencyRequest

      expect(response).toBeDefined(
      expect(response.compliance.pii_redacted).toBe(true);
      expect(response.compliance.audit_logged).toBe(true);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'emergency_access',
        }),
      

<<<<<<< HEAD
    it('should use semantic cache when available',async () => {
=======
    it(_'should use semantic cache when available',async () => {
>>>>>>> origin/main
      const request = {
        prompt: 'Informações sobre diabetes',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_EDUCATION,
          patient_id: 'patient_123',
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: true,
          cache_enabled: true,
        },
        routing_config: {
          strategy: RoutingStrategy.COST_OPTIMIZED,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_cache_test',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      // Mock cache hit
      mockSemanticCache.findSimilarEntry.mockResolvedValue({
        id: 'cache_123',
        response: 'Informações sobre diabetes do cache',
        accessedAt: new Date(),
        accessCount: 1,
      } as any

      const response = await routerService.routeRequest(request

      expect(response.metrics.cache_hit).toBe(true);
      expect(response.provider_used).toBe(AIProvider.LOCAL
      expect(response.model_used).toBe('semantic-cache')
      expect(response.content).toBe('Informações sobre diabetes do cache')
      expect(response.metrics.total_cost_usd).toBe(0

<<<<<<< HEAD
  describe('Provider Selection Strategies', () => {
    it('should select cost-optimized provider',async () => {
=======
  describe(_'Provider Selection Strategies'), () => {
    it(_'should select cost-optimized provider',async () => {
>>>>>>> origin/main
      const request = {
        prompt: 'Consulta básica',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: false,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.COST_OPTIMIZED,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_cost_test',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(request

      expect(response).toBeDefined(
      expect(response.metrics.total_cost_usd).toBeGreaterThan(0
      // Should select a lower-cost provider like Anthropic
      expect([AIProvider.ANTHROPIC, AIProvider.AWS_BEDROCK]).toContain(
        response.provider_used,
      

<<<<<<< HEAD
    it('should select latency-optimized provider',async () => {
=======
    it(_'should select latency-optimized provider',async () => {
>>>>>>> origin/main
      const request = {
        prompt: 'Resposta rápida necessária',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: false,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.LATENCY_OPTIMIZED,
          max_latency_ms: 3000,
          priority_level: 'high' as const,
        },
        request_metadata: {
          request_id: 'req_latency_test',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(request

      expect(response).toBeDefined(
      expect(response.metrics.total_latency_ms).toBeLessThan(5000

<<<<<<< HEAD
  describe('Healthcare Compliance', () => {
    it('should reject requests without patient ID when PII is present',async () => {
=======
  describe(_'Healthcare Compliance'), () => {
    it(_'should reject requests without patient ID when PII is present',async () => {
>>>>>>> origin/main
      const invalidRequest = {
        prompt: 'Dados do paciente João Silva, CPF 123.456.789-00',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          // patient_id missing but contains_pii is true
          is_emergency: false,
          contains_pii: true,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: true,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.HEALTHCARE_SPECIFIC,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_invalid',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      await expect(routerService.routeRequest(invalidRequest)).rejects.toThrow(
        'LGPD Violation: Patient ID required when PII is present',
      

<<<<<<< HEAD
    it('should apply PII redaction when contains_pii is true',async () => {
=======
    it(_'should apply PII redaction when contains_pii is true',async () => {
>>>>>>> origin/main
      const request = {
        prompt: 'Paciente João Silva, CPF 123.456.789-00, telefone (11) 99999-9999',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          patient_id: 'patient_joao',
          healthcare_professional_id: 'doctor_456',
          is_emergency: false,
          contains_pii: true,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [
            LGPDDataCategory.HEALTH_DATA,
            LGPDDataCategory.PERSONAL_DATA,
          ],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: true,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.HEALTHCARE_SPECIFIC,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_pii_test',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(request

      expect(response).toBeDefined(
      expect(response.compliance.pii_redacted).toBe(true);
      expect(response.compliance.lgpd_compliant).toBe(true);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'data_subject_request',
          metadata: expect.objectContaining({
            patient_id: 'patient_joao',
            redaction_applied: true,
          }),
        }),
      

<<<<<<< HEAD
  describe('Error Handling and Fallbacks', () => {
    it('should handle provider failure with fallback',async () => {
=======
  describe(_'Error Handling and Fallbacks'), () => {
    it(_'should handle provider failure with fallback',async () => {
>>>>>>> origin/main
      // Disable all providers except one to test fallback
      routerService.setProviderEnabled(AIProvider.OPENAI, false
      routerService.setProviderEnabled(AIProvider.AZURE, false
      routerService.setProviderEnabled(AIProvider.AWS_BEDROCK, false
      // Keep only Anthropic enabled

      const request = {
        prompt: 'Teste de fallback',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          preferred_providers: [AIProvider.OPENAI], // Prefer disabled provider
          fallback_enabled: true,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.COST_OPTIMIZED,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_fallback_test',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(request

      expect(response).toBeDefined(
      expect(response.provider_used).toBe(AIProvider.ANTHROPIC); // Should fallback to available provider

  describe(_'Provider Management'), () => {
    it(_'should enable and disable providers correctly'), () => {
      expect(routerService.setProviderEnabled(AIProvider.OPENAI, false)).toBe(
        true,
      
      expect(routerService.setProviderEnabled(AIProvider.OPENAI, true)).toBe(
        true,
      
      expect(
        routerService.setProviderEnabled(
          'invalid_provider' as AIProvider,
          false,
        ),
      ).toBe(false);

<<<<<<< HEAD
    it('should return provider health metrics', () => {
      const health = routerService.getProviderHealth(AIProvider.OPENAI
=======
    it(_'should return provider health metrics'), () => {
      const health = routerService.getProviderHealth(AIProvider.OPENAI);
>>>>>>> origin/main

      expect(health).toBeDefined(
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('latency')
      expect(health).toHaveProperty('success_rate')
      expect(health).toHaveProperty('last_check')

<<<<<<< HEAD
    it('should return provider performance metrics', () => {
      const metrics = routerService.getProviderMetrics(AIProvider.OPENAI
=======
    it(_'should return provider performance metrics'), () => {
      const metrics = routerService.getProviderMetrics(AIProvider.OPENAI);
>>>>>>> origin/main

      expect(metrics).toBeDefined(
      expect(metrics).toHaveProperty('latency')
      expect(metrics).toHaveProperty('cost')
      expect(metrics).toHaveProperty('quality')
      expect(metrics).toHaveProperty('healthcare_compliance')

<<<<<<< HEAD
  describe('Input Validation and Security', () => {
    it('should reject requests with malicious content',async () => {
=======
  describe(_'Input Validation and Security'), () => {
    it(_'should reject requests with malicious content',async () => {
>>>>>>> origin/main
      const maliciousRequest = {
        prompt: '<script>alert("xss")</script> DROP TABLE patients;',
        healthcare_context: {
          use_case: HealthcareAIUseCase.PATIENT_COMMUNICATION,
          is_emergency: false,
          contains_pii: false,
          data_classification: HealthcareDataClassification.PATIENT_SENSITIVE,
          lgpd_categories: [LGPDDataCategory.HEALTH_DATA],
          requires_audit: true,
        },
        ai_config: {
          model_category: AIModelCategory.CHAT,
          fallback_enabled: true,
          cache_enabled: false,
        },
        routing_config: {
          strategy: RoutingStrategy.HEALTHCARE_SPECIFIC,
          priority_level: 'normal' as const,
        },
        request_metadata: {
          request_id: 'req_malicious',
          user_id: 'user_789',
          created_at: new Date(),
        },
      };

      const response = await routerService.routeRequest(maliciousRequest

      // Should process the request but with sanitized content
      expect(response).toBeDefined(
      expect(response.compliance.data_sanitized).toBe(true);

<<<<<<< HEAD
    it('should validate request structure',async () => {
=======
    it(_'should validate request structure',async () => {
>>>>>>> origin/main
      const invalidRequest = {
        // Missing required fields
        prompt: '',
        healthcare_context: {
          // Invalid use_case
          use_case: 'invalid_use_case',
        },
      };

      await expect(
        routerService.routeRequest(invalidRequest as any),
      ).rejects.toThrow('Invalid request')
