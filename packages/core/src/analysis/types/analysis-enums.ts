// Enums and type definitions for analysis workflow and status
// Healthcare compliance focused for Brazilian aesthetic clinics

export enum AnalysisStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum AnalysisType {
  DUPLICATE_DETECTION = 'DUPLICATE_DETECTION',
  ARCHITECTURAL_VALIDATION = 'ARCHITECTURAL_VALIDATION',
  DEPENDENCY_ANALYSIS = 'DEPENDENCY_ANALYSIS',
  PERFORMANCE_ANALYSIS = 'PERFORMANCE_ANALYSIS',
  TYPE_SAFETY_ANALYSIS = 'TYPE_SAFETY_ANALYSIS',
  SECURITY_ANALYSIS = 'SECURITY_ANALYSIS',
  HEALTHCARE_COMPLIANCE_ANALYSIS = 'HEALTHCARE_COMPLIANCE_ANALYSIS',
  MOBILE_PERFORMANCE_ANALYSIS = 'MOBILE_PERFORMANCE_ANALYSIS',
  ACCESSIBILITY_ANALYSIS = 'ACCESSIBILITY_ANALYSIS'
}

export enum AnalysisScope {
  PACKAGE_LEVEL = 'PACKAGE_LEVEL',
  MONOREPO_LEVEL = 'MONOREPO_LEVEL',
  DOMAIN_LEVEL = 'DOMAIN_LEVEL',
  FEATURE_LEVEL = 'FEATURE_LEVEL'
}

export enum QualityThresholds {
  // Code quality thresholds
  MAX_DUPLICATION_PERCENTAGE = 5,
  MAX_CIRCULAR_DEPENDENCIES = 0,
  MIN_TYPE_SAFETY_SCORE = 95,
  MAX_BUILD_TIME_MS = 2000,
  MAX_BUNDLE_SIZE_KB = 500,
  MIN_TEST_COVERAGE = 90,
  
  // Healthcare compliance thresholds
  MIN_LGPD_COMPLIANCE = 95,
  MIN_ANVISA_COMPLIANCE = 90,
  MIN_COUNCIL_COMPLIANCE = 95,
  MIN_PATIENT_DATA_SAFETY = 100,
  
  // Performance thresholds
  MAX_MOBILE_LOAD_TIME_3G = 6000,
  MAX_MOBILE_LOAD_TIME_4G = 3000,
  MAX_MEMORY_USAGE_MB = 512,
  MAX_CPU_USAGE_PERCENTAGE = 70,
  
  // Security thresholds
  MAX_CRITICAL_VULNERABILITIES = 0,
  MAX_HIGH_VULNERABILITIES = 2,
  MAX_SECURITY_SCORE_IMPACT = 20
}

export enum AnalysisPhase {
  SETUP = 'SETUP',
  TESTS = 'TESTS',
  CORE = 'CORE',
  INTEGRATION = 'INTEGRATION',
  POLISH = 'POLISH'
}

export enum Priority {
  IMMEDIATE = 'IMMEDIATE',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum ReportFormat {
  JSON = 'JSON',
  HTML = 'HTML',
  PDF = 'PDF',
  MARKDOWN = 'MARKDOWN'
}

export enum VisualizationType {
  DEPENDENCY_GRAPH = 'DEPENDENCY_GRAPH',
  ARCHITECTURE_DIAGRAM = 'ARCHITECTURE_DIAGRAM',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  METRICS_DASHBOARD = 'METRICS_DASHBOARD',
  HEALTH_SCORE = 'HEALTH_SCORE'
}

// Analysis configuration enums
export enum OXLintIntegrationLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  ENHANCED = 'ENHANCED',
  HEALTHCARE_FOCUSED = 'HEALTHCARE_FOCUSED'
}

export enum HealthcareComplianceLevel {
  NONE = 'NONE',
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  COMPREHENSIVE = 'COMPREHENSIVE',
  ENTERPRISE = 'ENTERPRISE'
}

export enum MobilePerformanceTier {
  EXCELLENT = 'EXCELLENT',  // <2s on 3G
  GOOD = 'GOOD',          // 2-4s on 3G
  ACCEPTABLE = 'ACCEPTABLE', // 4-6s on 3G
  POOR = 'POOR',         // >6s on 3G
  VERY_POOR = 'VERY_POOR' // >10s on 3G
}

