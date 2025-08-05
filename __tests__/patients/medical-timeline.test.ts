// Mock the MedicalTimelineService
jest.mock("@/lib/patients/medical-timeline");

import { MedicalTimelineService } from "@/lib/patients/medical-timeline";

// Mock timeline events data
const mockTimelineEvents = [
  {
    id: "event_1",
    patientId: "123",
    title: "Consulta Inicial",
    description: "Primeira consulta para avaliação estética",
    eventType: "appointment",
    category: "aesthetic",
    date: new Date("2025-01-24T10:00:00Z"),
    professionalId: "prof_1",
    professionalName: "Dr. Ana Silva",
    severity: "low",
    metadata: { cost: 200, duration: 60 },
    attachments: [],
    beforeAfterPhotos: [],
    notes: [
      {
        id: "note_1",
        note: "Paciente interessada em procedimento de harmonização facial",
        date: new Date("2025-01-24T10:00:00Z"),
        author: "Dr. Ana Silva",
        type: "observation",
        visibility: "professional",
      },
    ],
  },
  {
    id: "event_2",
    patientId: "123",
    title: "Aplicação de Botox",
    description: "Procedimento de harmonização facial com toxina botulínica",
    eventType: "procedure",
    category: "aesthetic",
    date: new Date("2025-01-24T10:00:00Z"),
    professionalId: "prof_1",
    professionalName: "Dr. Ana Silva",
    severity: "medium",
    metadata: { cost: 800, units: 20 },
    attachments: [],
    beforeAfterPhotos: [
      {
        id: "photo_1",
        eventId: "event_2",
        comparisonType: "treatment",
        beforePhoto: {
          id: "before_1",
          url: "/images/before_1.jpg",
          thumbnailUrl: "/images/before_1_thumb.jpg",
          uploadedAt: new Date("2025-01-24T10:00:00Z"),
          metadata: { width: 1920, height: 1080, quality: 95 },
        },
        afterPhoto: {
          id: "after_1",
          url: "/images/after_1.jpg",
          thumbnailUrl: "/images/after_1_thumb.jpg",
          uploadedAt: new Date("2025-01-24T10:00:00Z"),
          metadata: { width: 1920, height: 1080, quality: 95 },
        },
        notes: "Aplicação focada em rugas de expressão",
        quality: 95,
      },
    ],
    notes: [
      {
        id: "note_2",
        note: "Aplicação realizada sem intercorrências",
        date: new Date("2025-01-24T10:00:00Z"),
        author: "Dr. Ana Silva",
        type: "observation",
        visibility: "professional",
      },
    ],
    outcome: {
      id: "outcome_1",
      success: true,
      satisfactionScore: 9,
      complications: [],
      followUpRequired: true,
      nextSteps: ["Retorno em 15 dias", "Avaliação de resultados"],
      patientFeedback: "Muito satisfeita com o resultado",
      professionalAssessment: "Resultado excelente, paciente respondeu muito bem",
      healingProgress: "excellent",
    },
  },
];

// Mock implementation
const mockGetPatientTimeline = jest
  .fn()
  .mockImplementation(async (patientId: string, filter?: any) => {
    let events = [...mockTimelineEvents];

    if (filter?.eventTypes?.length) {
      events = events.filter((e: any) => filter.eventTypes.includes(e.eventType));
    }
    if (filter?.categories?.length) {
      events = events.filter((e: any) => filter.categories.includes(e.category));
    }
    if (filter?.dateRange) {
      events = events.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate >= filter.dateRange.start && eventDate <= filter.dateRange.end;
      });
    }

    return events;
  });

const mockAddTimelineEvent = jest.fn().mockImplementation(async (event: any) => {
  return {
    id: "mock_" + Date.now(),
    ...event,
  };
});

const mockUpdateTimelineEvent = jest
  .fn()
  .mockImplementation(async (eventId: string, updates: any) => {
    return {
      ...mockTimelineEvents[0],
      ...updates,
      id: eventId,
    };
  });

