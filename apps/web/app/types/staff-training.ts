// Staff Training Interface Types
// Interactive training system for no-show prediction workflows

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'prediction' | 'intervention' | 'workflow' | 'compliance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  prerequisites: string[]; // module IDs
  isRequired: boolean;
  order: number;
  
  // Content structure
  sections: TrainingSection[];
  quiz?: Quiz;
  practicalExercise?: PracticalExercise;
  
  // Localization
  language: 'pt-BR' | 'en';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author: string;
}

export interface TrainingSection {
  id: string;
  title: string;
  type: 'text' | 'video' | 'interactive' | 'case_study' | 'checklist';
  content: SectionContent;
  duration: number; // minutes
  order: number;
  isOptional: boolean;
}

export interface SectionContent {
  // Text content
  text?: string;
  markdown?: string;
  
  // Media content
  videoUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  
  // Interactive content
  interactiveComponent?: string; // Component name to render
  caseStudy?: CaseStudy;
  checklist?: ChecklistItem[];
  
  // Brazilian healthcare examples
  healthcareExamples?: HealthcareExample[];
}

export interface CaseStudy {
  id: string;
  title: string;
  scenario: string;
  patientProfile: {
    age: number;
    gender: string;
    appointmentHistory: string;
    riskFactors: string[];
  };
  questions: CaseStudyQuestion[];
  learningObjectives: string[];
}

export interface CaseStudyQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_response';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  isRequired: boolean;
  category: string;
  order: number;
}

export interface HealthcareExample {
  id: string;
  title: string;
  context: 'reception' | 'clinical' | 'management';
  situation: string;
  mlPrediction: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  recommendedActions: string[];
  outcome: string;
  lessonLearned: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // minutes
  passingScore: number; // percentage
  maxAttempts: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'drag_drop' | 'scenario_based';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  description: string;
  type: 'simulation' | 'role_play' | 'workflow' | 'decision_tree';
  scenario: string;
  objectives: string[];
  instructions: string[];
  evaluationCriteria: EvaluationCriterion[];
  timeRequired: number; // minutes
}

export interface EvaluationCriterion {
  id: string;
  criterion: string;
  description: string;
  points: number;
  rubric: RubricLevel[];
}

export interface RubricLevel {
  level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  description: string;
  points: number;
}

export interface TrainingProgress {
  id: string;
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  
  // Progress tracking
  currentSectionId?: string;
  sectionsCompleted: string[];
  timeSpent: number; // minutes
  
  // Assessment results
  quizAttempts: QuizAttempt[];
  practicalExerciseResults?: PracticalExerciseResult;
  
  // Scores and completion
  finalScore?: number; // percentage
  completedAt?: Date;
  certificateEarned: boolean;
  
  // Metadata
  startedAt: Date;
  lastAccessedAt: Date;
  deviceInfo: string;
}

export interface QuizAttempt {
  id: string;
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  score: number; // percentage
  answers: QuizAnswer[];
  timeSpent: number; // minutes
  passed: boolean;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface PracticalExerciseResult {
  id: string;
  completedAt: Date;
  overallScore: number; // percentage
  criteriaScores: { [criterionId: string]: number };
  feedback: string;
  evaluatedBy?: string; // for manual evaluation
}

export interface UserTrainingProfile {
  userId: string;
  name: string;
  email: string;
  role: 'receptionist' | 'nurse' | 'doctor' | 'manager' | 'coordinator';
  department: string;
  hireDate: Date;
  
  // Training status
  requiredModules: string[];
  completedModules: string[];
  inProgressModules: string[];
  certificationsEarned: Certification[];
  
  // Performance metrics
  overallProgress: number; // percentage
  averageScore: number; // percentage
  totalTimeSpent: number; // minutes
  
  // Learning preferences
  preferredLanguage: 'pt-BR' | 'en';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  reminderSettings: ReminderSettings;
}

export interface Certification {
  id: string;
  name: string;
  moduleIds: string[];
  earnedAt: Date;
  expiresAt?: Date;
  certificateUrl: string;
  digitalBadgeUrl?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[];
}

// Brazilian Portuguese localization
export const TRAINING_CATEGORY_LABELS_PT = {
  basics: 'Fundamentos',
  prediction: 'Predições de IA',
  intervention: 'Intervenções',
  workflow: 'Fluxos de Trabalho',
  compliance: 'Conformidade',
} as const;

export const DIFFICULTY_LABELS_PT = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
} as const;

export const SECTION_TYPE_LABELS_PT = {
  text: 'Leitura',
  video: 'Vídeo',
  interactive: 'Interativo',
  case_study: 'Estudo de Caso',
  checklist: 'Lista de Verificação',
} as const;

export const ROLE_LABELS_PT = {
  receptionist: 'Recepcionista',
  nurse: 'Enfermeiro(a)',
  doctor: 'Médico(a)',
  manager: 'Gerente',
  coordinator: 'Coordenador(a)',
} as const;

// Default training paths by role
export const DEFAULT_TRAINING_PATHS = {
  receptionist: [
    'basic_no_show_concepts',
    'risk_identification',
    'intervention_techniques',
    'communication_skills',
  ],
  nurse: [
    'basic_no_show_concepts',
    'clinical_impact',
    'patient_counseling',
    'workflow_optimization',
  ],
  doctor: [
    'advanced_prediction_science',
    'clinical_decision_making',
    'quality_metrics',
    'leadership_training',
  ],
  manager: [
    'system_overview',
    'performance_analytics',
    'roi_analysis',
    'team_management',
  ],
  coordinator: [
    'comprehensive_overview',
    'process_optimization',
    'compliance_requirements',
    'training_delivery',
  ],
} as const;

// Accessibility compliance
export interface AccessibilityFeatures {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  highContrastMode: boolean;
  textResizing: boolean;
  audioDescriptions: boolean;
  closedCaptions: boolean;
  alternativeFormats: string[]; // 'braille', 'large_print', 'audio'
}