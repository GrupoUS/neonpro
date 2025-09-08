"use client";

import type {
  Quiz,
  QuizAnswer,
  QuizAttempt,
  TrainingModule,
  TrainingProgress,
  TrainingSection,
  UserTrainingProfile,
} from "@/types/staff-training";
// import { PracticalExerciseResult } from "@/types/staff-training"; // Unused import
import { useCallback, useEffect, useState } from "react";

interface UseStaffTrainingOptions {
  userId?: string;
  role?: string;
  autoSave?: boolean;
  offlineMode?: boolean;
}

interface UseStaffTrainingReturn {
  // User profile and progress
  userProfile: UserTrainingProfile | null;
  trainingModules: TrainingModule[];
  userProgress: Record<string, TrainingProgress>;

  // Current session
  currentModule: TrainingModule | null;
  currentSection: TrainingSection | null;
  isLoading: boolean;
  error: string | null;

  // Module management
  startModule: (moduleId: string) => Promise<void>;
  completeSection: (sectionId: string) => Promise<void>;
  saveProgress: (
    moduleId: string,
    data: Partial<TrainingProgress>,
  ) => Promise<void>;

  // Quiz functionality
  startQuiz: (quizId: string) => Promise<void>;
  submitQuizAnswer: (questionId: string, answer: string | string[]) => void;
  completeQuiz: () => Promise<QuizAttempt>;

  // Progress tracking
  getModuleProgress: (moduleId: string) => number; // percentage
  getOverallProgress: () => number; // percentage
  getCompletedModules: () => string[];
  getRequiredModules: () => string[];

  // Certificates and achievements
  generateCertificate: (moduleId: string) => Promise<string>; // certificate URL
  checkCertificationEligibility: () => Promise<string[]>; // eligible certification IDs

  // Offline support
  syncOfflineData: () => Promise<void>;
  downloadModuleForOffline: (moduleId: string) => Promise<void>;
  isOfflineCapable: (moduleId: string) => boolean;
}

/**
 * Hook for managing staff training system
 * Supports PWA offline mode and progress synchronization
 */