export enum AccessibilityCompliance {
  WCAG_A = 'WCAG_A',
  WCAG_AA = 'WCAG_AA',
  WCAG_AAA = 'WCAG_AAA',
  NOT_COMPLIANT = 'NOT_COMPLIANT'
}

// Analysis tool integration enums
export enum JscpdIntegration {
  NONE = 'NONE',
  BASIC = 'BASIC',
  TYPESCRIPT_AWARE = 'TYPESCRIPT_AWARE',
  HEALTHCARE_AWARE = 'HEALTHCARE_AWARE'
}

export enum SonarQubeIntegration {
  NONE = 'NONE',
  COMMUNITY = 'COMMUNITY',
  DEVELOPER = 'DEVELOPER',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SmartTSXLIntegration {
  NONE = 'NONE',
  BASIC_ANALYSIS = 'BASIC_ANALYSIS',
  STRUCTURAL_ANALYSIS = 'STRUCTURAL_ANALYSIS',
  ENTERPRISE_ANALYSIS = 'ENTERPRISE_ANALYSIS'
}

// Healthcare domain enums
export enum BrazilianHealthcareDomain {
  ESTETICA = 'ESTETICA',
  DERMATOLOGIA = 'DERMATOLOGIA',
  PLASTICA = 'PLASTICA',
  COSMETICA = 'COSMETICA',
  ODONTOLOGIA = 'ODONTOLOGIA',
  ENFERMAGEM = 'ENFERMAGEMEM',
  FISIOTERAPIA = 'FISIOTERAPIA',
  PSICOLOGIA = 'PSICOLOGIA',
  NUTRICAO = 'NUTRICAO'
}

export enum ProfessionalCouncil {
  CFM = 'CFM',      // Conselho Federal de Medicina
  COREN = 'COREN',    // Conselho Regional de Enfermagem
  CFO = 'CFO',      // Conselho Federal de Odontologia
  CNO = 'CNO',      // Conselho de Odontologia
  CNEP = 'CNEP'      // Cadastro Nacional de Estabelecimentos de Saúde
}

export enum HealthcareRegulationType {
  LGPD = 'LGPD',            // Lei Geral de Proteção de Dados Pessoais
  RDC_ANVISA = 'RDC_ANVISA',  // Resoluções da ANVISA
  CODIGO_ETICA = 'CODIGO_ETICA', // Código de Ética
  NORMATAS_TECNICAS = 'NORMATAS_TECNICAS', // Normas Técnicas
  PORTARIA_MINISTERIAL = 'PORTARIA_MINISTERIAL' // Portarias Ministeriais
}

// Analysis validation enums
export enum ValidationRule {
  REQUIRED = 'REQUIRED',
  RECOMMENDED = 'RECOMMENDED',
  OPTIONAL = 'OPTIONAL',
  HEALTHCARE_CRITICAL = 'HEALTHCARE_CRITICAL'
}

export enum ComplianceCategory {
  PATIENT_DATA_PROTECTION = 'PATIENT_DATA_PROTECTION',
  CLINICAL_WORKFLOW_SAFETY = 'CLINICAL_WORKFLOW_SAFETY',
  PROFESSIONAL_ETHICS = 'PROFESSIONAL_ETHICS',
  TECHNICAL_STANDARDS = 'TECHNICAL_STANDARDS',
  ACCESSIBILITY_COMPLIANCE = 'ACCESSIBILITY_COMPLIANCE',
  SECURITY_STANDARDS = 'SECURITY_STANDARDS'
}

// Analysis output enums
export enum OutputFormat {
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  DETAILED_REPORT = 'DETAILED_REPORT',
  TECHNICAL_REPORT = 'TECHNICAL_REPORT',
  STAKEHOLDER_PRESENTATION = 'STAKEHOLDER_PRESENTATION',
  DEVELOPER_GUIDE = 'DEVELOPER_GUIDE',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT'
}

export enum ChartType {
  BAR_CHART = 'BAR_CHART',
  LINE_CHART = 'LINE_CHART',
  PIE_CHART = 'PIE_CHART',
  SCATTER_PLOT = 'SCATTER_PLOT',
  HEATMAP = 'HEATMAP',
  TREND_LINE = 'TREND_LINE',
  GAUGE = 'GAUGE'
}

// Analysis timeline enums
export enum TimeUnit {
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS'
}

export enum AnalysisFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ON_DEMAND = 'ON_DEMAND'
}

