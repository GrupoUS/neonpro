"use client";

import { useEffect, useState } from "react";

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
}

export interface TrainingSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "video" | "interactive" | "quiz";
  duration: number; // minutes
  order: number;
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
}

export function useStaffTraining() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Record<string, TrainingProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockModules: TrainingModule[] = [
      {
        id: "1",
        title: "HIPAA Compliance Training",
        description: "Essential privacy and security training",
        category: "Compliance",
        duration: 45,
        difficulty: "beginner",
        prerequisites: [],
        sections: [
          {
            id: "1",
            title: "Introduction to HIPAA",
            content: "Overview of HIPAA regulations...",
            type: "text",
            duration: 15,
            order: 1,
          },
          {
            id: "2",
            title: "Privacy Rules",
            content: "Understanding privacy requirements...",
            type: "video",
            duration: 20,
            order: 2,
          },
          {
            id: "3",
            title: "Assessment",
            content: "Test your knowledge",
            type: "quiz",
            duration: 10,
            order: 3,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isRequired: true,
        expiresAfter: 365,
      },
    ];

    const mockProgress: Record<string, TrainingProgress> = {
      "1": {
        moduleId: "1",
        staffId: "current-user",
        status: "in_progress",
        completedSections: ["1"],
        startedAt: new Date(),
        attempts: 1,
        lastAccessedAt: new Date(),
      },
    };

    setModules(mockModules);
    setProgress(mockProgress);
    setIsLoading(false);
  }, []);

  const startModule = (moduleId: string) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        moduleId,
        staffId: "current-user",
        status: "in_progress",
        completedSections: [],
        startedAt: new Date(),
        attempts: 0,
        lastAccessedAt: new Date(),
      },
    }));
  };

  const completeSection = (moduleId: string, sectionId: string) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        completedSections: [...(prev[moduleId]?.completedSections || []), sectionId],
        lastAccessedAt: new Date(),
      },
    }));
  };

  const completeModule = (moduleId: string, score?: number) => {
    setProgress(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        status: "completed",
        completedAt: new Date(),
        score,
      },
    }));
  };

  return {
    modules,
    progress,
    isLoading,
    startModule,
    completeSection,
    completeModule,
  };
}
