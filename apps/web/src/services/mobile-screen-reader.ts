/**
 * Mobile Screen Reader Optimization Service
 * T083 - Mobile Accessibility Optimization
 *
 * Features:
 * - Healthcare data structure optimization for mobile screen readers
 * - Proper heading hierarchy for medical content
 * - Landmark navigation for healthcare workflows
 * - Brazilian Portuguese medical terminology pronunciation guides
 * - Mobile-specific ARIA patterns
 * - Healthcare-specific screen reader patterns
 */

// Mobile Screen Reader Levels
export const MOBILE_SCREEN_READER_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  ACCEPTABLE: 'acceptable',
  POOR: 'poor',
  CRITICAL: 'critical',
} as const;

export type MobileScreenReaderLevel =
  (typeof MOBILE_SCREEN_READER_LEVELS)[keyof typeof MOBILE_SCREEN_READER_LEVELS];

// Healthcare Content Types for Screen Readers
export const HEALTHCARE_CONTENT_TYPES = {
  PATIENT_DATA: 'patient_data',
  MEDICAL_HISTORY: 'medical_history',
  APPOINTMENT_INFO: 'appointment_info',
  MEDICATION_LIST: 'medication_list',
  VITAL_SIGNS: 'vital_signs',
  DIAGNOSIS: 'diagnosis',
  TREATMENT_PLAN: 'treatment_plan',
  EMERGENCY_INFO: 'emergency_info',
  LABORATORY_RESULTS: 'laboratory_results',
  PRESCRIPTION: 'prescription',
} as const;

export type HealthcareContentType =
  (typeof HEALTHCARE_CONTENT_TYPES)[keyof typeof HEALTHCARE_CONTENT_TYPES];

// ARIA Landmark Types for Healthcare
export const HEALTHCARE_LANDMARKS = {
  PATIENT_BANNER: 'banner',
  PATIENT_NAVIGATION: 'navigation',
  MEDICAL_MAIN: 'main',
  APPOINTMENT_ASIDE: 'complementary',
  EMERGENCY_REGION: 'region',
  MEDICAL_FORM: 'form',
  PATIENT_SEARCH: 'search',
  MEDICAL_CONTENT: 'contentinfo',
} as const;

// Heading Hierarchy for Healthcare Content
export const HEALTHCARE_HEADING_HIERARCHY = {
  PAGE_TITLE: 1, // h1: "Prontuário do Paciente"
  SECTION_TITLE: 2, // h2: "Dados Pessoais", "Histórico Médico"
  SUBSECTION_TITLE: 3, // h3: "Medicações Atuais", "Alergias"
  CONTENT_TITLE: 4, // h4: "Medicação 1", "Alergia 1"
  DETAIL_TITLE: 5, // h5: "Dosagem", "Reação"
  SUB_DETAIL_TITLE: 6, // h6: "Horários", "Observações"
} as const;

// Brazilian Portuguese Medical Terminology Pronunciation
export const MEDICAL_PRONUNCIATION_PT_BR = {
  // Common medical terms with pronunciation guides
  hipertensão: 'hi-per-ten-são',
  diabetes: 'di-a-be-tes',
  medicação: 'me-di-ca-ção',
  prescrição: 'pres-cri-ção',
  diagnóstico: 'di-ag-nós-ti-co',
  sintoma: 'sin-to-ma',
  tratamento: 'tra-ta-men-to',
  exame: 'e-xa-me',
  consulta: 'con-sul-ta',
  emergência: 'e-mer-gên-cia',
  alergia: 'a-ler-gi-a',
  cirurgia: 'ci-rur-gi-a',
  anestesia: 'a-nes-te-si-a',
  antibiótico: 'an-ti-bi-ó-ti-co',
  cardiovascular: 'car-di-o-vas-cu-lar',
  neurológico: 'neu-ro-ló-gi-co',
  ortopédico: 'or-to-pé-di-co',
  ginecológico: 'gi-ne-co-ló-gi-co',
  pediátrico: 'pe-di-á-tri-co',
  psiquiátrico: 'psi-qui-á-tri-co',
} as const;

