import { addDays } from 'date-fns';
import type {
  CompleteTreatmentSessionData,
  CreateTreatmentPlanData,
  CreateTreatmentSessionData,
  TreatmentPlan,
  TreatmentSession,
  UpdateTreatmentPlanData,
} from './types';
import { TreatmentStatus } from './types';

export type TreatmentRepository = {
  // Treatment plan operations
  createTreatmentPlan(data: CreateTreatmentPlanData): Promise<TreatmentPlan>;
  updateTreatmentPlan(
    id: string,
    data: UpdateTreatmentPlanData
  ): Promise<TreatmentPlan>;
  getTreatmentPlan(id: string): Promise<TreatmentPlan | null>;
  getTreatmentPlansByPatient(patientId: string): Promise<TreatmentPlan[]>;
  getTreatmentPlansByProvider(providerId: string): Promise<TreatmentPlan[]>;

  // Treatment session operations
  createTreatmentSession(
    data: CreateTreatmentSessionData
  ): Promise<TreatmentSession>;
  updateTreatmentSession(
    id: string,
    data: Partial<TreatmentSession>
  ): Promise<TreatmentSession>;
  getTreatmentSession(id: string): Promise<TreatmentSession | null>;
  getTreatmentSessionsByPlan(
    treatmentPlanId: string
  ): Promise<TreatmentSession[]>;
  completeTreatmentSession(
    id: string,
    data: CompleteTreatmentSessionData
  ): Promise<TreatmentSession>;
};

export class TreatmentService {
  constructor(private readonly repository: TreatmentRepository) {}

  // Treatment plan management
  async createTreatmentPlan(
    data: CreateTreatmentPlanData
  ): Promise<TreatmentPlan> {
    try {
      const treatmentPlan = await this.repository.createTreatmentPlan(data);
      return treatmentPlan;
    } catch (_error) {
      throw new Error('Failed to create treatment plan');
    }
  }
  async updateTreatmentPlan(
    id: string,
    data: UpdateTreatmentPlanData
  ): Promise<TreatmentPlan> {
    try {
      const treatmentPlan = await this.repository.updateTreatmentPlan(id, data);
      return treatmentPlan;
    } catch (_error) {
      throw new Error('Failed to update treatment plan');
    }
  }

  async getTreatmentPlan(id: string): Promise<TreatmentPlan | null> {
    return this.repository.getTreatmentPlan(id);
  }

