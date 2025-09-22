/**
 * Documentation Generator Service Tests
 * T084 - Comprehensive Documentation
 */

import { beforeEach, describe, expect, it } from 'vitest';
import DocumentationGeneratorService, {
  DOCUMENTATION_FORMATS,
  DOCUMENTATION_LABELS_PT_BR,
  DOCUMENTATION_LANGUAGES,
  DOCUMENTATION_TYPES,
  type DocumentationConfig,
  DocumentationConfigSchema,
  type DocumentationReport,
  HEALTHCARE_DOC_CATEGORIES,
} from '../documentation-generator';

describe(('Documentation Generator Service', () => {
  let _service: DocumentationGeneratorService;
  let config: DocumentationConfig;

  beforeEach(() => {
    config = {
      projectName: 'NeonPro Healthcare Platform',
      version: '1.0.0',
      outputDirectory: './docs',
      formats: [DOCUMENTATION_FORMATS.MARKDOWN, DOCUMENTATION_FORMATS.HTML],
      languages: [
        DOCUMENTATION_LANGUAGES.PORTUGUESE_BR,
        DOCUMENTATION_LANGUAGES.ENGLISH,
      ],
      includeTypes: [
        DOCUMENTATION_TYPES.API,
        DOCUMENTATION_TYPES.COMPONENT,
        DOCUMENTATION_TYPES.ARCHITECTURE,
        DOCUMENTATION_TYPES.DEPLOYMENT,
        DOCUMENTATION_TYPES.USER_GUIDE,
        DOCUMENTATION_TYPES.DEVELOPER_GUIDE,
      ],
      healthcareCategories: [
        HEALTHCARE_DOC_CATEGORIES.PATIENT_MANAGEMENT,
        HEALTHCARE_DOC_CATEGORIES.APPOINTMENT_SCHEDULING,
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
        HEALTHCARE_DOC_CATEGORIES.ACCESSIBILITY_FEATURES,
        HEALTHCARE_DOC_CATEGORIES.MOBILE_OPTIMIZATION,
      ],
      includeExamples: true,
      includeInteractiveExamples: true,
      validateCompliance: true,
      generateTOC: true,
      includeSearchIndex: true,
    };
    service = new DocumentationGeneratorService(config
  }

  describe(('Configuration Validation', () => {
    it(('should validate valid documentation configuration', () => {
      const validConfig = {
        projectName: 'Test Project',
        version: '1.0.0',
        outputDirectory: './docs',
        formats: [DOCUMENTATION_FORMATS.MARKDOWN],
        languages: [DOCUMENTATION_LANGUAGES.PORTUGUESE_BR],
        includeTypes: [DOCUMENTATION_TYPES.API],
        healthcareCategories: [HEALTHCARE_DOC_CATEGORIES.PATIENT_MANAGEMENT],
        includeExamples: true,
        includeInteractiveExamples: false,
        validateCompliance: true,
        generateTOC: true,
        includeSearchIndex: false,
      };

      const result = DocumentationConfigSchema.safeParse(validConfig
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.projectName).toBe('Test Project')
        expect(result.data.version).toBe('1.0.0')
        expect(result.data.formats).toContain(DOCUMENTATION_FORMATS.MARKDOWN
        expect(result.data.languages).toContain(
          DOCUMENTATION_LANGUAGES.PORTUGUESE_BR,
        
      }
    }

    it(('should use default values for optional configuration', () => {
      const minimalConfig = {};
      const result = DocumentationConfigSchema.parse(minimalConfig

      expect(result.projectName).toBe('NeonPro Healthcare Platform')
      expect(result.version).toBe('1.0.0')
      expect(result.outputDirectory).toBe('./docs')
      expect(result.formats).toEqual([
        DOCUMENTATION_FORMATS.MARKDOWN,
        DOCUMENTATION_FORMATS.HTML,
      ]
      expect(result.languages).toEqual([
        DOCUMENTATION_LANGUAGES.PORTUGUESE_BR,
        DOCUMENTATION_LANGUAGES.ENGLISH,
      ]
      expect(result.includeExamples).toBe(true);
      expect(result.validateCompliance).toBe(true);
    }

    it(('should validate healthcare categories', () => {
      const configWithHealthcare = {
        healthcareCategories: [
          HEALTHCARE_DOC_CATEGORIES.PATIENT_MANAGEMENT,
          HEALTHCARE_DOC_CATEGORIES.APPOINTMENT_SCHEDULING,
          HEALTHCARE_DOC_CATEGORIES.MEDICAL_RECORDS,
          HEALTHCARE_DOC_CATEGORIES.EMERGENCY_PROCEDURES,
          HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
        ],
      };

      const result = DocumentationConfigSchema.parse(configWithHealthcare
      expect(result.healthcareCategories).toHaveLength(5
      expect(result.healthcareCategories).toContain(
        HEALTHCARE_DOC_CATEGORIES.PATIENT_MANAGEMENT,
      
      expect(result.healthcareCategories).toContain(
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
      
    }
  }

  describe(('Documentation Generation', () => {
    it(_'should generate comprehensive documentation report',async () => {

      expect(report).toBeDefined(
      expect(report.generatedAt).toBeInstanceOf(Date
      expect(report.config).toEqual(config
      expect(report.sections).toBeInstanceOf(Array
      expect(report.statistics).toBeDefined(
      expect(report.validationResults).toBeDefined(
      expect(report.recommendations).toBeInstanceOf(Array
      expect(report.errors).toBeInstanceOf(Array
    }

    it(_'should generate API documentation section',async () => {
      const apiConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.API],
      };
      const apiService = new DocumentationGeneratorService(apiConfig
      const report = await apiService.generateDocumentation(

      const apiSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.API,
      
      expect(apiSection).toBeDefined(
      expect(apiSection?.title).toBe('API Documentation')
      expect(apiSection?.titlePtBr).toBe(
        DOCUMENTATION_LABELS_PT_BR.apiReference,
      
      expect(apiSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.PATIENT_MANAGEMENT,
      
      expect(apiSection?.examples).toBeDefined(
      expect(apiSection?.examples?.length).toBeGreaterThan(0
    }

    it(_'should generate component documentation section',async () => {
      const componentConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.COMPONENT],
      };
      const componentService = new DocumentationGeneratorService(
        componentConfig,
      
      const report = await componentService.generateDocumentation(

      const componentSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.COMPONENT,
      
      expect(componentSection).toBeDefined(
      expect(componentSection?.title).toBe('Component Documentation')
      expect(componentSection?.titlePtBr).toBe('Documentação de Componentes')
      expect(componentSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.ACCESSIBILITY_FEATURES,
      
      expect(componentSection?.metadata.wcagCompliance).toBe(true);
      expect(componentSection?.metadata.healthcareCompliance).toBe(true);
      expect(componentSection?.metadata.mobileOptimized).toBe(true);
    }

    it(_'should generate architecture documentation section',async () => {
      const archConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.ARCHITECTURE],
      };
      const archService = new DocumentationGeneratorService(archConfig
      const report = await archService.generateDocumentation(

      const archSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.ARCHITECTURE,
      
      expect(archSection).toBeDefined(
      expect(archSection?.title).toBe('System Architecture')
      expect(archSection?.titlePtBr).toBe('Arquitetura do Sistema')
      expect(archSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
      
    }

    it(_'should generate deployment documentation section',async () => {
      const deployConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.DEPLOYMENT],
      };
      const deployService = new DocumentationGeneratorService(deployConfig
      const report = await deployService.generateDocumentation(

      const deploySection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.DEPLOYMENT,
      
      expect(deploySection).toBeDefined(
      expect(deploySection?.title).toBe('Deployment Guide')
      expect(deploySection?.titlePtBr).toBe(
        DOCUMENTATION_LABELS_PT_BR.deploymentGuide,
      
      expect(deploySection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
      
    }

    it(_'should generate user guide documentation section',async () => {
      const userConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.USER_GUIDE],
      };
      const userService = new DocumentationGeneratorService(userConfig
      const report = await userService.generateDocumentation(

      const userSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.USER_GUIDE,
      
      expect(userSection).toBeDefined(
      expect(userSection?.title).toBe('User Guide')
      expect(userSection?.titlePtBr).toBe('Guia do Usuário')
      expect(userSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.ACCESSIBILITY_FEATURES,
      
    }

    it(_'should generate developer guide documentation section',async () => {
      const devConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.DEVELOPER_GUIDE],
      };
      const devService = new DocumentationGeneratorService(devConfig
      const report = await devService.generateDocumentation(

      const devSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.DEVELOPER_GUIDE,
      
      expect(devSection).toBeDefined(
      expect(devSection?.title).toBe('Developer Guide')
      expect(devSection?.titlePtBr).toBe('Guia do Desenvolvedor')
      expect(devSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
      
    }

    it(_'should generate healthcare compliance documentation section',async () => {
      const complianceConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.HEALTHCARE_COMPLIANCE],
      };
      const complianceService = new DocumentationGeneratorService(
        complianceConfig,
      
      const report = await complianceService.generateDocumentation(

      const complianceSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.HEALTHCARE_COMPLIANCE,
      
      expect(complianceSection).toBeDefined(
      expect(complianceSection?.title).toBe('Healthcare Compliance')
      expect(complianceSection?.titlePtBr).toBe('Conformidade de Saúde')
      expect(complianceSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
      
    }

    it(_'should generate accessibility documentation section',async () => {
      const accessibilityConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.ACCESSIBILITY],
      };
      const accessibilityService = new DocumentationGeneratorService(
        accessibilityConfig,
      
      const report = await accessibilityService.generateDocumentation(

      const accessibilitySection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.ACCESSIBILITY,
      
      expect(accessibilitySection).toBeDefined(
      expect(accessibilitySection?.title).toBe('Accessibility Documentation')
      expect(accessibilitySection?.titlePtBr).toBe(
        'Documentação de Acessibilidade',
      
      expect(accessibilitySection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.ACCESSIBILITY_FEATURES,
      
    }

    it(_'should generate mobile documentation section',async () => {
      const mobileConfig = {
        ...config,
        includeTypes: [DOCUMENTATION_TYPES.MOBILE],
      };
      const mobileService = new DocumentationGeneratorService(mobileConfig
      const report = await mobileService.generateDocumentation(

      const mobileSection = report.sections.find(
        s => s.type === DOCUMENTATION_TYPES.MOBILE,
      
      expect(mobileSection).toBeDefined(
      expect(mobileSection?.title).toBe('Mobile Documentation')
      expect(mobileSection?.titlePtBr).toBe('Documentação Móvel')
      expect(mobileSection?.category).toBe(
        HEALTHCARE_DOC_CATEGORIES.MOBILE_OPTIMIZATION,
      
    }
  }

  describe(('Documentation Statistics', () => {
    it(_'should generate accurate statistics',async () => {

      expect(report.statistics.totalSections).toBeGreaterThan(0
      expect(report.statistics.totalExamples).toBeGreaterThan(0
      expect(report.statistics.totalPages).toBeGreaterThan(0
      expect(report.statistics.languagesCovered).toEqual(config.languages
      expect(report.statistics.formatsCovered).toEqual(config.formats
      expect(report.statistics.healthcareCategoriesCovered).toEqual(
        config.healthcareCategories,
      
      expect(report.statistics.complianceValidated).toBe(true);
      expect(report.statistics.accessibilityValidated).toBe(true);
      expect(report.statistics.mobileOptimized).toBe(true);
    }

    it(_'should count examples correctly',async () => {

      const totalExamplesFromSections = report.sections.reduce((sum, section) => sum + (section.examples?.length || 0),
        0,
      

      expect(report.statistics.totalExamples).toBe(totalExamplesFromSections
    }

    it(_'should validate healthcare categories coverage',async () => {

      const categoriesInSections = [
        ...new Set(report.sections.map(s => s.category).filter(Boolean)),
      ];


      expect(report.validationResults.contentQuality).toBeGreaterThan(80
      expect(report.validationResults.translationCompleteness).toBeGreaterThan(
        80,
      
      expect(report.validationResults.exampleAccuracy).toBeGreaterThan(80
      expect(report.validationResults.complianceAlignment).toBeGreaterThan(80
      expect(report.validationResults.accessibilityCompliance).toBeGreaterThan(
        80,
      
      expect(report.validationResults.mobileOptimization).toBeGreaterThan(80
    }

    it(_'should generate recommendations based on validation results',async () => {

      expect(report.recommendations).toBeInstanceOf(Array
      expect(report.recommendations.length).toBeGreaterThan(0

      // Should have positive recommendations for good quality
      const positiveRecommendations = report.recommendations.filter(
        rec => rec.includes('excelente') || rec.includes('manter'),
      
      expect(positiveRecommendations.length).toBeGreaterThan(0
    }

    it(_'should validate section metadata',async () => {
      expect(DOCUMENTATION_LABELS_PT_BR.patientManagement).toBe(
        'Gestão de Pacientes',
      
      expect(DOCUMENTATION_LABELS_PT_BR.appointmentScheduling).toBe(
        'Agendamento de Consultas',
      
      expect(DOCUMENTATION_LABELS_PT_BR.lgpdCompliance).toBe(
        'Conformidade LGPD',
      
      expect(DOCUMENTATION_LABELS_PT_BR.mobileAccessibility).toBe(
        'Acessibilidade Móvel',
      
      expect(DOCUMENTATION_LABELS_PT_BR.codingStandards).toBe(
        'Padrões de Codificação',
      
    }

    it(_'should include Portuguese translations in sections',async () => {

      report.sections.forEach(section => {
        if (config.languages.includes(DOCUMENTATION_LANGUAGES.PORTUGUESE_BR)) {
          expect(section.titlePtBr).toBeDefined(
          expect(section.contentPtBr).toBeDefined(
        }
      }
    }

    it(_'should include Portuguese translations in examples',async () => {

      report.sections.forEach(section => {
        section.examples?.forEach(example => {
          if (
            config.languages.includes(DOCUMENTATION_LANGUAGES.PORTUGUESE_BR)
          ) {
            expect(example.titlePtBr).toBeDefined(
            expect(example.descriptionPtBr).toBeDefined(
          }
        }
      }
    }
  }

  describe(('Healthcare Compliance Integration', () => {
    it(_'should include healthcare compliance metadata',async () => {

      const healthcareSections = report.sections.filter(
        s =>
          s.category
          && Object.values(HEALTHCARE_DOC_CATEGORIES).includes(s.category),
      

      expect(healthcareSections.length).toBeGreaterThan(0

      healthcareSections.forEach(section => {
        expect(section.metadata.healthcareCompliance).toBe(true);
        // Some sections may have healthcare in different tag positions
        const hasHealthcareTag = section.metadata.tags.some(
          tag =>
            tag.includes('healthcare')
            || tag.includes('patient')
            || tag.includes('medical'),
        
        expect(
          hasHealthcareTag
            || section.category
              === HEALTHCARE_DOC_CATEGORIES.COMPLIANCE_VALIDATION,
        ).toBe(true);
      }
    }

    it(_'should include accessibility compliance metadata',async () => {

      const accessibilitySections = report.sections.filter(
        s => s.category === HEALTHCARE_DOC_CATEGORIES.ACCESSIBILITY_FEATURES,
      

      expect(accessibilitySections.length).toBeGreaterThan(0

      accessibilitySections.forEach(section => {
        expect(section.metadata.wcagCompliance).toBe(true);
        expect(section.metadata.tags).toContain('accessibility')
      }
    }

    it(_'should include mobile optimization metadata',async () => {

      // Check if mobile documentation is included in the types
      const hasMobileType = config.includeTypes.includes(
        DOCUMENTATION_TYPES.MOBILE,
      

      if (hasMobileType) {
        const mobileSections = report.sections.filter(
          s => s.category === HEALTHCARE_DOC_CATEGORIES.MOBILE_OPTIMIZATION,
        

        expect(mobileSections.length).toBeGreaterThan(0

        mobileSections.forEach(section => {
          expect(section.metadata.mobileOptimized).toBe(true);
          expect(section.metadata.tags).toContain('mobile')
        }
      } else {
        // If mobile type is not included, check that mobile optimization is still present in other sections
        const sectionsWithMobileOptimization = report.sections.filter(
          s => s.metadata.mobileOptimized,
        
        expect(sectionsWithMobileOptimization.length).toBeGreaterThan(0
      }
    }
  }

  describe(('Documentation Examples', () => {
    it(_'should include interactive examples when enabled',async () => {
      const interactiveConfig = {
        ...config,
        includeInteractiveExamples: true,
      };
      const interactiveService = new DocumentationGeneratorService(
        interactiveConfig,
      
      const report = await interactiveService.generateDocumentation(

      const sectionsWithExamples = report.sections.filter(
        s => s.examples && s.examples.length > 0,
      
      expect(sectionsWithExamples.length).toBeGreaterThan(0

      sectionsWithExamples.forEach(section => {
        section.examples?.forEach(example => {
          expect(example.interactive).toBe(true);
          expect(example.code).toBeDefined(
          expect(example.healthcareContext).toBeDefined(
          expect(example.accessibilityNotes).toBeDefined(
          expect(example.mobileNotes).toBeDefined(
        }
      }
    }

    it(_'should include healthcare context in examples',async () => {

      const healthcareExamples = report.sections
        .flatMap(s => s.examples || [])
        .filter(e => e.healthcareContext

      expect(healthcareExamples.length).toBeGreaterThan(0

      healthcareExamples.forEach(example => {

      const accessibilityExamples = report.sections
        .flatMap(s => s.examples || [])
        .filter(e => e.accessibilityNotes

      expect(accessibilityExamples.length).toBeGreaterThan(0

      accessibilityExamples.forEach(example => {

      const mobileExamples = report.sections
        .flatMap(s => s.examples || [])
        .filter(e => e.mobileNotes

      expect(mobileExamples.length).toBeGreaterThan(0

      mobileExamples.forEach(example => {