// Risk assessment enums
export enum RiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RiskCategory {
  TECHNICAL = 'TECHNICAL',
  HEALTHCARE = 'HEALTHCARE',
  COMPLIANCE = 'COMPLIANCE',
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  REPUTATIONAL = 'REPUTATIONAL'
}

// Quality gate enums
export enum QualityGate {
  CODE_QUALITY = 'CODE_QUALITY',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  COMPLIANCE = 'COMPLIANCE',
  TEST_COVERAGE = 'TEST_COVERAGE',
  DOCUMENTATION = 'DOCUMENTATION',
  ACCESSIBILITY = 'ACCESSIBILITY'
}

export enum QualityGateResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
  SKIPPED = 'SKIPPED'
}

// Tool configuration enums
export enum ToolConfiguration {
  OXLINT_RULES = 'OXLINT_RULES',
  JSCPD_THRESHOLD = 'JSCPD_THRESHOLD',
  SONARQUBE_METRICS = 'SONARQUBE_METRICS',
  BUNDLE_ANALYSIS = 'BUNDLE_ANALYSIS',
  PERFORMANCE_BENCHMARKS = 'PERFORMANCE_BENCHMARKS'
}

// Notification enums
export enum NotificationType {
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  CRITICAL_FINDING = 'CRITICAL_FINDING',
  QUALITY_GATE_FAILED = 'QUALITY_GATE_FAILED',
  SECURITY_VULNERABILITY = 'SECURITY_VULNERABILITY',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE',
  PERFORMANCE_DEGRADATION = 'PERFORMANCE_DEGRADATION'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',
  WEBHOOK = 'WEBHOOK',
  CONSOLE = 'CONSOLE'
}

// Export configuration enums
export enum ExportConfiguration {
  INCLUDE_SOURCES = 'INCLUDE_SOURCES',
  INCLUDE_ANALYTICS = 'INCLUDE_ANALYTICS',
  INCLUDE_HEALTHCARE_DATA = 'INCLUDE_HEALTHCARE_DATA',
  INCLUDE_PERFORMANCE_DATA = 'INCLUDE_PERFORMANCE_DATA',
  INCLUDE_RECOMMENDATIONS = 'INCLUDE_RECOMMENDATIONS',
  ANONYMIZE_DATA = 'ANONYMIZE_DATA'
}

// Healthcare-specific analysis types
export enum HealthcareAnalysisType {
  PATIENT_DATA_MAPPING = 'PATIENT_DATA_MAPPING',
  CLINICAL_WORKFLOW_ANALYSIS = 'CLINICAL_WORKFLOW_ANALYSIS',
  COMPLIANCE_ASSESSMENT = 'COMPLIANCE_ASSESSMENT',
  REGULATORY_COMPLIANCE_CHECK = 'REGULATORY_COMPLIANCE_CHECK',
  PATIENT_SAFETY_ASSESSMENT = 'PATIENT_SAFETY_ASSESSMENT',
  DATA_PROTECTION_AUDIT = 'DATA_PROTECTION_AUDIT'
}

// Mobile performance analysis
export enum MobileNetworkCondition {
  SLOW_3G = 'SLOW_3G',
  REGULAR_3G = 'REGULAR_3G',
  FAST_3G = 'FAST_3G',
  SLOW_4G = 'SLOW_4G',
  REGULAR_4G = 'REGULAR_4G',
  FAST_4G = 'FAST_4G',
  WIFI = 'WIFI',
  ETHERNET = 'ETHERNET'
}

export enum DeviceType {
  MOBILE_PHONE = 'MOBILE_PHONE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
  WEARABLE = 'WEARABLE',
  SMART_TV = 'SMART_TV'
}

// Accessibility analysis types
export enum AccessibilityStandard {
  WCAG_2_0 = 'WCAG_2_0',
  WCAG_2_1 = 'WCAG_2_1',
  WCAG_2_2 = 'WCAG_2_2',
  SECTION_508 = 'SECTION_508',
  EN_301_549 = 'EN_301_549'
}