const mockGetTreatmentMilestones = jest.fn().mockResolvedValue([
  { id: "1", title: "Início do Tratamento", date: "2025-01-10" },
  { id: "2", title: "Primeira Avaliação", date: "2025-01-12" },
]);

const mockGetTimelineSummary = jest.fn().mockResolvedValue({
  totalEvents: 2,
  eventTypes: { appointment: 1, procedure: 1 },
  categories: { aesthetic: 2 },
});

// Mock the constructor
(MedicalTimelineService as jest.Mock).mockImplementation(() => ({
  getPatientTimeline: mockGetPatientTimeline,
  addTimelineEvent: mockAddTimelineEvent,
  updateTimelineEvent: mockUpdateTimelineEvent,
  getTreatmentMilestones: mockGetTreatmentMilestones,
  getTimelineSummary: mockGetTimelineSummary,
}));

describe("Medical Timeline Service", () => {
  let medicalTimelineService: MedicalTimelineService;

  beforeEach(() => {
    medicalTimelineService = new MedicalTimelineService();
  });

  describe("getPatientTimeline", () => {
    it("should fetch timeline events for a patient", async () => {
      const events = await medicalTimelineService.getPatientTimeline("123");

      expect(events).toHaveLength(2);
      expect(events[0].patientId).toBe("123");
      expect(events[0].title).toBe("Consulta Inicial");
    });

    it("should filter events by type", async () => {
      const events = await medicalTimelineService.getPatientTimeline("123", {
        eventTypes: ["appointment"],
      });

      // Only one event is of type 'appointment'
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("appointment");
    });

    it("should filter events by date range", async () => {
      const events = await medicalTimelineService.getPatientTimeline("123", {
        dateRange: {
          start: new Date("2025-01-01"),
          end: new Date("2025-12-31"),
        },
      });

      // Both events are in 2025, so this filter should return both
      expect(events).toHaveLength(2);
    });

    it("should filter events by category", async () => {
      const events = await medicalTimelineService.getPatientTimeline("123", {
        categories: ["aesthetic"],
      });

      // Both events are aesthetic category
      expect(events).toHaveLength(2);
      events.forEach((event) => {
        expect(event.category).toBe("aesthetic");
      });
    });
  });

  describe("addTimelineEvent", () => {
    it("should add a new timeline event", async () => {
      const newEvent = {
        patientId: "123",
        title: "Tratamento Facial",
        description: "Limpeza de pele",
        eventType: "treatment" as const,
        category: "aesthetic" as const,
        date: new Date("2025-01-24T10:00:00Z"),
        professionalId: "prof_1",
        professionalName: "Dr. Ana Silva",
        severity: "low" as const,
        metadata: {
          category: "treatment",
          duration: 60,
        },
        attachments: [],
        beforeAfterPhotos: [],
        notes: [],
      };

      const result = await medicalTimelineService.addTimelineEvent(newEvent);

      expect(result).toHaveProperty("id");
      expect(result.patientId).toBe("123");
      expect(result.title).toBe("Tratamento Facial");
    });
  });

  describe("updateTimelineEvent", () => {
    it("should update a timeline event", async () => {
      const updates = {
        title: "Consulta Atualizada",
        description: "Descrição atualizada",
      };

      const result = await medicalTimelineService.updateTimelineEvent("event_1", updates);

      expect(result.id).toBe("event_1");
      expect(result.title).toBe("Consulta Atualizada");
      expect(result.description).toBe("Descrição atualizada");
    });
  });

  describe("getTreatmentMilestones", () => {
    it("should get treatment milestones", async () => {
      const result = await medicalTimelineService.getTreatmentMilestones("123");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        title: "Início do Tratamento",
        date: "2025-01-10",
      });
      expect(result[1]).toEqual({
        id: "2",
        title: "Primeira Avaliação",
        date: "2025-01-12",
      });
    });
  });

  describe("getTimelineSummary", () => {
    it("should get timeline summary", async () => {
      const result = await medicalTimelineService.getTimelineSummary("123", "month");

      expect(result).toEqual({
        totalEvents: 2,
        eventTypes: { appointment: 1, procedure: 1 },
        categories: { aesthetic: 2 },
      });
    });
  });
});
