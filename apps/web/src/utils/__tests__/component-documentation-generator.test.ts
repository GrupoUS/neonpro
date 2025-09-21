/**
 * Component Documentation Generator Tests
 * T084 - Comprehensive Documentation
 */

import { beforeEach, describe, expect, it } from 'vitest';
import ComponentDocumentationGenerator, {
  ACCESSIBILITY_LEVELS,
  COMPONENT_CATEGORIES,
  COMPONENT_LABELS_PT_BR,
  COMPONENT_TYPES,
  type ComponentDocumentation,
  type ComponentDocumentationReport,
  ComponentDocumentationSchema,
} from '../component-documentation-generator';

describe(_'Component Documentation Generator',_() => {
  let generator: ComponentDocumentationGenerator;

  beforeEach(_() => {
    generator = new ComponentDocumentationGenerator();
  });

  describe(_'Component Documentation Schema Validation',_() => {
    it(_'should validate valid component documentation',_() => {
      const validComponent = {
        id: 'test-component',
        name: 'TestComponent',
        displayName: 'Test Component',
        type: COMPONENT_TYPES.FUNCTIONAL,
        category: COMPONENT_CATEGORIES.HEALTHCARE,
        title: 'Test Component',
        titlePtBr: 'Componente de Teste',
        description: 'Test component description',
        descriptionPtBr: 'Descrição do componente de teste',
        filePath: 'src/components/TestComponent.tsx',
        exportType: 'named' as const,
        accessibility: {
          level: ACCESSIBILITY_LEVELS.AA,
          wcagCompliant: true,
          screenReaderSupport: true,
          keyboardNavigation: true,
          touchAccessible: true,
          focusManagement: true,
          colorContrastCompliant: true,
          mobileAccessible: true,
        },
        healthcare: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          cfmCompliant: true,
          patientDataHandling: true,
          emergencyFeatures: false,
          medicalTerminology: true,
          brazilianPortuguese: true,
        },
        mobile: {
          responsive: true,
          touchOptimized: true,
          performanceOptimized: true,
          offlineSupport: false,
          minTouchTargetSize: 44,
          supportedBreakpoints: ['320px', '375px', '414px', '768px'],
        },
        metadata: {
          version: '1.0.0',
          author: 'Test Author',
          lastUpdated: new Date(),
          tags: ['test', 'healthcare'],
        },
      };

      const result = ComponentDocumentationSchema.safeParse(validComponent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-component');
        expect(result.data.type).toBe(COMPONENT_TYPES.FUNCTIONAL);
        expect(result.data.category).toBe(COMPONENT_CATEGORIES.HEALTHCARE);
        expect(result.data.accessibility.wcagCompliant).toBe(true);
        expect(result.data.healthcare.lgpdCompliant).toBe(true);
        expect(result.data.mobile.touchOptimized).toBe(true);
      }
    });

    it(_'should reject invalid component documentation',_() => {
      const invalidComponent = {
        id: 'test-component',
        // Missing required fields
        type: 'INVALID_TYPE',
        category: 'INVALID_CATEGORY',
      };

      const result = ComponentDocumentationSchema.safeParse(invalidComponent);
      expect(result.success).toBe(false);
    });

    it(_'should validate component props',_() => {
      const componentWithProps = {
        id: 'test-component',
        name: 'TestComponent',
        type: COMPONENT_TYPES.FUNCTIONAL,
        category: COMPONENT_CATEGORIES.HEALTHCARE,
        title: 'Test Component',
        description: 'Test component',
        filePath: 'src/components/TestComponent.tsx',
        exportType: 'named' as const,
        props: [
          {
            name: 'patient',
            type: 'Patient',
            required: true,
            description: 'Patient data object',
            descriptionPtBr: 'Objeto de dados do paciente',
            examples: [{ id: 'pat_123', name: 'João Silva' }],
            healthcareContext: 'Patient information display',
            accessibilityNotes: 'Screen reader compatible',
            mobileNotes: 'Touch-friendly interface',
          },
        ],
        accessibility: {
          level: ACCESSIBILITY_LEVELS.AA,
          wcagCompliant: true,
          screenReaderSupport: true,
          keyboardNavigation: true,
          touchAccessible: true,
          focusManagement: true,
          colorContrastCompliant: true,
          mobileAccessible: true,
        },
        healthcare: {
          lgpdCompliant: true,
          anvisaCompliant: true,
          cfmCompliant: true,
          patientDataHandling: true,
          emergencyFeatures: false,
          medicalTerminology: true,
          brazilianPortuguese: true,
        },
        mobile: {
          responsive: true,
          touchOptimized: true,
          performanceOptimized: true,
          offlineSupport: false,
        },
        metadata: {
          version: '1.0.0',
          author: 'Test Author',
          lastUpdated: new Date(),
          tags: ['test'],
        },
      };

      const result = ComponentDocumentationSchema.safeParse(componentWithProps);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.props).toHaveLength(1);
        expect(result.data.props![0].name).toBe('patient');
        expect(result.data.props![0].required).toBe(true);
        expect(result.data.props![0].healthcareContext).toBe(
          'Patient information display',
        );
        expect(result.data.props![0].accessibilityNotes).toBe(
          'Screen reader compatible',
        );
        expect(result.data.props![0].mobileNotes).toBe(
          'Touch-friendly interface',
        );
      }
    });
  });

  describe(_'Healthcare Component Documentation',_() => {
    it(_'should generate report with healthcare components',_() => {
      const report = generator.generateReport();

      expect(report.components.length).toBeGreaterThan(0);
      expect(report.totalComponents).toBe(report.components.length);
      expect(report.categories).toContain(COMPONENT_CATEGORIES.HEALTHCARE);
      expect(report.categories).toContain(COMPONENT_CATEGORIES.ACCESSIBILITY);
    });

    it(_'should include Patient Card component',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard).toBeDefined();
      expect(patientCard?.name).toBe('PatientCard');
      expect(patientCard?.type).toBe(COMPONENT_TYPES.FUNCTIONAL);
      expect(patientCard?.category).toBe(COMPONENT_CATEGORIES.HEALTHCARE);
      expect(patientCard?.title).toBe('Patient Card Component');
      expect(patientCard?.titlePtBr).toBe('Componente de Cartão do Paciente');
      expect(patientCard?.healthcare.lgpdCompliant).toBe(true);
      expect(patientCard?.healthcare.patientDataHandling).toBe(true);
    });

    it(_'should include Appointment Scheduler component',_() => {
      const report = generator.generateReport();
      const scheduler = report.components.find(
        c => c.id === 'appointment-scheduler',
      );

      expect(scheduler).toBeDefined();
      expect(scheduler?.name).toBe('AppointmentScheduler');
      expect(scheduler?.type).toBe(COMPONENT_TYPES.FUNCTIONAL);
      expect(scheduler?.category).toBe(COMPONENT_CATEGORIES.HEALTHCARE);
      expect(scheduler?.title).toBe('Appointment Scheduler Component');
      expect(scheduler?.titlePtBr).toBe(
        'Componente de Agendamento de Consultas',
      );
      expect(scheduler?.healthcare.lgpdCompliant).toBe(true);
      expect(scheduler?.mobile.offlineSupport).toBe(true);
    });

    it(_'should include Mobile Accessibility Hook',_() => {
      const report = generator.generateReport();
      const hook = report.components.find(
        c => c.id === 'use-mobile-accessibility',
      );

      expect(hook).toBeDefined();
      expect(hook?.name).toBe('useMobileAccessibility');
      expect(hook?.type).toBe(COMPONENT_TYPES.HOOK);
      expect(hook?.category).toBe(COMPONENT_CATEGORIES.ACCESSIBILITY);
      expect(hook?.title).toBe('Mobile Accessibility Hook');
      expect(hook?.titlePtBr).toBe('Hook de Acessibilidade Móvel');
      expect(hook?.accessibility.mobileAccessible).toBe(true);
    });
  });

  describe(_'Accessibility Compliance',_() => {
    it(_'should track WCAG compliance levels',_() => {
      const report = generator.generateReport();

      expect(report.accessibilityCompliance.wcagAA).toBeGreaterThan(0);
      expect(
        report.accessibilityCompliance.screenReaderSupport,
      ).toBeGreaterThan(0);
      expect(report.accessibilityCompliance.keyboardNavigation).toBeGreaterThan(
        0,
      );
      expect(report.accessibilityCompliance.mobileAccessible).toBeGreaterThan(
        0,
      );

      const wcagAAComponents = report.components.filter(
        c => c.accessibility.level === ACCESSIBILITY_LEVELS.AA,
      );
      expect(wcagAAComponents.length).toBe(
        report.accessibilityCompliance.wcagAA,
      );
    });

    it(_'should include accessibility features in components',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.accessibility.wcagCompliant).toBe(true);
      expect(patientCard?.accessibility.screenReaderSupport).toBe(true);
      expect(patientCard?.accessibility.keyboardNavigation).toBe(true);
      expect(patientCard?.accessibility.touchAccessible).toBe(true);
      expect(patientCard?.accessibility.ariaLabels).toContain('patient-card');
      expect(patientCard?.accessibility.ariaLabels).toContain(
        'emergency-contact',
      );
      expect(patientCard?.accessibility.ariaRoles).toContain('article');
      expect(patientCard?.accessibility.focusManagement).toBe(true);
      expect(patientCard?.accessibility.colorContrastCompliant).toBe(true);
      expect(patientCard?.accessibility.mobileAccessible).toBe(true);
    });

    it(_'should include accessibility notes in props',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.props).toBeDefined();
      expect(patientCard?.props?.length).toBeGreaterThan(0);

      const accessibilityProp = patientCard?.props?.find(
        p => p.name === 'accessibilityLevel',
      );
      expect(accessibilityProp).toBeDefined();
      expect(accessibilityProp?.accessibilityNotes).toBeDefined();
      expect(accessibilityProp?.accessibilityNotes).toContain(
        'accessibility enhancements',
      );
    });
  });

  describe(_'Healthcare Compliance',_() => {
    it(_'should track healthcare compliance features',_() => {
      const report = generator.generateReport();

      expect(report.healthcareCompliance.lgpdCompliant).toBeGreaterThan(0);
      expect(report.healthcareCompliance.anvisaCompliant).toBeGreaterThan(0);
      expect(report.healthcareCompliance.cfmCompliant).toBeGreaterThan(0);
      expect(report.healthcareCompliance.patientDataHandling).toBeGreaterThan(
        0,
      );

      const lgpdComponents = report.components.filter(
        c => c.healthcare.lgpdCompliant,
      );
      expect(lgpdComponents.length).toBe(
        report.healthcareCompliance.lgpdCompliant,
      );
    });

    it(_'should include healthcare features in components',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.healthcare.lgpdCompliant).toBe(true);
      expect(patientCard?.healthcare.anvisaCompliant).toBe(true);
      expect(patientCard?.healthcare.cfmCompliant).toBe(true);
      expect(patientCard?.healthcare.patientDataHandling).toBe(true);
      expect(patientCard?.healthcare.emergencyFeatures).toBe(true);
      expect(patientCard?.healthcare.medicalTerminology).toBe(true);
      expect(patientCard?.healthcare.brazilianPortuguese).toBe(true);
    });

    it(_'should include healthcare context in props',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      const patientProp = patientCard?.props?.find(p => p.name === 'patient');
      expect(patientProp?.healthcareContext).toBeDefined();
      expect(patientProp?.healthcareContext).toContain('LGPD compliance');

      const emergencyProp = patientCard?.props?.find(
        p => p.name === 'onEmergencyContact',
      );
      expect(emergencyProp?.healthcareContext).toBeDefined();
      expect(emergencyProp?.healthcareContext).toContain('emergency contact');
    });
  });

  describe(_'Mobile Optimization',_() => {
    it(_'should track mobile optimization features',_() => {
      const report = generator.generateReport();

      expect(report.mobileOptimization.responsive).toBeGreaterThan(0);
      expect(report.mobileOptimization.touchOptimized).toBeGreaterThan(0);
      expect(report.mobileOptimization.performanceOptimized).toBeGreaterThan(0);

      const responsiveComponents = report.components.filter(
        c => c.mobile.responsive,
      );
      expect(responsiveComponents.length).toBe(
        report.mobileOptimization.responsive,
      );
    });

    it(_'should include mobile features in components',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.mobile.responsive).toBe(true);
      expect(patientCard?.mobile.touchOptimized).toBe(true);
      expect(patientCard?.mobile.performanceOptimized).toBe(true);
      expect(patientCard?.mobile.minTouchTargetSize).toBe(44);
      expect(patientCard?.mobile.supportedBreakpoints).toContain('320px');
      expect(patientCard?.mobile.supportedBreakpoints).toContain('768px');
    });

    it(_'should include mobile notes in props',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      const mobileOptimizedProp = patientCard?.props?.find(
        p => p.name === 'mobileOptimized',
      );
      expect(mobileOptimizedProp?.mobileNotes).toBeDefined();
      expect(mobileOptimizedProp?.mobileNotes).toContain('touch-friendly');

      const emergencyProp = patientCard?.props?.find(
        p => p.name === 'onEmergencyContact',
      );
      expect(emergencyProp?.mobileNotes).toBeDefined();
      expect(emergencyProp?.mobileNotes).toContain('Large touch target');
    });
  });

  describe(_'Component Examples',_() => {
    it(_'should include comprehensive examples',_() => {
      const report = generator.generateReport();

      const componentsWithExamples = report.components.filter(
        c => c.examples && c.examples.length > 0,
      );
      expect(componentsWithExamples.length).toBeGreaterThan(0);

      componentsWithExamples.forEach(_component => {
        component.examples?.forEach(_example => {
          expect(example.id).toBeDefined();
          expect(example.title).toBeDefined();
          expect(example.titlePtBr).toBeDefined();
          expect(example.description).toBeDefined();
          expect(example.descriptionPtBr).toBeDefined();
          expect(example.code).toBeDefined();
          expect(example.interactive).toBe(true);
        });
      });
    });

    it(_'should include healthcare context in examples',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.examples).toBeDefined();
      expect(patientCard?.examples?.length).toBeGreaterThan(0);

      patientCard?.examples?.forEach(_example => {
        expect(example.healthcareContext).toBeDefined();
        expect(typeof example.healthcareContext).toBe('string');
        expect(example.healthcareContext!.length).toBeGreaterThan(0);
      });
    });

    it(_'should include accessibility demos in examples',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      patientCard?.examples?.forEach(_example => {
        expect(example.accessibilityDemo).toBe(true);
        expect(example.mobileDemo).toBe(true);
      });
    });

    it(_'should include emergency example',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      const emergencyExample = patientCard?.examples?.find(
        e => e.id === 'emergency-patient-card',
      );
      expect(emergencyExample).toBeDefined();
      expect(emergencyExample?.title).toBe('Emergency Patient Card');
      expect(emergencyExample?.titlePtBr).toBe(
        'Cartão de Paciente de Emergência',
      );
      expect(emergencyExample?.healthcareContext).toContain('emergency');
      expect(emergencyExample?.code).toContain('emergencyMode={true}');
    });
  });

  describe(_'Brazilian Portuguese Localization',_() => {
    it(_'should provide Portuguese component labels',_() => {
      expect(COMPONENT_LABELS_PT_BR[COMPONENT_TYPES.FUNCTIONAL]).toBe(
        'Componente Funcional',
      );
      expect(COMPONENT_LABELS_PT_BR[COMPONENT_TYPES.HOOK]).toBe('Hook');
      expect(COMPONENT_LABELS_PT_BR[COMPONENT_CATEGORIES.HEALTHCARE]).toBe(
        'Saúde',
      );
      expect(COMPONENT_LABELS_PT_BR[COMPONENT_CATEGORIES.ACCESSIBILITY]).toBe(
        'Acessibilidade',
      );
      expect(COMPONENT_LABELS_PT_BR[COMPONENT_CATEGORIES.MOBILE]).toBe('Móvel');
      expect(COMPONENT_LABELS_PT_BR.props).toBe('Propriedades');
      expect(COMPONENT_LABELS_PT_BR.required).toBe('Obrigatório');
      expect(COMPONENT_LABELS_PT_BR.lgpdCompliant).toBe('Compatível com LGPD');
      expect(COMPONENT_LABELS_PT_BR.touchOptimized).toBe(
        'Otimizado para Toque',
      );
    });

    it(_'should include Portuguese translations in components',_() => {
      const report = generator.generateReport();

      report.components.forEach(_component => {
        expect(component.titlePtBr).toBeDefined();
        expect(component.descriptionPtBr).toBeDefined();

        component.props?.forEach(_prop => {
          expect(prop.descriptionPtBr).toBeDefined();
        });

        component.examples?.forEach(_example => {
          expect(example.titlePtBr).toBeDefined();
          expect(example.descriptionPtBr).toBeDefined();
        });
      });
    });

    it(_'should include Portuguese medical terminology',_() => {
      const report = generator.generateReport();
      const healthcareComponents = report.components.filter(
        c => c.healthcare.brazilianPortuguese,
      );

      expect(healthcareComponents.length).toBeGreaterThan(0);

      healthcareComponents.forEach(_component => {
        expect(component.healthcare.brazilianPortuguese).toBe(true);
        expect(component.healthcare.medicalTerminology).toBe(true);
      });
    });
  });

  describe(_'Component Dependencies and Relationships',_() => {
    it(_'should include component dependencies',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.dependencies).toBeDefined();
      expect(patientCard?.dependencies).toContain('react');
      expect(patientCard?.dependencies).toContain('@/types/Patient');
      expect(patientCard?.dependencies).toContain('@/hooks/useAccessibility');
    });

    it(_'should include related components',_() => {
      const report = generator.generateReport();
      const patientCard = report.components.find(
        c => c.id === 'patient-card',
      );

      expect(patientCard?.relatedComponents).toBeDefined();
      expect(patientCard?.relatedComponents).toContain('AppointmentCard');
      expect(patientCard?.relatedComponents).toContain('MedicalRecordCard');
      expect(patientCard?.relatedComponents).toContain('EmergencyContactCard');
    });

    it(_'should include performance metrics',_() => {
      const report = generator.generateReport();

      report.components.forEach(_component => {
        expect(component.metadata.testCoverage).toBeDefined();
        expect(component.metadata.testCoverage).toBeGreaterThan(80);
        expect(component.metadata.performanceScore).toBeDefined();
        expect(component.metadata.performanceScore).toBeGreaterThan(80);
      });
    });
  });

  describe(_'Utility Methods',_() => {
    it(_'should get components by category',_() => {
      const healthcareComponents = generator.getComponentsByCategory(
        COMPONENT_CATEGORIES.HEALTHCARE,
      );
      expect(healthcareComponents.length).toBeGreaterThan(0);

      healthcareComponents.forEach(_component => {
        expect(component.category).toBe(COMPONENT_CATEGORIES.HEALTHCARE);
      });
    });

    it(_'should get healthcare components',_() => {
      const healthcareComponents = generator.getHealthcareComponents();
      expect(healthcareComponents.length).toBeGreaterThan(0);

      healthcareComponents.forEach(_component => {
        const hasHealthcareFeature = component.healthcare.lgpdCompliant
          || component.healthcare.patientDataHandling
          || component.category === COMPONENT_CATEGORIES.HEALTHCARE;
        expect(hasHealthcareFeature).toBe(true);
      });
    });

    it(_'should get accessibility-compliant components',_() => {
      const accessibleComponents = generator.getAccessibilityCompliantComponents();
      expect(accessibleComponents.length).toBeGreaterThan(0);

      accessibleComponents.forEach(_component => {
        expect(component.accessibility.wcagCompliant).toBe(true);
      });
    });

    it(_'should get mobile-optimized components',_() => {
      const mobileComponents = generator.getMobileOptimizedComponents();
      expect(mobileComponents.length).toBeGreaterThan(0);

      mobileComponents.forEach(_component => {
        expect(component.mobile.touchOptimized).toBe(true);
      });
    });

    it(_'should validate component documentation',_() => {
      const validComponent = {
        id: 'test',
        name: 'Test',
        type: COMPONENT_TYPES.FUNCTIONAL,
        category: COMPONENT_CATEGORIES.HEALTHCARE,
        title: 'Test',
        description: 'Test component',
        filePath: 'src/Test.tsx',
        exportType: 'named' as const,
        accessibility: {
          level: ACCESSIBILITY_LEVELS.AA,
          wcagCompliant: true,
          screenReaderSupport: true,
          keyboardNavigation: true,
          touchAccessible: true,
          focusManagement: true,
          colorContrastCompliant: true,
          mobileAccessible: true,
        },
        healthcare: {
          lgpdCompliant: false,
          anvisaCompliant: false,
          cfmCompliant: false,
          patientDataHandling: false,
          emergencyFeatures: false,
          medicalTerminology: false,
          brazilianPortuguese: false,
        },
        mobile: {
          responsive: true,
          touchOptimized: true,
          performanceOptimized: true,
          offlineSupport: false,
        },
        metadata: {
          version: '1.0.0',
          author: 'Test',
          lastUpdated: new Date(),
          tags: ['test'],
        },
      };

      expect(generator.validateComponent(validComponent)).toBe(true);
      expect(generator.validateComponent({})).toBe(false);
    });
  });
});
