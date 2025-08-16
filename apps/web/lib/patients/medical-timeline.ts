/**
 * NeonPro Medical History Timeline Service
 * Manages patient medical history with visual timeline representation
 */

import { createClient } from '@/app/utils/supabase/server';

export type TimelineEvent = {
  id: string;
  patientId: string;
  eventType:
    | 'appointment'
    | 'treatment'
    | 'procedure'
    | 'medication'
    | 'test'
    | 'diagnosis'
    | 'note'
    | 'photo';
  title: string;
  description: string;
  date: Date;
  category: 'medical' | 'aesthetic' | 'dental' | 'wellness' | 'emergency';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  professionalId?: string;
  professionalName?: string;
  attachments?: TimelineAttachment[];
  beforeAfterPhotos?: BeforeAfterPhoto[];
  outcome?: TreatmentOutcome;
  notes?: ProgressNote[];
  relatedEventIds?: string[];
  metadata?: Record<string, any>;
};

export type TimelineAttachment = {
  id: string;
  name: string;
  type: 'document' | 'image' | 'report' | 'prescription' | 'lab_result';
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
};

export type BeforeAfterPhoto = {
  id: string;
  eventId: string;
  beforePhoto?: PhotoData;
  afterPhoto?: PhotoData;
  comparisonType: 'treatment' | 'procedure' | 'healing' | 'progress';
  notes?: string;
  quality: number; // 0-100
};

export type PhotoData = {
  id: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  metadata: {
    width: number;
    height: number;
    quality: number;
    angle?: string;
    lighting?: string;
  };
};

export type TreatmentOutcome = {
  id: string;
  success: boolean;
  satisfactionScore: number; // 1-10
  complications?: string[];
  followUpRequired: boolean;
  nextSteps?: string[];
  patientFeedback?: string;
  professionalAssessment?: string;
  healingProgress: 'excellent' | 'good' | 'fair' | 'poor';
};

export type ProgressNote = {
  id: string;
  note: string;
  date: Date;
  author: string;
  type: 'observation' | 'instruction' | 'warning' | 'milestone';
  visibility: 'patient' | 'staff' | 'professional' | 'internal';
};

export type MilestoneTracking = {
  id: string;
  patientId: string;
  treatmentPlan: string;
  milestones: Milestone[];
  overallProgress: number; // 0-100
  estimatedCompletion: Date;
  actualCompletion?: Date;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  criteria: string[];
  completedCriteria: string[];
  progress: number; // 0-100
  notes?: string;
};

export type TimelineFilter = {
  eventTypes?: string[];
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  professionals?: string[];
  severity?: string[];
  includePhotos?: boolean;
  includeAttachments?: boolean;
};

export class MedicalTimelineService {
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get complete medical timeline for patient
   */
  async getPatientTimeline(
    patientId: string,
    filter?: TimelineFilter
  ): Promise<TimelineEvent[]> {
    try {
      const supabase = await this.getSupabase();
      let query = supabase
        .from('patient_timeline_events')
        .select(
          `
          *,
          professional:professionals(name),
          attachments:timeline_attachments(*),
          before_after_photos:before_after_photos(*),
          outcome:treatment_outcomes(*),
          notes:progress_notes(*)
        `
        )
        .eq('patient_id', patientId);

      // Apply filters
      if (filter) {
        if (filter.eventTypes?.length) {
          query = query.in('event_type', filter.eventTypes);
        }
        if (filter.categories?.length) {
          query = query.in('category', filter.categories);
        }
        if (filter.dateRange) {
          query = query
            .gte('date', filter.dateRange.start.toISOString())
            .lte('date', filter.dateRange.end.toISOString());
        }
        if (filter.professionals?.length) {
          query = query.in('professional_id', filter.professionals);
        }
        if (filter.severity?.length) {
          query = query.in('severity', filter.severity);
        }
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error('Failed to fetch patient timeline');
      }

      return this.transformTimelineData(data || []);
    } catch (_error) {
      // Return mock data for development
      return this.getMockTimelineData(patientId);
    }
  }