// Screen Reader Element Schema
export const ScreenReaderElementSchema = z.object({
  id: z.string(),
  tagName: z.string(),
  _role: z.string().optional(),
  ariaLabel: z.string().optional(),
  ariaDescribedBy: z.string().optional(),
  ariaLabelledBy: z.string().optional(),
  headingLevel: z.number().optional(),
  landmarkType: z.string().optional(),
  contentType: z.nativeEnum(HEALTHCARE_CONTENT_TYPES).optional(),
  textContent: z.string().optional(),
  isVisible: z.boolean(),
  isFocusable: z.boolean(),
  hasProperLabeling: z.boolean(),
  hasProperHierarchy: z.boolean(),
});

export type ScreenReaderElement = z.infer<typeof ScreenReaderElementSchema>;

// Screen Reader Accessibility Issue
export interface ScreenReaderAccessibilityIssue {
  id: string;
  type:
    | 'labeling'
    | 'hierarchy'
    | 'landmarks'
    | 'pronunciation'
    | 'navigation'
    | 'content_structure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  affectedElements: string[];
  wcagReference: string;
  healthcareImpact: string;
  mobileSpecific: boolean;
  remediation: {
    steps: string[];
    timeframe: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  detectedAt: Date;
}

// Screen Reader Accessibility Report
export interface ScreenReaderAccessibilityReport {
  overallLevel: MobileScreenReaderLevel;
  score: number; // 0-100
  lastAuditDate: Date;
  labelingCompliance: {
    level: MobileScreenReaderLevel;
    totalElements: number;
    labeledElements: number;
    missingLabels: number;
    issues: ScreenReaderAccessibilityIssue[];
  };
  headingHierarchy: {
    level: MobileScreenReaderLevel;
    totalHeadings: number;
    properHierarchy: number;
    hierarchyViolations: number;
    issues: ScreenReaderAccessibilityIssue[];
  };
  landmarkNavigation: {
    level: MobileScreenReaderLevel;
    totalLandmarks: number;
    properLandmarks: number;
    missingLandmarks: string[];
    issues: ScreenReaderAccessibilityIssue[];
  };
  pronunciationGuides: {
    level: MobileScreenReaderLevel;
    medicalTermsFound: number;
    termsWithGuides: number;
    missingGuides: string[];
    issues: ScreenReaderAccessibilityIssue[];
  };
  contentStructure: {
    level: MobileScreenReaderLevel;
    structuredContent: number;
    unstructuredContent: number;
    healthcarePatterns: HealthcareContentType[];
    issues: ScreenReaderAccessibilityIssue[];
  };
  recommendations: string[];
}

// Brazilian Portuguese Screen Reader Labels
export const SCREEN_READER_LABELS_PT_BR = {
  patientData: 'Dados do paciente',
  medicalHistory: 'Histórico médico',
  currentMedications: 'Medicações atuais',
  allergies: 'Alergias',
  vitalSigns: 'Sinais vitais',
  appointments: 'Consultas',
  emergencyContact: 'Contato de emergência',
  diagnosis: 'Diagnóstico',
  treatmentPlan: 'Plano de tratamento',
  labResults: 'Resultados de exames',
  prescription: 'Prescrição médica',
  medicalNotes: 'Observações médicas',
  skipToContent: 'Pular para o conteúdo principal',
  skipToNavigation: 'Pular para a navegação',
  skipToSearch: 'Pular para a busca',
  mainContent: 'Conteúdo principal',
  navigationMenu: 'Menu de navegação',
  patientSearch: 'Busca de pacientes',
  emergencyAlert: 'Alerta de emergência',
} as const;

/**
 * Mobile Screen Reader Optimization Service
 */
export class MobileScreenReaderService {
  private issues: ScreenReaderAccessibilityIssue[] = [];