  async getPatientTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    return this.repository.getTreatmentPlansByPatient(patientId);
  }

  async getActiveTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    const plans = await this.repository.getTreatmentPlansByPatient(patientId);
    return plans.filter(
      (plan) => plan.isActive && plan.completedSessions < plan.totalSessions
    );
  }

  async deactivateTreatmentPlan(id: string, reason?: string): Promise<void> {
    await this.repository.updateTreatmentPlan(id, {
      id,
      isActive: false,
      notes: reason ? `Deactivated: ${reason}` : 'Treatment plan deactivated',
    });
  }

  // Treatment session management
  async createTreatmentSession(
    data: CreateTreatmentSessionData
  ): Promise<TreatmentSession> {
    try {
      // Validate that the treatment plan exists and is active
      const treatmentPlan = await this.repository.getTreatmentPlan(
        data.treatmentPlanId
      );
      if (!treatmentPlan) {
        throw new Error('Treatment plan not found');
      }

      if (!treatmentPlan.isActive) {
        throw new Error('Cannot create session for inactive treatment plan');
      }

      if (treatmentPlan.completedSessions >= treatmentPlan.totalSessions) {
        throw new Error(
          'All sessions for this treatment plan have been completed'
        );
      }

      const session = await this.repository.createTreatmentSession(data);
      return session;
    } catch (_error) {
      throw new Error('Failed to create treatment session');
    }
  }
  async completeTreatmentSession(
    sessionId: string,
    data: CompleteTreatmentSessionData
  ): Promise<{
    session: TreatmentSession;
    treatmentPlan: TreatmentPlan;
    nextSessionDate?: Date;
  }> {
    try {
      // Complete the session
      const session = await this.repository.completeTreatmentSession(
        sessionId,
        data
      );

      // Update treatment plan
      const treatmentPlan = await this.repository.getTreatmentPlan(
        session.treatmentPlanId
      );
      if (!treatmentPlan) {
        throw new Error('Treatment plan not found');
      }

      const updatedPlan = await this.repository.updateTreatmentPlan(
        treatmentPlan.id,
        {
          id: treatmentPlan.id,
          completedSessions: treatmentPlan.completedSessions + 1,
        }
      );

      // Calculate next session date if needed
      let nextSessionDate: Date | undefined;
      if (updatedPlan.completedSessions < updatedPlan.totalSessions) {
        nextSessionDate = addDays(session.date, treatmentPlan.sessionInterval);
      } else {
        // Mark treatment plan as completed
        await this.repository.updateTreatmentPlan(treatmentPlan.id, {
          id: treatmentPlan.id,
          endDate: new Date(),
          isActive: false,
        });
      }

      return {
        session,
        treatmentPlan: updatedPlan,
        nextSessionDate,
      };
    } catch (_error) {
      throw new Error('Failed to complete treatment session');
    }
  }

  async getTreatmentSession(id: string): Promise<TreatmentSession | null> {
    return this.repository.getTreatmentSession(id);
  }

  async getTreatmentSessionsByPlan(
    treatmentPlanId: string
  ): Promise<TreatmentSession[]> {
    return this.repository.getTreatmentSessionsByPlan(treatmentPlanId);
  } // Progress tracking and analytics
  async getTreatmentProgress(treatmentPlanId: string): Promise<{
    plan: TreatmentPlan;
    sessions: TreatmentSession[];
    progressPercentage: number;
    nextSessionDate?: Date;
    status: TreatmentStatus;
  }> {
    const plan = await this.repository.getTreatmentPlan(treatmentPlanId);
    if (!plan) {
      throw new Error('Treatment plan not found');
    }

    const sessions =
      await this.repository.getTreatmentSessionsByPlan(treatmentPlanId);
    const completedSessions = sessions.filter((s) => s.isCompleted);
    const progressPercentage =
      (completedSessions.length / plan.totalSessions) * 100;

    let status: TreatmentStatus;
    if (!plan.isActive) {
      status =
        plan.completedSessions === plan.totalSessions
          ? TreatmentStatus.COMPLETED
          : TreatmentStatus.CANCELLED;
    } else if (plan.completedSessions === 0) {
      status = TreatmentStatus.PLANNED;
    } else if (plan.completedSessions < plan.totalSessions) {
      status = TreatmentStatus.IN_PROGRESS;
    } else {
      status = TreatmentStatus.COMPLETED;
    }

    let nextSessionDate: Date | undefined;
    if (
      status === TreatmentStatus.IN_PROGRESS &&
      completedSessions.length > 0
    ) {
      const lastSession = completedSessions.at(-1);
      nextSessionDate = addDays(lastSession.date, plan.sessionInterval);
    }

    return {
      plan,
      sessions,
      progressPercentage,
      nextSessionDate,
      status,
    };
  }

  async getTreatmentStats(
    providerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    totalSessions: number;
    completedSessions: number;
    popularTreatments: { treatmentType: string; count: number }[];
  }> {
    const plans = providerId
      ? await this.repository.getTreatmentPlansByProvider(providerId)
      : await this.repository.getTreatmentPlansByPatient(''); // This would need to be adjusted

    // Filter by date range if provided
    let filteredPlans = plans;
    if (startDate && endDate) {
      filteredPlans = plans.filter(
        (plan) => plan.createdAt >= startDate && plan.createdAt <= endDate
      );
    }

    const activePlans = filteredPlans.filter((plan) => plan.isActive);
    const completedPlans = filteredPlans.filter(
      (plan) => !plan.isActive && plan.completedSessions === plan.totalSessions
    );

    const totalSessions = filteredPlans.reduce(
      (sum, plan) => sum + plan.totalSessions,
      0
    );
    const completedSessions = filteredPlans.reduce(
      (sum, plan) => sum + plan.completedSessions,
      0
    );

    // Calculate popular treatments
    const treatmentCounts = new Map<string, number>();
    filteredPlans.forEach((plan) => {
      const count = treatmentCounts.get(plan.treatmentType) || 0;
      treatmentCounts.set(plan.treatmentType, count + 1);
    });

    const popularTreatments = Array.from(treatmentCounts.entries())
      .map(([treatmentType, count]) => ({ treatmentType, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalPlans: filteredPlans.length,
      activePlans: activePlans.length,
      completedPlans: completedPlans.length,
      totalSessions,
      completedSessions,
      popularTreatments,
    };
  }
}