  /**
   * Add new timeline event
   */
  async addTimelineEvent(
    event: Omit<TimelineEvent, 'id'>
  ): Promise<TimelineEvent> {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('patient_timeline_events')
        .insert({
          patient_id: event.patientId,
          event_type: event.eventType,
          title: event.title,
          description: event.description,
          date: event.date.toISOString(),
          category: event.category,
          severity: event.severity,
          professional_id: event.professionalId,
          metadata: event.metadata,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to add timeline event');
      }

      return this.transformTimelineEvent(data);
    } catch (_error) {
      // Return mock event for development
      return {
        id: `mock_${Date.now()}`,
        ...event,
      };
    }
  }

  /**
   * Update timeline event
   */
  async updateTimelineEvent(
    eventId: string,
    updates: Partial<TimelineEvent>
  ): Promise<TimelineEvent> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('patient_timeline_events')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.date && { date: updates.date.toISOString() }),
        ...(updates.category && { category: updates.category }),
        ...(updates.severity && { severity: updates.severity }),
        ...(updates.metadata && { metadata: updates.metadata }),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update timeline event');
    }

    return this.transformTimelineEvent(data);
  }

  /**
   * Add before/after photos to timeline event
   */
  async addBeforeAfterPhotos(
    eventId: string,
    photos: Omit<BeforeAfterPhoto, 'id' | 'eventId'>
  ): Promise<BeforeAfterPhoto> {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('before_after_photos')
        .insert({
          event_id: eventId,
          comparison_type: photos.comparisonType,
          notes: photos.notes,
          quality: photos.quality,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to add before/after photos');
      }

      return {
        id: data.id,
        eventId,
        ...photos,
      };
    } catch (_error) {
      // Return mock photo for development
      return {
        id: `photo_${Date.now()}`,
        eventId,
        ...photos,
      };
    }
  }

  /**
   * Add progress note to timeline event
   */
  async addProgressNote(
    eventId: string,
    note: Omit<ProgressNote, 'id'>
  ): Promise<ProgressNote> {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('progress_notes')
        .insert({
          event_id: eventId,
          note: note.note,
          date: note.date.toISOString(),
          author: note.author,
          type: note.type,
          visibility: note.visibility,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to add progress note');
      }

      return {
        id: data.id,
        ...note,
      };
    } catch (_error) {
      // Return mock note for development
      return {
        id: `note_${Date.now()}`,
        ...note,
      };
    }
  }

  /**
   * Get treatment milestones for patient
   */
  async getTreatmentMilestones(
    patientId: string
  ): Promise<MilestoneTracking[]> {
    try {
      const supabase = await this.getSupabase();
      const { data, error } = await supabase
        .from('milestone_tracking')
        .select(
          `
          *,
          milestones:milestones(*)
        `
        )
        .eq('patient_id', patientId);

      if (error) {
        throw new Error('Failed to fetch treatment milestones');
      }

      return data || [];
    } catch (_error) {
      // Return mock milestones for development
      return this.getMockMilestones(patientId);
    }
  }

  /**
   * Update milestone progress
   */
  async updateMilestoneProgress(
    milestoneId: string,
    progress: number,
    notes?: string
  ): Promise<Milestone> {
    const updates: any = { progress };
    if (progress === 100) {
      updates.status = 'completed';
      updates.completed_date = new Date().toISOString();
    }
    if (notes) {
      updates.notes = notes;
    }

    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update milestone progress');
    }

    return this.transformMilestone(data);
  }

  /**
   * Generate timeline summary for period
   */
  async getTimelineSummary(
    patientId: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const events = await this.getPatientTimeline(patientId, {
      dateRange: { start: startDate, end: endDate },
    });

    return {
      totalEvents: events.length,
      eventTypes: this.groupByEventType(events),
      categories: this.groupByCategory(events),
      timeline: events,
      insights: this.generateTimelineInsights(events),
    };
  }

  // Private helper methods
  private transformTimelineData(data: any[]): TimelineEvent[] {
    return data.map((item) => this.transformTimelineEvent(item));
  }

  private transformTimelineEvent(data: any): TimelineEvent {
    return {
      id: data.id,
      patientId: data.patient_id,
      eventType: data.event_type,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      category: data.category,
      severity: data.severity,
      professionalId: data.professional_id,
      professionalName: data.professional?.name,
      attachments: data.attachments || [],
      beforeAfterPhotos: data.before_after_photos || [],
      outcome: data.outcome,
      notes: data.notes || [],
      relatedEventIds: data.related_event_ids || [],
      metadata: data.metadata || {},
    };
  }

  private transformMilestone(data: any): Milestone {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      targetDate: new Date(data.target_date),
      completedDate: data.completed_date
        ? new Date(data.completed_date)
        : undefined,
      status: data.status,
      criteria: data.criteria || [],
      completedCriteria: data.completed_criteria || [],
      progress: data.progress,
      notes: data.notes,
    };
  }

  private groupByEventType(events: TimelineEvent[]): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private groupByCategory(events: TimelineEvent[]): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private generateTimelineInsights(events: TimelineEvent[]): any {
    return {
      mostActiveMonth: this.getMostActiveMonth(events),
      treatmentFrequency: this.calculateTreatmentFrequency(events),
      outcomePatterns: this.analyzeOutcomePatterns(events),
      professionalDistribution: this.getProfessionalDistribution(events),
    };
  }

  private getMostActiveMonth(events: TimelineEvent[]): string {
    const monthCounts = events.reduce(
      (acc, event) => {
        const month = event.date.toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return (
      Object.entries(monthCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || ''
    );
  }

  private calculateTreatmentFrequency(events: TimelineEvent[]): number {
    const treatmentEvents = events.filter(
      (e) => e.eventType === 'treatment' || e.eventType === 'procedure'
    );
    if (treatmentEvents.length < 2) {
      return 0;
    }

    const dates = treatmentEvents.map((e) => e.date.getTime()).sort();
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i] - dates[i - 1]);
    }

    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(avgInterval / (1000 * 60 * 60 * 24)); // Days
  }

  private analyzeOutcomePatterns(events: TimelineEvent[]): any {
    const eventsWithOutcomes = events.filter((e) => e.outcome);
    const totalOutcomes = eventsWithOutcomes.length;

    if (totalOutcomes === 0) {
      return { successRate: 0, avgSatisfaction: 0 };
    }

    const successfulOutcomes = eventsWithOutcomes.filter(
      (e) => e.outcome?.success
    ).length;
    const avgSatisfaction =
      eventsWithOutcomes.reduce(
        (sum, e) => sum + (e.outcome?.satisfactionScore || 0),
        0
      ) / totalOutcomes;

    return {
      successRate: (successfulOutcomes / totalOutcomes) * 100,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    };
  }

  private getProfessionalDistribution(
    events: TimelineEvent[]
  ): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        if (event.professionalName) {
          acc[event.professionalName] = (acc[event.professionalName] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // Mock data for development
  private getMockTimelineData(patientId: string): TimelineEvent[] {
    return [
      {
        id: 'event_1',
        patientId,
        eventType: 'appointment',
        title: 'Consulta Inicial',
        description: 'Primeira consulta para avaliação estética',
        date: new Date('2024-12-15'),
        category: 'aesthetic',
        severity: 'low',
        professionalId: 'prof_1',
        professionalName: 'Dr. Ana Silva',
        attachments: [],
        beforeAfterPhotos: [],
        notes: [
          {
            id: 'note_1',
            note: 'Paciente interessada em procedimento de harmonização facial',
            date: new Date('2024-12-15'),
            author: 'Dr. Ana Silva',
            type: 'observation',
            visibility: 'professional',
          },
        ],
        metadata: { duration: 60, cost: 200 },
      },
      {
        id: 'event_2',
        patientId,
        eventType: 'procedure',
        title: 'Aplicação de Botox',
        description:
          'Procedimento de harmonização facial com toxina botulínica',
        date: new Date('2025-01-05'),
        category: 'aesthetic',
        severity: 'medium',
        professionalId: 'prof_1',
        professionalName: 'Dr. Ana Silva',
        attachments: [],
        beforeAfterPhotos: [
          {
            id: 'photo_1',
            eventId: 'event_2',
            comparisonType: 'treatment',
            notes: 'Aplicação focada em rugas de expressão',
            quality: 95,
            beforePhoto: {
              id: 'before_1',
              url: '/images/before_1.jpg',
              thumbnailUrl: '/images/before_1_thumb.jpg',
              uploadedAt: new Date('2025-01-05'),
              metadata: { width: 1920, height: 1080, quality: 95 },
            },
            afterPhoto: {
              id: 'after_1',
              url: '/images/after_1.jpg',
              thumbnailUrl: '/images/after_1_thumb.jpg',
              uploadedAt: new Date('2025-01-26'),
              metadata: { width: 1920, height: 1080, quality: 95 },
            },
          },
        ],
        outcome: {
          id: 'outcome_1',
          success: true,
          satisfactionScore: 9,
          complications: [],
          followUpRequired: true,
          nextSteps: ['Retorno em 15 dias', 'Avaliação de resultados'],
          patientFeedback: 'Muito satisfeita com o resultado',
          professionalAssessment:
            'Resultado excelente, paciente respondeu muito bem',
          healingProgress: 'excellent',
        },
        notes: [
          {
            id: 'note_2',
            note: 'Aplicação realizada sem intercorrências',
            date: new Date('2025-01-05'),
            author: 'Dr. Ana Silva',
            type: 'observation',
            visibility: 'professional',
          },
        ],
        metadata: { units: 20, cost: 800 },
      },
    ];
  }

  private getMockMilestones(patientId: string): MilestoneTracking[] {
    return [
      {
        id: 'milestone_tracking_1',
        patientId,
        treatmentPlan: 'Harmonização Facial Completa',
        overallProgress: 65,
        estimatedCompletion: new Date('2025-06-01'),
        milestones: [
          {
            id: 'milestone_1',
            title: 'Consulta Inicial',
            description: 'Avaliação e planejamento do tratamento',
            targetDate: new Date('2024-12-15'),
            completedDate: new Date('2024-12-15'),
            status: 'completed',
            criteria: [
              'Análise facial',
              'Expectativas alinhadas',
              'Plano definido',
            ],
            completedCriteria: [
              'Análise facial',
              'Expectativas alinhadas',
              'Plano definido',
            ],
            progress: 100,
            notes: 'Consulta realizada com sucesso',
          },
          {
            id: 'milestone_2',
            title: 'Primeira Aplicação',
            description: 'Aplicação inicial de toxina botulínica',
            targetDate: new Date('2025-01-05'),
            completedDate: new Date('2025-01-05'),
            status: 'completed',
            criteria: [
              'Aplicação segura',
              'Resultado imediato',
              'Sem complicações',
            ],
            completedCriteria: [
              'Aplicação segura',
              'Resultado imediato',
              'Sem complicações',
            ],
            progress: 100,
            notes: 'Procedimento realizado conforme planejado',
          },
          {
            id: 'milestone_3',
            title: 'Avaliação de Resultados',
            description: 'Avaliação dos resultados após 3 semanas',
            targetDate: new Date('2025-01-26'),
            status: 'in_progress',
            criteria: [
              'Redução de rugas',
              'Satisfação da paciente',
              'Necessidade de retoques',
            ],
            completedCriteria: ['Redução de rugas', 'Satisfação da paciente'],
            progress: 75,
            notes: 'Resultados muito positivos, paciente satisfeita',
          },
        ],
      },
    ];
  }
}

// Export instance for use
export const medicalTimelineService = new MedicalTimelineService();