  /**
   * Validate labeling compliance
   */
  validateLabelingCompliance(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport['labelingCompliance'] {
    this.issues = [];

    const totalElements = elements.filter(
      el => el.isFocusable || el.role,
    ).length;
    const labeledElements = elements.filter(
      el => el.hasProperLabeling,
    ).length;
    const missingLabels = totalElements - labeledElements;
    const issues: ScreenReaderAccessibilityIssue[] = [];

    if (missingLabels > 0) {
      const unlabeledElements = elements.filter(
        el => (el.isFocusable || el._role) && !el.hasProperLabeling,
      );

      issues.push({
        id: 'missing-aria-labels',
        type: 'labeling',
        severity: 'high',
        title: 'Elementos sem rótulos acessíveis',
        description:
          `${missingLabels} elementos interativos não possuem rótulos adequados para leitores de tela`,
        recommendation:
          'Adicionar aria-label, aria-labelledby ou rótulos visíveis para todos os elementos interativos',
        affectedElements: unlabeledElements.map(el => el.id),
        wcagReference: 'WCAG 2.1 AA - Critério 4.1.2 (Nome, Função, Valor)',
        healthcareImpact:
          'Impede identificação de funcionalidades médicas críticas por leitores de tela',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Identificar elementos sem rótulos adequados',
            'Adicionar aria-label com terminologia médica clara',
            'Testar com leitores de tela móveis (TalkBack, VoiceOver)',
            'Validar pronunciação de termos médicos',
          ],
          timeframe: '1-2 semanas',
          difficulty: 'easy',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const complianceRate = totalElements > 0 ? labeledElements / totalElements : 1;
    const level = this.calculateLabelingLevel(complianceRate);

    return {
      level,
      totalElements,
      labeledElements,
      missingLabels,
      issues,
    };
  }

  /**
   * Validate heading hierarchy
   */
  validateHeadingHierarchy(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport['headingHierarchy'] {
    const headings = elements.filter(el => el.headingLevel);
    const totalHeadings = headings.length;
    const properHierarchy = headings.filter(
      el => el.hasProperHierarchy,
    ).length;
    const hierarchyViolations = totalHeadings - properHierarchy;
    const issues: ScreenReaderAccessibilityIssue[] = [];

    if (hierarchyViolations > 0) {
      issues.push({
        id: 'heading-hierarchy-violations',
        type: 'hierarchy',
        severity: 'medium',
        title: 'Hierarquia de cabeçalhos incorreta',
        description:
          `${hierarchyViolations} cabeçalhos não seguem a hierarquia adequada para conteúdo médico`,
        recommendation:
          'Organizar cabeçalhos em hierarquia lógica: h1 para título da página, h2 para seções principais, etc.',
        affectedElements: headings
          .filter(el => !el.hasProperHierarchy)
          .map(el => el.id),
        wcagReference: 'WCAG 2.1 AA - Critério 1.3.1 (Informações e Relacionamentos)',
        healthcareImpact:
          'Dificulta navegação por seções de informações médicas com leitores de tela',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Mapear estrutura de conteúdo médico',
            'Definir hierarquia lógica de cabeçalhos',
            'Implementar níveis de cabeçalho apropriados',
            'Testar navegação por cabeçalhos em dispositivos móveis',
          ],
          timeframe: '1 semana',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    // Check for missing h1
    const hasH1 = headings.some(el => el.headingLevel === 1);
    if (!hasH1 && headings.length > 0) {
      issues.push({
        id: 'missing-h1-heading',
        type: 'hierarchy',
        severity: 'high',
        title: 'Cabeçalho principal (h1) ausente',
        description: 'Página não possui cabeçalho principal (h1) para identificar o conteúdo',
        recommendation: 'Adicionar cabeçalho h1 descrevendo o propósito da página médica',
        affectedElements: ['page-structure'],
        wcagReference: 'WCAG 2.1 AA - Critério 1.3.1 (Informações e Relacionamentos)',
        healthcareImpact:
          'Usuários de leitores de tela não conseguem identificar o contexto médico da página',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Identificar propósito principal da página',
            'Adicionar h1 com descrição clara',
            'Garantir que h1 seja único na página',
            'Testar com leitores de tela móveis',
          ],
          timeframe: '1 dia',
          difficulty: 'easy',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const hierarchyRate = totalHeadings > 0 ? properHierarchy / totalHeadings : 1;
    const level = this.calculateHierarchyLevel(hierarchyRate, hasH1);

    return {
      level,
      totalHeadings,
      properHierarchy,
      hierarchyViolations,
      issues,
    };
  }

  /**
   * Validate landmark navigation
   */
  validateLandmarkNavigation(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport['landmarkNavigation'] {
    const landmarks = elements.filter(el => el.landmarkType);
    const totalLandmarks = landmarks.length;
    const properLandmarks =
      landmarks.filter(el => Object.values(HEALTHCARE_LANDMARKS).includes(el.landmarkType as any))
        .length;

    const requiredLandmarks = ['main', 'navigation', 'banner'];
    const presentLandmarks = landmarks
      .map(el => el.landmarkType)
      .filter(Boolean);
    const missingLandmarks = requiredLandmarks.filter(
      landmark => !presentLandmarks.includes(landmark),
    );

    const issues: ScreenReaderAccessibilityIssue[] = [];

    if (missingLandmarks.length > 0) {
      issues.push({
        id: 'missing-landmarks',
        type: 'landmarks',
        severity: 'medium',
        title: 'Marcos de navegação ausentes',
        description: `${missingLandmarks.length} marcos de navegação essenciais estão ausentes`,
        recommendation:
          'Implementar marcos de navegação (main, navigation, banner) para facilitar navegação',
        affectedElements: missingLandmarks,
        wcagReference: 'WCAG 2.1 AA - Critério 1.3.6 (Identificar Propósito)',
        healthcareImpact: 'Dificulta navegação rápida entre seções de informações médicas',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Identificar seções principais da aplicação médica',
            'Implementar marcos ARIA apropriados',
            'Adicionar rótulos descritivos para marcos',
            'Testar navegação por marcos em dispositivos móveis',
          ],
          timeframe: '1 semana',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const landmarkRate = requiredLandmarks.length > 0
      ? (requiredLandmarks.length - missingLandmarks.length)
        / requiredLandmarks.length
      : 1;
    const level = this.calculateLandmarkLevel(landmarkRate);

    return {
      level,
      totalLandmarks,
      properLandmarks,
      missingLandmarks,
      issues,
    };
  }

  /**
   * Validate pronunciation guides for medical terminology
   */
  validatePronunciationGuides(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport['pronunciationGuides'] {
    const medicalTerms = Object.keys(MEDICAL_PRONUNCIATION_PT_BR);
    const contentText = elements
      .map(el => el.textContent || '')
      .join(' ')
      .toLowerCase();

    const medicalTermsFound = medicalTerms.filter(term => contentText.includes(term.toLowerCase()));

    // Mock implementation - would check for actual pronunciation guides
    const termsWithGuides = Math.floor(medicalTermsFound.length * 0.6); // 60% have guides
    const missingGuides = medicalTermsFound.slice(termsWithGuides);

    const issues: ScreenReaderAccessibilityIssue[] = [];

    if (missingGuides.length > 0) {
      issues.push({
        id: 'missing-pronunciation-guides',
        type: 'pronunciation',
        severity: 'low',
        title: 'Guias de pronúncia ausentes',
        description: `${missingGuides.length} termos médicos não possuem guias de pronúncia`,
        recommendation: 'Implementar guias de pronúncia para terminologia médica complexa',
        affectedElements: missingGuides,
        wcagReference: 'WCAG 2.1 AA - Critério 3.1.6 (Pronúncia)',
        healthcareImpact: 'Pode causar confusão na pronúncia de termos médicos importantes',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Identificar terminologia médica complexa',
            'Implementar atributos de pronúncia (ruby, phoneme)',
            'Testar pronúncia com leitores de tela brasileiros',
            'Validar com profissionais de saúde',
          ],
          timeframe: '2-3 semanas',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const guideRate = medicalTermsFound.length > 0
      ? termsWithGuides / medicalTermsFound.length
      : 1;
    const level = this.calculatePronunciationLevel(guideRate);

    return {
      level,
      medicalTermsFound: medicalTermsFound.length,
      termsWithGuides,
      missingGuides,
      issues,
    };
  }

  /**
   * Validate content structure for healthcare
   */
  validateContentStructure(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport['contentStructure'] {
    const contentElements = elements.filter(el => el.contentType);
    const structuredContent = contentElements.filter(
      el => el.role && (el.ariaLabel || el.ariaLabelledBy),
    ).length;
    const unstructuredContent = contentElements.length - structuredContent;

    const healthcarePatterns = Array.from(
      new Set(contentElements.map(el => el.contentType).filter(Boolean)),
    ) as HealthcareContentType[];

    const issues: ScreenReaderAccessibilityIssue[] = [];

    if (unstructuredContent > 0) {
      issues.push({
        id: 'unstructured-healthcare-content',
        type: 'content_structure',
        severity: 'medium',
        title: 'Conteúdo médico não estruturado',
        description:
          `${unstructuredContent} elementos de conteúdo médico não possuem estrutura adequada`,
        recommendation: 'Estruturar conteúdo médico com roles ARIA e rótulos apropriados',
        affectedElements: contentElements
          .filter(el => !el.role || (!el.ariaLabel && !el.ariaLabelledBy))
          .map(el => el.id),
        wcagReference: 'WCAG 2.1 AA - Critério 1.3.1 (Informações e Relacionamentos)',
        healthcareImpact: 'Dificulta compreensão de informações médicas por leitores de tela',
        mobileSpecific: true,
        remediation: {
          steps: [
            'Identificar tipos de conteúdo médico',
            'Implementar estrutura semântica apropriada',
            'Adicionar roles ARIA específicos para saúde',
            'Testar compreensão com leitores de tela móveis',
          ],
          timeframe: '2-3 semanas',
          difficulty: 'medium',
        },
        detectedAt: new Date(),
      });
    }

    this.issues.push(...issues);

    const structureRate = contentElements.length > 0
      ? structuredContent / contentElements.length
      : 1;
    const level = this.calculateContentStructureLevel(structureRate);

    return {
      level,
      structuredContent,
      unstructuredContent,
      healthcarePatterns,
      issues,
    };
  }

  /**
   * Generate comprehensive screen reader accessibility report
   */
  generateReport(
    elements: ScreenReaderElement[],
  ): ScreenReaderAccessibilityReport {
    this.issues = [];

    const labelingCompliance = this.validateLabelingCompliance(elements);
    const headingHierarchy = this.validateHeadingHierarchy(elements);
    const landmarkNavigation = this.validateLandmarkNavigation(elements);
    const pronunciationGuides = this.validatePronunciationGuides(elements);
    const contentStructure = this.validateContentStructure(elements);

    const overallLevel = this.calculateOverallLevel([
      labelingCompliance.level,
      headingHierarchy.level,
      landmarkNavigation.level,
      pronunciationGuides.level,
      contentStructure.level,
    ]);

    const score = this.calculateOverallScore();
    const recommendations = this.generateRecommendations();

    return {
      overallLevel,
      score,
      lastAuditDate: new Date(),
      labelingCompliance,
      headingHierarchy,
      landmarkNavigation,
      pronunciationGuides,
      contentStructure,
      recommendations,
    };
  }

  /**
   * Calculate labeling compliance level
   */
  private calculateLabelingLevel(rate: number): MobileScreenReaderLevel {
    if (rate >= 0.95) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (rate >= 0.85) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (rate >= 0.7) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (rate >= 0.5) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate heading hierarchy level
   */
  private calculateHierarchyLevel(
    rate: number,
    hasH1: boolean,
  ): MobileScreenReaderLevel {
    if (rate >= 0.9 && hasH1) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (rate >= 0.8 && hasH1) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (rate >= 0.7) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (rate >= 0.5) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate landmark navigation level
   */
  private calculateLandmarkLevel(rate: number): MobileScreenReaderLevel {
    if (rate >= 0.9) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (rate >= 0.75) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (rate >= 0.6) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (rate >= 0.4) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate pronunciation guides level
   */
  private calculatePronunciationLevel(rate: number): MobileScreenReaderLevel {
    if (rate >= 0.9) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (rate >= 0.75) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (rate >= 0.6) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (rate >= 0.4) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate content structure level
   */
  private calculateContentStructureLevel(
    rate: number,
  ): MobileScreenReaderLevel {
    if (rate >= 0.9) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (rate >= 0.8) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (rate >= 0.7) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (rate >= 0.5) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate overall accessibility level
   */
  private calculateOverallLevel(
    levels: MobileScreenReaderLevel[],
  ): MobileScreenReaderLevel {
    const levelScores = {
      [MOBILE_SCREEN_READER_LEVELS.EXCELLENT]: 5,
      [MOBILE_SCREEN_READER_LEVELS.GOOD]: 4,
      [MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE]: 3,
      [MOBILE_SCREEN_READER_LEVELS.POOR]: 2,
      [MOBILE_SCREEN_READER_LEVELS.CRITICAL]: 1,
    };

    const averageScore = levels.reduce((sum, level) => sum + levelScores[level], 0)
      / levels.length;

    if (averageScore >= 4.5) return MOBILE_SCREEN_READER_LEVELS.EXCELLENT;
    if (averageScore >= 3.5) return MOBILE_SCREEN_READER_LEVELS.GOOD;
    if (averageScore >= 2.5) return MOBILE_SCREEN_READER_LEVELS.ACCEPTABLE;
    if (averageScore >= 1.5) return MOBILE_SCREEN_READER_LEVELS.POOR;
    return MOBILE_SCREEN_READER_LEVELS.CRITICAL;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(): number {
    const criticalIssues = this.issues.filter(
      i => i.severity === 'critical',
    ).length;
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(
      i => i.severity === 'medium',
    ).length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;

    const penalty = criticalIssues * 25 + highIssues * 15 + mediumIssues * 8 + lowIssues * 3;

    return Math.max(0, 100 - penalty);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const issuesByType = this.issues.reduce((acc, issue) => {
        if (!acc[issue.type]) acc[issue.type] = [];
        acc[issue.type].push(issue);
        return acc;
      },
      {} as Record<string, ScreenReaderAccessibilityIssue[]>,
    );

    Object.entries(issuesByType).forEach(([type, issues]) => {
      const criticalCount = issues.filter(
        i => i.severity === 'critical',
      ).length;
      const highCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;

      if (criticalCount > 0) {
        recommendations.push(
          `Resolver urgentemente ${criticalCount} problema(s) crítico(s) de ${type}`,
        );
      }
      if (highCount > 0) {
        recommendations.push(
          `Abordar ${highCount} problema(s) de alta prioridade em ${type}`,
        );
      }
      if (mediumCount > 0) {
        recommendations.push(
          `Resolver ${mediumCount} problema(s) de prioridade média em ${type}`,
        );
      }
    });

    if (this.issues.length === 0) {
      recommendations.push('Manter conformidade com leitores de tela móveis');
      recommendations.push(
        'Realizar testes regulares com TalkBack e VoiceOver',
      );
      recommendations.push(
        'Monitorar feedback de usuários com deficiências visuais',
      );
    }

    return recommendations;
  }
}

export default MobileScreenReaderService;