export function useStaffTraining({
  userId,
  role,
  autoSave = true,
  offlineMode = false,
}: UseStaffTrainingOptions = {}): UseStaffTrainingReturn {
  const [userProfile, setUserProfile] = useState<UserTrainingProfile | null>(
    null,
  );
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<
    Record<string, TrainingProgress>
  >({});

  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(
    null,
  );
  const [currentSection, setCurrentSection] = useState<TrainingSection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<QuizAnswer[]>(
    [],
  );
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/staff-training/profile/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.profile);
      } else {
        throw new Error(data.message || "Failed to fetch user profile");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch user profile",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchTrainingModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (role) {
        params.append("role", role);
      }
      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/staff-training/modules?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setTrainingModules(data.modules);
      } else {
        throw new Error(data.message || "Failed to fetch training modules");
      }
    } catch (err) {
      console.error("Error fetching training modules:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch training modules",
      );
    } finally {
      setIsLoading(false);
    }
  }, [role, userId]);

  const fetchUserProgress = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(`/api/staff-training/progress/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const progressMap: Record<string, TrainingProgress> = {};
        data.progress.forEach((progress: TrainingProgress) => {
          progressMap[progress.moduleId] = progress;
        });
        setUserProgress(progressMap);
      }
    } catch (err) {
      console.error("Error fetching user progress:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch progress");
    }
  }, [userId]);

  const startModule = useCallback(
    async (moduleId: string) => {
      if (!userId) {
        return;
      }

      try {
        setIsLoading(true);

        const module = trainingModules.find((m) => m.id === moduleId);
        if (!module) {
          throw new Error("Module not found");
        }

        // Check prerequisites
        const unmetPrerequisites = module.prerequisites.filter((prereqId) => {
          const progress = userProgress[prereqId];
          return !progress || progress.status !== "completed";
        });

        if (unmetPrerequisites.length > 0) {
          throw new Error(
            "Prerequisites not met. Please complete required modules first.",
          );
        }

        const response = await fetch("/api/staff-training/start-module", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, moduleId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to start module: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setCurrentModule(module);
          setCurrentSection(module.sections[0] || null);

          // Update progress locally
          setUserProgress((prev) => ({
            ...prev,
            [moduleId]: {
              ...data.progress,
              startedAt: new Date(data.progress.startedAt),
              lastAccessedAt: new Date(data.progress.lastAccessedAt),
            },
          }));
        }
      } catch (err) {
        console.error("Error starting module:", err);
        setError(err instanceof Error ? err.message : "Failed to start module");
      } finally {
        setIsLoading(false);
      }
    },
    [userId, trainingModules, userProgress],
  );

  const completeSection = useCallback(
    async (sectionId: string) => {
      if (!userId || !currentModule) {
        return;
      }

      try {
        const response = await fetch("/api/staff-training/complete-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            moduleId: currentModule.id,
            sectionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to complete section: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          // Update progress locally
          setUserProgress((prev) => ({
            ...prev,
            [currentModule.id]: {
              ...prev[currentModule.id],
              sectionsCompleted: data.progress.sectionsCompleted,
              currentSectionId: data.progress.currentSectionId,
              timeSpent: data.progress.timeSpent,
              lastAccessedAt: new Date(),
            },
          }));

          // Move to next section if available
          const currentIndex = currentModule.sections.findIndex(
            (s) => s.id === sectionId,
          );
          const nextSection = currentModule.sections[currentIndex + 1];
          setCurrentSection(nextSection || null);
        }
      } catch (err) {
        console.error("Error completing section:", err);
        setError(
          err instanceof Error ? err.message : "Failed to complete section",
        );
      }
    },
    [userId, currentModule],
  );

  const saveProgress = useCallback(
    async (moduleId: string, data: Partial<TrainingProgress>) => {
      if (!userId || !autoSave) {
        return;
      }

      try {
        const response = await fetch("/api/staff-training/save-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            moduleId,
            progress: data,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save progress: ${response.statusText}`);
        }

        // Update local state
        setUserProgress((prev) => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            ...data,
            lastAccessedAt: new Date(),
          },
        }));
      } catch (err) {
        console.error("Error saving progress:", err);
        // Store in localStorage for offline sync
        if (offlineMode) {
          const offlineData = localStorage.getItem("training_offline_data") || "{}";
          const parsed = JSON.parse(offlineData);
          parsed[`${userId}_${moduleId}`] = data;
          localStorage.setItem("training_offline_data", JSON.stringify(parsed));
        }
      }
    },
    [userId, autoSave, offlineMode],
  );

  const startQuiz = useCallback(
    async (quizId: string) => {
      if (!userId || !currentModule) {
        return;
      }

      const quiz = currentModule.quiz;
      if (!quiz || quiz.id !== quizId) {
        setError("Quiz not found");
        return;
      }

      setCurrentQuiz(quiz);
      setCurrentQuizAnswers([]);
      setQuizStartTime(new Date());
    },
    [userId, currentModule],
  );

  const submitQuizAnswer = useCallback(
    (questionId: string, answer: string | string[]) => {
      if (!currentQuiz) {
        return;
      }

      const question = currentQuiz.questions.find((q) => q.id === questionId);
      if (!question) {
        return;
      }

      const isCorrect = Array.isArray(answer)
        ? JSON.stringify(answer.sort())
          === JSON.stringify((question.correctAnswer as string[]).sort())
        : answer === question.correctAnswer;

      const quizAnswer: QuizAnswer = {
        questionId,
        answer,
        isCorrect,
        timeSpent: 0, // Will be calculated on server
      };

      setCurrentQuizAnswers((prev) => {
        const existing = prev.findIndex((a) => a.questionId === questionId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = quizAnswer;
          return updated;
        }
        return [...prev, quizAnswer];
      });
    },
    [currentQuiz],
  );

  const completeQuiz = useCallback(async (): Promise<QuizAttempt> => {
    if (!userId || !currentModule || !currentQuiz || !quizStartTime) {
      throw new Error("Quiz not properly initialized");
    }

    try {
      const response = await fetch("/api/staff-training/complete-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleId: currentModule.id,
          quizId: currentQuiz.id,
          answers: currentQuizAnswers,
          startedAt: quizStartTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete quiz: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const attempt: QuizAttempt = {
          ...data.attempt,
          startedAt: new Date(data.attempt.startedAt),
          completedAt: new Date(data.attempt.completedAt),
        };

        // Update progress
        setUserProgress((prev) => ({
          ...prev,
          [currentModule.id]: {
            ...prev[currentModule.id],
            quizAttempts: [
              ...(prev[currentModule.id]?.quizAttempts || []),
              attempt,
            ],
          },
        }));

        // Clear quiz state
        setCurrentQuiz(null);
        setCurrentQuizAnswers([]);
        setQuizStartTime(null);

        return attempt;
      } else {
        throw new Error(data.message || "Failed to complete quiz");
      }
    } catch (err) {
      console.error("Error completing quiz:", err);
      throw err;
    }
  }, [userId, currentModule, currentQuiz, currentQuizAnswers, quizStartTime]);

  const getModuleProgress = useCallback(
    (moduleId: string): number => {
      const progress = userProgress[moduleId];
      if (!progress) {
        return 0;
      }

      const module = trainingModules.find((m) => m.id === moduleId);
      if (!module) {
        return 0;
      }

      const totalSections = module.sections.length;
      const completedSections = progress.sectionsCompleted.length;

      return totalSections > 0 ? (completedSections / totalSections) * 100 : 0;
    },
    [userProgress, trainingModules],
  );

  const getOverallProgress = useCallback((): number => {
    if (!userProfile) {
      return 0;
    }

    const requiredModules = userProfile.requiredModules;
    const completedCount = requiredModules.filter(
      (moduleId) => userProgress[moduleId]?.status === "completed",
    ).length;

    return requiredModules.length > 0
      ? (completedCount / requiredModules.length) * 100
      : 0;
  }, [userProfile, userProgress]);

  const getCompletedModules = useCallback((): string[] => {
    return Object.entries(userProgress)
      .filter(([_, progress]) => progress.status === "completed")
      .map(([moduleId, _]) => moduleId);
  }, [userProgress]);

  const getRequiredModules = useCallback((): string[] => {
    return userProfile?.requiredModules || [];
  }, [userProfile]);

  const generateCertificate = useCallback(
    async (moduleId: string): Promise<string> => {
      if (!userId) {
        throw new Error("User not identified");
      }

      const response = await fetch("/api/staff-training/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, moduleId }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate certificate: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.certificateUrl;
    },
    [userId],
  );

  const checkCertificationEligibility = useCallback(async (): Promise<
    string[]
  > => {
    if (!userId) {
      return [];
    }

    const response = await fetch(
      `/api/staff-training/certification-eligibility/${userId}`,
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.eligibleCertifications || [];
  }, [userId]);

  const syncOfflineData = useCallback(async () => {
    if (!offlineMode) {
      return;
    }

    const offlineData = localStorage.getItem("training_offline_data");
    if (!offlineData) {
      return;
    }

    try {
      const parsed = JSON.parse(offlineData);

      for (const [key, progressData] of Object.entries(parsed)) {
        const [userId, moduleId] = key.split("_");
        await saveProgress(moduleId, progressData as Partial<TrainingProgress>);
      }

      // Clear offline data after successful sync
      localStorage.removeItem("training_offline_data");
    } catch (err) {
      console.error("Error syncing offline data:", err);
    }
  }, [offlineMode, saveProgress]);

  const downloadModuleForOffline = useCallback(async (moduleId: string) => {
    try {
      const response = await fetch(
        `/api/staff-training/offline-download/${moduleId}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to download module: ${response.statusText}`);
      }

      const moduleData = await response.json();

      // Store in IndexedDB for offline access
      if ("indexedDB" in window) {
        const request = indexedDB.open("TrainingModules", 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(["modules"], "readwrite");
          const store = transaction.objectStore("modules");
          store.put(moduleData, moduleId);
        };
      }
    } catch (err) {
      console.error("Error downloading module for offline:", err);
      setError(
        err instanceof Error ? err.message : "Failed to download module",
      );
    }
  }, []);

  const isOfflineCapable = useCallback(
    (moduleId: string): boolean => {
      const module = trainingModules.find((m) => m.id === moduleId);
      if (!module) {
        return false;
      }

      // Check if module has only offline-compatible content
      return module.sections.every(
        (section) =>
          section.type === "text"
          || section.type === "checklist"
          || section.type === "case_study",
      );
    },
    [trainingModules],
  );

  // Initialize data
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserProgress();
    }
    fetchTrainingModules();
  }, [userId, fetchUserProfile, fetchUserProgress, fetchTrainingModules]);

  // Auto-save progress periodically
  useEffect(() => {
    if (!autoSave || !currentModule || !userId) {
      return;
    }

    const interval = setInterval(() => {
      const moduleProgress = userProgress[currentModule.id];
      if (moduleProgress) {
        saveProgress(currentModule.id, {
          timeSpent: (moduleProgress.timeSpent || 0) + 1, // Increment by 1 minute
          lastAccessedAt: new Date(),
        });
      }
    }, 60_000); // Save every minute

    return () => clearInterval(interval);
  }, [autoSave, currentModule, userId, userProgress, saveProgress]);

  return {
    // User profile and progress
    userProfile,
    trainingModules,
    userProgress,

    // Current session
    currentModule,
    currentSection,
    isLoading,
    error,

    // Module management
    startModule,
    completeSection,
    saveProgress,

    // Quiz functionality
    startQuiz,
    submitQuizAnswer,
    completeQuiz,

    // Progress tracking
    getModuleProgress,
    getOverallProgress,
    getCompletedModules,
    getRequiredModules,

    // Certificates and achievements
    generateCertificate,
    checkCertificationEligibility,

    // Offline support
    syncOfflineData,
    downloadModuleForOffline,
    isOfflineCapable,
  };
}