export enum AccessibilityTestType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  USER_TESTING = 'USER_TESTING',
  EXPERT_REVIEW = 'EXPERT_REVIEW'
}

// Type guard functions
export function isValidAnalysisStatus(status: string): status is AnalysisStatus {
  return Object.values(AnalysisStatus).includes(status as AnalysisStatus);
}

export function isValidAnalysisType(type: string): type is AnalysisType {
  return Object.values(AnalysisType).includes(type as AnalysisType);
}

export function isValidPriority(priority: string): priority is Priority {
  return Object.values(Priority).includes(priority as Priority);
}

export function isValidSeverityLevel(severity: string): severity is SeverityLevel {
  return Object.values(SeverityLevel).includes(severity as SeverityLevel);
}

export function isValidComplianceRegulation(regulation: string): regulation is ComplianceRegulation {
  return Object.values(ComplianceRegulation).includes(regulation as ComplianceRegulation);
}

export function isValidHealthcareDomain(domain: string): domain is BrazilianHealthcareDomain {
  return Object.values(BrazilianHealthcareDomain).includes(domain as BrazilianHealthcareDomain);
}

export function isValidProfessionalCouncil(council: string): council is ProfessionalCouncil {
  return Object.values(ProfessionalCouncil).includes(council as ProfessionalCouncil);
}

// Utility functions
export function getAnalysisPhaseStatusWeight(phase: AnalysisPhase): number {
  const weights = {
    [AnalysisPhase.SETUP]: 1,
    [AnalysisPhase.TESTS]: 2,
    [AnalysisPhase.CORE]: 3,
    [AnalysisPhase.INTEGRATION]: 4,
    [AnalysisPhase.POLISH]: 5
  };
  return weights[phase] || 0;
}

export function getPriorityWeight(priority: Priority): number {
  const weights = {
    [Priority.IMMEDIATE]: 100,
    [Priority.HIGH]: 75,
    [Priority.MEDIUM]: 50,
    [Priority.LOW]: 25
  };
  return weights[priority] || 0;
}

export function getSeverityWeight(severity: SeverityLevel): number {
  const weights = {
    [SeverityLevel.CRITICAL]: 100,
    [SeverityLevel.HIGH]: 75,
    [SeverityLevel.MEDIUM]: 50,
    [SeverityLevel.LOW]: 25
  };
  return weights[severity] || 0;
}

export function getComplianceRegulationWeight(regulation: ComplianceRegulation): number {
  const weights = {
    [ComplianceRegulation.LGDP]: 100,
    [ComplianceRegulation.ANVISA]: 90,
    [ComplianceRegulation.CFM]: 85,
    [ComplianceRegulation.COREN]: 80,
    [ComplianceRegulation.CFO]: 75,
    [ComplianceRegulation.CNEP]: 70
  };
  return weights[regulation] || 0;
}

export function getHealthcareDomainWeight(domain: BrazilianHealthcareDomain): number {
  const weights = {
    [BrazilianHealthcareDomain.ESTETICA]: 100,
    [BrazilianHealthcareDomain.DERMATOLOGIA]: 95,
    [BrazilianHealthDomain.PLASTICA]: 95,
    [BrazilianHealthDomain.COSMETICA]: 90,
    [BrazilianHealthDomain.ODONTOLOGIA]: 85,
    [BrazilianHealthDomain.ENFERMAGEM]: 80,
    [BrazilianHealthDomain.FISIOTERAPIA]: 75,
    [BrazilianHealthDomain.PSICOLOGIA]: 70,
    [BrazilianHealthDomain.NUTRICAO]: 65
  };
  return weights[domain] || 0;
}

// Healthcare compliance helper functions
export function isHealthcareCritical(analysisType: AnalysisType): boolean {
  return [
    AnalysisType.HEALTHCARE_COMPLIANCE_ANALYSIS,
    AnalysisType.MOBILE_PERFORMANCE_ANALYSIS,
    AnalysisType.ACCESSIBILITY_ANALYSIS
  ].includes(analysisType);
}

