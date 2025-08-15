export interface TimelineEvent {
  id: string;
  patientId: string;
  type:
    | 'appointment'
    | 'diagnosis'
    | 'procedure'
    | 'medication'
    | 'lab'
    | 'vital'
    | 'note';
  category:
    | 'primary_care'
    | 'specialist'
    | 'emergency'
    | 'preventive'
    | 'chronic_care';
  date: Date;
  title: string;
  description: string;
  provider: string;
  facility?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'completed' | 'cancelled' | 'ongoing';
  attachments?: string[];
  relatedEvents?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalCondition {
  id: string;
  name: string;
  icd10Code?: string;
  diagnosedDate: Date;
  status: 'active' | 'resolved' | 'chronic' | 'monitored';
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
  treatmentPlan?: string;
}

export interface TimelineFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  types?: TimelineEvent['type'][];
  categories?: TimelineEvent['category'][];
  providers?: string[];
  severity?: TimelineEvent['severity'][];
  status?: TimelineEvent['status'][];
}

export interface TimelineAnalytics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  averageEventsPerMonth: number;
  mostActiveProvider: string;
  chronicConditions: MedicalCondition[];
  upcomingEvents: TimelineEvent[];
  recentSignificantEvents: TimelineEvent[];
}

export class MedicalTimelineManager {
  /**
   * Adiciona um novo evento à timeline médica
   */
  async addTimelineEvent(
    event: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TimelineEvent> {
    try {
      const newEvent: TimelineEvent = {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simular salvamento no banco de dados
      return newEvent;
    } catch (error) {
      console.error('Erro ao adicionar evento à timeline:', error);
      throw new Error('Falha ao adicionar evento médico');
    }
  }

  /**
   * Recupera a timeline médica completa de um paciente
   */
  async getPatientTimeline(
    patientId: string,
    filter?: TimelineFilter
  ): Promise<TimelineEvent[]> {
    try {
      // Simular dados de timeline médica
      const mockEvents: TimelineEvent[] = [
        {
          id: 'evt_001',
          patientId,
          type: 'appointment',
          category: 'primary_care',
          date: new Date('2024-01-15'),
          title: 'Consulta de Rotina',
          description:
            'Consulta anual preventiva. Paciente relata fadiga ocasional.',
          provider: 'Dr. Maria Silva',
          facility: 'NeonPro Clínica',
          severity: 'low',
          status: 'completed',
          metadata: {
            duration: 45,
            nextAppointment: '2024-07-15',
          },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'evt_002',
          patientId,
          type: 'lab',
          category: 'preventive',
          date: new Date('2024-01-20'),
          title: 'Exames Laboratoriais',
          description:
            'Hemograma completo, perfil lipídico, glicemia de jejum.',
          provider: 'Lab Central',
          severity: 'medium',
          status: 'completed',
          metadata: {
            results: {
              glucose: '112 mg/dL',
              cholesterol: '195 mg/dL',
              hdl: '42 mg/dL',
            },
          },
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
        {
          id: 'evt_003',
          patientId,
          type: 'diagnosis',
          category: 'chronic_care',
          date: new Date('2024-02-01'),
          title: 'Diagnóstico: Pré-hipertensão',
          description:
            'Pressão arterial consistentemente elevada (135-139/85-89 mmHg).',
          provider: 'Dr. Maria Silva',
          facility: 'NeonPro Clínica',
          severity: 'medium',
          status: 'ongoing',
          metadata: {
            icd10: 'R03.0',
            treatmentPlan:
              'Modificações no estilo de vida, monitoramento mensal',
          },
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: 'evt_004',
          patientId,
          type: 'medication',
          category: 'chronic_care',
          date: new Date('2024-02-05'),
          title: 'Prescrição: Lisinopril 10mg',
          description: 'Iniciado IECA para controle da pressão arterial.',
          provider: 'Dr. Maria Silva',
          severity: 'medium',
          status: 'ongoing',
          metadata: {
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: '1x dia',
            duration: 'contínuo',
          },
          createdAt: new Date('2024-02-05'),
          updatedAt: new Date('2024-02-05'),
        },
        {
          id: 'evt_005',
          patientId,
          type: 'appointment',
          category: 'specialist',
          date: new Date('2024-03-10'),
          title: 'Consulta Cardiológica',
          description: 'Avaliação especializada do risco cardiovascular.',
          provider: 'Dr. João Cardoso',
          facility: 'Centro Cardíaco',
          severity: 'medium',
          status: 'completed',
          metadata: {
            recommendations: 'Manter medicação atual, exercícios regulares',
          },
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-03-10'),
        },
        {
          id: 'evt_006',
          patientId,
          type: 'vital',
          category: 'chronic_care',
          date: new Date('2024-03-25'),
          title: 'Monitoramento de PA',
          description: 'Pressão arterial: 128/82 mmHg. Melhora significativa.',
          provider: 'Enfermeira Ana',
          facility: 'NeonPro Clínica',
          severity: 'low',
          status: 'completed',
          metadata: {
            systolic: 128,
            diastolic: 82,
            heartRate: 72,
          },
          createdAt: new Date('2024-03-25'),
          updatedAt: new Date('2024-03-25'),
        },
      ];

      // Aplicar filtros se fornecidos
      let filteredEvents = mockEvents;

      if (filter) {
        if (filter.dateRange) {
          filteredEvents = filteredEvents.filter(
            (event) =>
              event.date >= filter.dateRange?.start &&
              event.date <= filter.dateRange?.end
          );
        }

        if (filter.types && filter.types.length > 0) {
          filteredEvents = filteredEvents.filter((event) =>
            filter.types?.includes(event.type)
          );
        }

        if (filter.categories && filter.categories.length > 0) {
          filteredEvents = filteredEvents.filter((event) =>
            filter.categories?.includes(event.category)
          );
        }

        if (filter.severity && filter.severity.length > 0) {
          filteredEvents = filteredEvents.filter(
            (event) =>
              event.severity && filter.severity?.includes(event.severity)
          );
        }

        if (filter.status && filter.status.length > 0) {
          filteredEvents = filteredEvents.filter((event) =>
            filter.status?.includes(event.status)
          );
        }
      }

      // Ordenar por data (mais recente primeiro)
      return filteredEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Erro ao recuperar timeline do paciente:', error);
      throw new Error('Falha ao carregar timeline médica');
    }
  }

  /**
   * Atualiza um evento existente na timeline
   */
  async updateTimelineEvent(
    eventId: string,
    updates: Partial<TimelineEvent>
  ): Promise<TimelineEvent> {
    try {
      // Simular atualização do evento
      const updatedEvent: TimelineEvent = {
        id: eventId,
        patientId: updates.patientId || '',
        type: updates.type || 'note',
        category: updates.category || 'primary_care',
        date: updates.date || new Date(),
        title: updates.title || '',
        description: updates.description || '',
        provider: updates.provider || '',
        facility: updates.facility,
        severity: updates.severity,
        status: updates.status || 'completed',
        attachments: updates.attachments,
        relatedEvents: updates.relatedEvents,
        metadata: updates.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return updatedEvent;
    } catch (error) {
      console.error('Erro ao atualizar evento da timeline:', error);
      throw new Error('Falha ao atualizar evento médico');
    }
  }

  /**
   * Remove um evento da timeline
   */
  async deleteTimelineEvent(_eventId: string): Promise<boolean> {
    try {
      // Simular remoção do evento
      return true;
    } catch (error) {
      console.error('Erro ao remover evento da timeline:', error);
      throw new Error('Falha ao remover evento médico');
    }
  }

  /**
   * Gera análise estatística da timeline médica
   */
  async getTimelineAnalytics(
    patientId: string,
    _timeframe = '1year'
  ): Promise<TimelineAnalytics> {
    try {
      const timeline = await this.getPatientTimeline(patientId);

      const analytics: TimelineAnalytics = {
        totalEvents: timeline.length,
        eventsByType: timeline.reduce(
          (acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        eventsByCategory: timeline.reduce(
          (acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        averageEventsPerMonth: timeline.length / 12,
        mostActiveProvider: 'Dr. Maria Silva',
        chronicConditions: [
          {
            id: 'cond_001',
            name: 'Pré-hipertensão',
            icd10Code: 'R03.0',
            diagnosedDate: new Date('2024-02-01'),
            status: 'monitored',
            severity: 'moderate',
            description: 'Pressão arterial limite, em tratamento',
            treatmentPlan: 'Medicação + modificações no estilo de vida',
          },
        ],
        upcomingEvents: timeline.filter(
          (event) => event.status === 'scheduled' && event.date > new Date()
        ),
        recentSignificantEvents: timeline
          .filter(
            (event) =>
              event.severity && ['high', 'critical'].includes(event.severity)
          )
          .slice(0, 5),
      };

      return analytics;
    } catch (error) {
      console.error('Erro ao gerar análise da timeline:', error);
      throw new Error('Falha na análise da timeline médica');
    }
  }

  /**
   * Busca eventos por critérios específicos
   */
  async searchTimelineEvents(
    patientId: string,
    query: string
  ): Promise<TimelineEvent[]> {
    try {
      const timeline = await this.getPatientTimeline(patientId);

      const searchResults = timeline.filter(
        (event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.provider.toLowerCase().includes(query.toLowerCase())
      );

      return searchResults;
    } catch (error) {
      console.error('Erro na busca de eventos:', error);
      throw new Error('Falha na busca de eventos médicos');
    }
  }

  /**
   * Exporta timeline em diferentes formatos
   */
  async exportTimeline(
    patientId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<any> {
    try {
      const timeline = await this.getPatientTimeline(patientId);

      switch (format) {
        case 'json':
          return {
            patientId,
            exportedAt: new Date(),
            events: timeline,
          };

        case 'csv': {
          const csvHeaders =
            'Data,Tipo,Categoria,Título,Descrição,Provedor,Status\n';
          const csvData = timeline
            .map(
              (event) =>
                `${event.date.toISOString()},${event.type},${event.category},"${event.title}","${event.description}",${event.provider},${event.status}`
            )
            .join('\n');
          return csvHeaders + csvData;
        }

        case 'pdf':
          return {
            format: 'pdf',
            content: timeline,
            metadata: {
              title: `Timeline Médica - Paciente ${patientId}`,
              exportedAt: new Date(),
            },
          };

        default:
          return timeline;
      }
    } catch (error) {
      console.error('Erro ao exportar timeline:', error);
      throw new Error('Falha na exportação da timeline');
    }
  }
}

export const medicalTimelineManager = new MedicalTimelineManager();
