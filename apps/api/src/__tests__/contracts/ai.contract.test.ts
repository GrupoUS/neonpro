import { appRouter } from '@/trpc/router';
import type { AppRouter } from '@/trpc/router';
import type { AIInput, AIOutput } from '@/types/api/contracts';
import { createTRPCMsw } from 'msw-trpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * AI Contract Tests
 * Tests the tRPC AI API endpoints contract compliance
 * Ensures type safety, input validation, and output conformity
 * Covers AI chat, insights, and automation endpoints
 */

describe(_'AI Contract Testing',() => {
  const mockContext = {
    user: { id: 'user-123', _role: 'professional' },
    auth: { _userId: 'user-123', isAuthenticated: true },
    prisma: {
      aiChatSession: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      aiChatMessage: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      aiNoShowPrediction: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      patient: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      appointment: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      professional: {
        findUnique: vi.fn(),
      },
    },
    ai: {
      generateResponse: vi.fn(),
      analyzeConversation: vi.fn(),
      predictNoShow: vi.fn(),
      generateInsights: vi.fn(),
      validatePromptSafety: vi.fn(),
      sanitizePhiData: vi.fn(),
    },
    audit: {
      logAIInteraction: vi.fn(),
      createAuditRecord: vi.fn(),
    },
    compliance: {
      validatePhiHandling: vi.fn(),
      checkDataSanitization: vi.fn(),
    },
  };

  const trpcMsw = createTRPCMsw<AppRouter>();
  const caller = appRouter.createCaller(mockContext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe(_'AI Chat Session Contract',() => {
    it(_'should validate chat session creation',_async () => {
      const sessionInput: AIInput['createChatSession'] = {
        _context: {
          type: 'patient_consultation',
          patientId: 'patient-456',
          professionalId: 'prof-123',
          clinicId: 'clinic-789',
        },
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2048,
          language: 'pt-BR',
        },
        privacy: {
          phiHandling: 'sanitized',
          auditLevel: 'detailed',
          retentionPeriod: '30d',
        },
      };

      const mockSession = {
        id: 'session-uuid-123',
        _userId: 'user-123',
        patientId: 'patient-456',
        type: 'patient_consultation',
        status: 'active',
        configuration: sessionInput.configuration,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockContext.compliance.validatePhiHandling.mockResolvedValue({
        valid: true,
        sanitizationRequired: true,
      });
      mockContext.prisma.aiChatSession.create.mockResolvedValue(mockSession);

      const result = await caller.api.ai.createChatSession(sessionInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          sessionId: 'session-uuid-123',
          status: 'active',
          configuration: expect.objectContaining({
            model: 'gpt-4',
            language: 'pt-BR',
          }),
        }),
      });

      // Verify PHI compliance validation
      expect(mockContext.compliance.validatePhiHandling).toHaveBeenCalledWith({
        patientId: 'patient-456',
        phiHandling: 'sanitized',
      });

      // Verify audit logging
      expect(mockContext.audit.logAIInteraction).toHaveBeenCalledWith({
        action: 'create_session',
        sessionId: 'session-uuid-123',
        _userId: 'user-123',
        patientId: 'patient-456',
        timestamp: expect.any(Date),
      });
    });

    it(_'should enforce PHI sanitization requirements',_async () => {
      const unsafeInput: AIInput['createChatSession'] = {
        _context: {
          type: 'patient_consultation',
          patientId: 'patient-456',
          professionalId: 'prof-123',
          clinicId: 'clinic-789',
        },
        privacy: {
          phiHandling: 'raw', // Unsafe PHI handling
          auditLevel: 'minimal',
        },
      };

      mockContext.compliance.validatePhiHandling.mockResolvedValue({
        valid: false,
        error: 'Raw PHI handling not permitted',
      });

      await expect(
        caller.api.ai.createChatSession(unsafeInput),
      ).rejects.toThrow(
        'PHI handling validation failed: Raw PHI handling not permitted',
      );
    });
  });

  describe(_'AI Chat Message Contract',() => {
    it(_'should validate message sending with PHI sanitization',_async () => {
      const messageInput: AIInput['sendMessage'] = {
        sessionId: 'session-uuid-123',
        message: {
          content: 'Paciente João Silva (CPF: 123.456.789-00) relatou dor abdominal.',
          type: 'user',
          metadata: {
            patientContext: true,
            clinicalData: true,
          },
        },
        options: {
          sanitizePhiData: true,
          generateResponse: true,
          saveToHistory: true,
        },
      };

      const sanitizedContent =
        'Paciente [NOME_REDACTED] (CPF: [CPF_REDACTED]) relatou dor abdominal.';
      const mockMessage = {
        id: 'msg-uuid-456',
        sessionId: 'session-uuid-123',
        content: messageInput.message.content,
        sanitizedContent,
        type: 'user',
        metadata: messageInput.message.metadata,
        createdAt: new Date(),
      };

      const mockAIResponse = {
        id: 'msg-uuid-789',
        sessionId: 'session-uuid-123',
        content: 'Compreendo. Baseado nos sintomas relatados, sugiro avaliar...',
        type: 'assistant',
        confidence: 0.92,
        createdAt: new Date(),
      };

      mockContext.ai.sanitizePhiData.mockResolvedValue({
        sanitized: sanitizedContent,
        redactedFields: ['name', 'cpf'],
      });
      mockContext.ai.validatePromptSafety.mockResolvedValue({ safe: true });
      mockContext.ai.generateResponse.mockResolvedValue({
        content: mockAIResponse.content,
        confidence: 0.92,
        tokens: 156,
      });
      mockContext.prisma.aiChatMessage.create
        .mockResolvedValueOnce(mockMessage)
        .mockResolvedValueOnce(mockAIResponse);

      const result = await caller.api.ai.sendMessage(messageInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          userMessage: expect.objectContaining({
            id: 'msg-uuid-456',
            sanitizedContent,
            type: 'user',
          }),
          aiResponse: expect.objectContaining({
            id: 'msg-uuid-789',
            content: 'Compreendo. Baseado nos sintomas relatados, sugiro avaliar...',
            type: 'assistant',
            confidence: 0.92,
          }),
        }),
      });

      // Verify PHI sanitization
      expect(mockContext.ai.sanitizePhiData).toHaveBeenCalledWith(
        messageInput.message.content,
      );

      // Verify safety validation
      expect(mockContext.ai.validatePromptSafety).toHaveBeenCalledWith(
        sanitizedContent,
      );
    });

    it(_'should reject unsafe message content',_async () => {
      const unsafeInput: AIInput['sendMessage'] = {
        sessionId: 'session-uuid-123',
        message: {
          content: 'Como posso hackear o sistema da clínica?',
          type: 'user',
        },
      };

      mockContext.ai.validatePromptSafety.mockResolvedValue({
        safe: false,
        reason: 'Malicious intent detected',
      });

      await expect(caller.api.ai.sendMessage(unsafeInput)).rejects.toThrow(
        'Message content rejected: Malicious intent detected',
      );
    });
  });

  describe(_'AI No-Show Prediction Contract',() => {
    it(_'should validate no-show prediction generation',_async () => {
      const predictionInput: AIInput['predictNoShow'] = {
        appointmentId: 'appt-789',
        factors: {
          patientHistory: {
            totalAppointments: 12,
            completedAppointments: 10,
            cancelledAppointments: 1,
            noShowCount: 1,
            averageAdvanceBooking: 7,
          },
          appointmentDetails: {
            type: 'consultation',
            scheduledDate: '2024-02-15T14:00:00Z',
            dayOfWeek: 'thursday',
            timeOfDay: 'afternoon',
            advanceBookingDays: 14,
          },
          externalFactors: {
            weather: 'rainy',
            season: 'summer',
            isHoliday: false,
            publicTransportStatus: 'normal',
          },
        },
      };

      const mockPrediction = {
        id: 'prediction-uuid-456',
        appointmentId: 'appt-789',
        probability: 0.23,
        riskLevel: 'low',
        confidence: 0.87,
        factors: {
          positive: ['good_history', 'advance_booking'],
          negative: ['rainy_weather'],
          weights: {
            patient_history: 0.6,
            appointment_timing: 0.25,
            external_factors: 0.15,
          },
        },
        recommendations: [
          {
            action: 'send_reminder',
            timing: '24h_before',
            priority: 'medium',
          },
        ],
        createdAt: new Date(),
      };

      mockContext.ai.predictNoShow.mockResolvedValue({
        probability: 0.23,
        riskLevel: 'low',
        confidence: 0.87,
        factors: mockPrediction.factors,
        recommendations: mockPrediction.recommendations,
      });
      mockContext.prisma.aiNoShowPrediction.create.mockResolvedValue(
        mockPrediction,
      );

      const result = await caller.api.ai.predictNoShow(predictionInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          predictionId: 'prediction-uuid-456',
          probability: 0.23,
          riskLevel: 'low',
          confidence: 0.87,
          factors: expect.objectContaining({
            positive: expect.arrayContaining(['good_history']),
            negative: expect.arrayContaining(['rainy_weather']),
          }),
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              action: 'send_reminder',
              timing: '24h_before',
            }),
          ]),
        }),
      });

      // Verify AI prediction was called with correct factors
      expect(mockContext.ai.predictNoShow).toHaveBeenCalledWith(
        expect.objectContaining({
          patientHistory: predictionInput.factors.patientHistory,
          appointmentDetails: predictionInput.factors.appointmentDetails,
        }),
      );
    });

    it(_'should handle insufficient data for prediction',_async () => {
      const insufficientInput: AIInput['predictNoShow'] = {
        appointmentId: 'appt-new-patient',
        factors: {
          patientHistory: {
            totalAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            noShowCount: 0,
          },
          appointmentDetails: {
            type: 'consultation',
            scheduledDate: '2024-02-15T14:00:00Z',
          },
        },
      };

      mockContext.ai.predictNoShow.mockResolvedValue({
        probability: null,
        confidence: 0.3,
        error: 'Insufficient historical data',
      });

      const result = await caller.api.ai.predictNoShow(insufficientInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          probability: null,
          confidence: 0.3,
          message: 'Insufficient data for reliable prediction',
        }),
      });
    });
  });

  describe(_'AI Insights Generation Contract',() => {
    it(_'should validate clinic insights generation',_async () => {
      const insightsInput: AIInput['generateInsights'] = {
        clinicId: 'clinic-789',
        scope: 'clinic_performance',
        period: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        metrics: [
          'appointment_patterns',
          'patient_satisfaction',
          'revenue_trends',
          'operational_efficiency',
        ],
        configuration: {
          depth: 'detailed',
          includeRecommendations: true,
          language: 'pt-BR',
        },
      };

      const mockInsights = {
        id: 'insights-uuid-789',
        clinicId: 'clinic-789',
        scope: 'clinic_performance',
        period: insightsInput.period,
        insights: {
          appointmentPatterns: {
            peakHours: ['14:00-16:00', '09:00-11:00'],
            busyDays: ['tuesday', 'thursday'],
            seasonalTrends: {
              summer: 'high_demand',
              winter: 'moderate_demand',
            },
          },
          patientSatisfaction: {
            averageRating: 4.7,
            improvementAreas: ['waiting_time', 'appointment_scheduling'],
            strongPoints: ['treatment_quality', 'staff_friendliness'],
          },
          revenueTrends: {
            monthlyGrowth: 12.5,
            topServices: ['botox', 'laser_therapy', 'facial_treatments'],
            paymentPreferences: ['credit_card', 'pix', 'installments'],
          },
          operationalEfficiency: {
            appointmentUtilization: 0.87,
            averageWaitTime: 8.5,
            resourceOptimization: 'good',
          },
        },
        recommendations: [
          {
            category: 'scheduling_optimization',
            priority: 'high',
            description: 'Adicionar mais horários nos períodos de pico',
            impact: 'increase_capacity_by_20_percent',
            effort: 'medium',
          },
          {
            category: 'patient_experience',
            priority: 'medium',
            description: 'Implementar sistema de notificação de atrasos',
            impact: 'improve_satisfaction_score',
            effort: 'low',
          },
        ],
        confidence: 0.91,
        generatedAt: new Date(),
      };

      mockContext.ai.generateInsights.mockResolvedValue({
        insights: mockInsights.insights,
        recommendations: mockInsights.recommendations,
        confidence: 0.91,
      });

      const result = await caller.api.ai.generateInsights(insightsInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          insights: expect.objectContaining({
            appointmentPatterns: expect.objectContaining({
              peakHours: expect.arrayContaining(['14:00-16:00']),
              busyDays: expect.arrayContaining(['tuesday']),
            }),
            patientSatisfaction: expect.objectContaining({
              averageRating: 4.7,
              improvementAreas: expect.arrayContaining(['waiting_time']),
            }),
            revenueTrends: expect.objectContaining({
              monthlyGrowth: 12.5,
              topServices: expect.arrayContaining(['botox']),
            }),
          }),
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              category: 'scheduling_optimization',
              priority: 'high',
              impact: 'increase_capacity_by_20_percent',
            }),
          ]),
          confidence: 0.91,
        }),
      });
    });

    it(_'should validate patient-specific insights',_async () => {
      const patientInsightsInput: AIInput['generateInsights'] = {
        scope: 'patient_analysis',
        patientId: 'patient-456',
        metrics: [
          'treatment_history',
          'appointment_behavior',
          'satisfaction_trends',
          'health_outcomes',
        ],
        configuration: {
          depth: 'comprehensive',
          includeRecommendations: true,
          privacyLevel: 'high',
        },
      };

      const mockPatientInsights = {
        treatmentHistory: {
          totalTreatments: 15,
          treatmentTypes: ['botox', 'facial_treatment', 'laser_therapy'],
          progressTracking: 'positive',
          compliance: 0.94,
        },
        appointmentBehavior: {
          punctuality: 'excellent',
          noShowRate: 0.05,
          reschedulingFrequency: 'low',
          preferredTimes: ['morning', 'early_afternoon'],
        },
        satisfactionTrends: {
          overallSatisfaction: 4.8,
          treatmentSatisfaction: 4.9,
          serviceSatisfaction: 4.7,
          trends: 'improving',
        },
        healthOutcomes: {
          objectiveImprovement: 'significant',
          subjectiveImprovement: 'very_satisfied',
          sideEffects: 'minimal',
        },
      };

      mockContext.compliance.validatePhiHandling.mockResolvedValue({
        valid: true,
        privacyCompliant: true,
      });
      mockContext.ai.generateInsights.mockResolvedValue({
        insights: mockPatientInsights,
        recommendations: [],
        confidence: 0.88,
      });

      const result = await caller.api.ai.generateInsights(patientInsightsInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          insights: expect.objectContaining({
            treatmentHistory: expect.objectContaining({
              totalTreatments: 15,
              progressTracking: 'positive',
            }),
            appointmentBehavior: expect.objectContaining({
              punctuality: 'excellent',
              noShowRate: 0.05,
            }),
          }),
        }),
      });
    });
  });

  describe(_'AI Chat History Contract',() => {
    it(_'should validate chat history retrieval with filters',_async () => {
      const historyInput: AIInput['getChatHistory'] = {
        sessionId: 'session-uuid-123',
        filters: {
          messageType: 'assistant',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31',
          },
          includeMetadata: true,
        },
        pagination: {
          page: 1,
          limit: 20,
        },
      };

      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-uuid-123',
          content: 'Como posso ajudar com o agendamento?',
          type: 'assistant',
          confidence: 0.95,
          metadata: { topic: 'scheduling' },
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
        {
          id: 'msg-2',
          sessionId: 'session-uuid-123',
          content: 'Baseado no histórico, recomendo...',
          type: 'assistant',
          confidence: 0.89,
          metadata: { topic: 'recommendation' },
          createdAt: new Date('2024-01-15T10:05:00Z'),
        },
      ];

      mockContext.prisma.aiChatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await caller.api.ai.getChatHistory(historyInput);

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              id: 'msg-1',
              type: 'assistant',
              confidence: 0.95,
              metadata: expect.objectContaining({
                topic: 'scheduling',
              }),
            }),
          ]),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
          }),
        }),
      });
    });
  });

  describe(_'Contract Type Safety',() => {
    it(_'should enforce AI input type constraints',() => {
      const validChatInput: AIInput['sendMessage'] = {
        sessionId: 'session-123',
        message: {
          content: 'Olá, como posso agendar uma consulta?',
          type: 'user',
        },
        options: {
          sanitizePhiData: true,
          generateResponse: true,
        },
      };

      const validPredictionInput: AIInput['predictNoShow'] = {
        appointmentId: 'appt-456',
        factors: {
          patientHistory: {
            totalAppointments: 5,
            completedAppointments: 4,
            cancelledAppointments: 1,
            noShowCount: 0,
          },
          appointmentDetails: {
            type: 'consultation',
            scheduledDate: '2024-02-15T14:00:00Z',
          },
        },
      };

      expect(validChatInput).toBeDefined();
      expect(validPredictionInput).toBeDefined();
    });

    it(_'should enforce AI output type constraints',() => {
      const mockChatOutput: AIOutput['sendMessage'] = {
        success: true,
        data: {
          userMessage: {
            id: 'msg-user-123',
            content: 'Mensagem do usuário',
            type: 'user',
            createdAt: new Date(),
          },
          aiResponse: {
            id: 'msg-ai-456',
            content: 'Resposta da IA',
            type: 'assistant',
            confidence: 0.92,
            createdAt: new Date(),
          },
        },
      };

      const mockPredictionOutput: AIOutput['predictNoShow'] = {
        success: true,
        data: {
          predictionId: 'pred-789',
          probability: 0.15,
          riskLevel: 'low',
          confidence: 0.88,
          factors: {
            positive: ['good_history'],
            negative: ['weather'],
          },
          recommendations: [],
        },
      };

      expect(mockChatOutput).toBeDefined();
      expect(mockChatOutput.success).toBe(true);
      expect(mockPredictionOutput).toBeDefined();
      expect(mockPredictionOutput.data.probability).toBe(0.15);
    });
  });
});