export function requiresHealthcareValidation(analysisType: AnalysisType): boolean {
  return [
    AnalysisType.HEALTHCARE_COMPLIANCE_ANALYSIS,
    AnalysisType.SECURITY_ANALYSIS,
    AnalysisType.PERFORMANCE_ANALYSIS,
    AnalysisType.MOBILE_PERFORMANCE_ANALYSIS
  ].includes(analysisType);
}

export function getBrazilianContextForHealthcareDomain(domain: BrazilianHealthDomain): {
  portugueseTerms: string[];
  clinicalSpecialties: string[];
  commonProcedures: string[];
  regulatoryBodies: string[];
} {
  const contextMap = {
    [BrazilianHealthcareDomain.ESTETICA]: {
      portugueseTerms: ['estética', 'beleza', 'tratamento', 'clínica', 'paciente'],
      clinicalSpecialties: ['dermatologia estética', 'cosmetologia', 'procedimentos estéticos'],
      commonProcedures: ['preenchimento', 'toxina botulínica', 'laser', 'peeling químico'],
      regulatoryBodies: ['CFM', 'ANVISA', 'COREN']
    },
    [BrazilianHealthcareDomain.DERMATOLOGIA]: {
      portugueseTerms: ['dermatologista', 'pele', 'doença de pele', 'tratamento dermatológico'],
      clinicalSpecialties: ['dermatologia clínica', 'dermatologia cirúrgica', 'cosmiatria'],
      commonProcedures: ['consulta dermatológica', 'procedimentos dermatológicos', 'tratamentos cutâneos'],
      regulatoryBodies: ['CFM', 'ANVISA', 'COREN']
    },
    [BrazilianHealthDomain.PLASTICA]: {
      portugueseTerms: ['cirurgião plástico', 'cirurgia plástica', 'reconstrução', 'implante'],
      clinicalSpecialties: ['cirurgia plástica geral', 'cirurgia reparadora', 'microcirurgia'],
      commonProcedures ['prótese', 'implante', 'lipoaspiração', 'abdominoplastia'],
      regulatoryBodies: ['CFM', 'ANVISA', 'COREN', 'CFO']
    },
    [BrazilianHealthDomain.ODONTOLOGIA]: {
      portugueseTerms: ['dentista', 'dente', 'sorriso', 'saúde bucal', 'prótese'],
      clinicalSpecialties: ['odontologia geral', 'odontopediatria', 'endodontia', 'implantodontia'],
      commonProcedures: ['limpeza', 'restauração', 'clareamento', 'extração'],
      regulatoryBodies: ['CFO', 'CNO', 'ANVISA']
    }
  };
  
  return contextMap[domain] || {
    portugueseTerms: [],
    clinicalSpecialties: [],
    commonProcedures: [],
    regulatoryBodies: []
  };
}

// Performance benchmark helper functions
export function getMobilePerformanceThresholds(tier: MobilePerformanceTier): {
  maxLoadTime3G: number;
  maxLoadTime4G: number;
  maxBundleSize: number;
  maxMemoryUsage: number;
} {
  const thresholds = {
    [MobilePerformanceTier.EXCELLENT]: {
      maxLoadTime3G: 2000,
      maxLoadTime4G: 1000,
      maxBundleSize: 500000,
      maxMemoryUsage: 100000000
    },
    [MobilePerformanceTier.GOOD]: {
      maxLoadTime3G: 4000,
      maxLoadTime4G: 2000,
      maxBundleSize: 750000,
      maxMemoryUsage: 150000000
    },
    [MobilePerformanceTier.ACCEPTABLE]: {
      maxLoadTime3G: 6000,
      maxLoadTime4G: 3000,
      maxBundleSize: 1000000,
      maxMemoryUsage: 200000000
    },
    [MobilePerformanceTier.POOR]: {
      maxLoadTime3G: 8000,
      maxLoadTime4G: 5000,
      maxBundleSize: 1500000,
      maxMemoryUsage: 300000000
    },
    [MobilePerformanceTier.VERY_POOR]: {
      maxLoadTime3G: 10000,
      maxLoadTime4G: 8000,
      maxBundleSize: 2000000,
      maxMemoryUsage: 500000000
    }
  };
  
  return thresholds[tier] || thresholds[MobilePerformanceTier.ACCEPTABLE];
}