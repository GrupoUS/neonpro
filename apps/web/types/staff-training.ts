// Staff Training Types

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  sections: TrainingSection[];
  createdAt: Date;
  updatedAt: Date;
  isRequired: boolean;
  expiresAfter?: number; // days
  tags?: string[];
  thumbnail?: string;
}

export interface TrainingSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "video" | "interactive" | "quiz";
  duration: number; // minutes
  order: number;
  resources?: TrainingResource[];
}

export interface TrainingResource {
  id: string;
  title: string;
  type: "pdf" | "video" | "link" | "document";
  url: string;
  description?: string;
}

export interface TrainingProgress {
  moduleId: string;
  staffId: string;
  status: "not_started" | "in_progress" | "completed" | "expired";
  completedSections: string[];
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  attempts: number;
  lastAccessedAt?: Date;
  timeSpent?: number; // minutes
}

export interface TrainingCertificate {
  id: string;
  moduleId: string;
  staffId: string;
  issuedAt: Date;
  expiresAt?: Date;
  score: number;
  certificateUrl?: string;
}

export interface TrainingAssignment {
  id: string;
  moduleId: string;
  staffId: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  notes?: string;
}

export interface TrainingDashboard {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  overdueModules: number;
  certifications: TrainingCertificate[];
  recentActivity: TrainingActivity[];
  upcomingDeadlines: TrainingAssignment[];
}

export interface TrainingActivity {
  id: string;
  type: "started" | "completed" | "certified" | "assigned";
  moduleId: string;
  staffId: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}
