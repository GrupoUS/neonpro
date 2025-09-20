/**
 * Real Component Accessibility Testing Suite
 * Tests actual components used in the healthcare platform
 * Performance optimized for large-scale testing
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Real component imports
import { AccessiblePatientCard } from "@/components/accessibility/AccessiblePatientCard";
import { EnhancedHealthcareForm } from "@/components/accessibility/EnhancedHealthcareForm";
import { PatientRegistrationWizard } from "@/components/patients/PatientRegistrationWizard";
import { ConsentDialog } from "@/components/telemedicine/ConsentDialog";
import { EmergencyEscalation } from "@/components/telemedicine/EmergencyEscalation";
import { SessionConsent } from "@/components/telemedicine/SessionConsent";
import { VideoConsultation } from "@/components/telemedicine/VideoConsultation";
import { WaitingRoom } from "@/components/telemedicine/WaitingRoom";

// Import healthcare configuration
import {
  healthcareAxeConfig,
  healthcareTestContexts,
  runOptimizedAccessibilityTest,
} from "./axe-integration.test";

expect.extend(toHaveNoViolations);

// Test data factory
const createMockSessionData = () => ({
  sessionId: "test-session-123",
  patient: {
    id: "patient-1",
    name: "João Silva Santos",
    cpf: "123.456.789-00",
    birthDate: "1985-03-15",
    email: "joao.silva@email.com",
    phone: "(11) 99999-8888",
  },
  physician: {
    id: "physician-1",
    name: "Dr. Maria Santos",
    crm: "12345-SP",
    specialty: "Cardiologia",
  },
  emergency: {
    protocol: "2024.001234/SP-12",
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      address: "Av. Paulista, 1000, São Paulo - SP",
    },
  },
});

describe("Real Component Accessibility Tests", () => {
  let mockSessionData: ReturnType<typeof createMockSessionData>;

  beforeEach(() => {
    mockSessionData = createMockSessionData();

    // Configure test environment
    process.env.NODE_ENV = "test";
    process.env.HEALTHCARE_MODE = "true";
    process.env.ACCESSIBILITY_LEVEL = "WCAG2AA";

    // Mock hooks with realistic data
    vi.mock("@/hooks/use-telemedicine", () => ({
      useTelemedicineSession: () => ({
        session: {
          id: mockSessionData.sessionId,
          patient: mockSessionData.patient,
          physician: mockSessionData.physician,
          status: "active",
          startedAt: new Date().toISOString(),
        },
      }),
      useVideoCall: () => ({
        isConnected: true,
        isVideoEnabled: true,
        isAudioEnabled: true,
        toggleVideo: vi.fn(),
        toggleAudio: vi.fn(),
        endCall: vi.fn(),
      }),
      useRealTimeChat: () => ({
        messages: [
          {
            id: "1",
            content: "Olá, como está se sentindo?",
            sender: "physician",
            timestamp: new Date().toISOString(),
          },
        ],
        sendMessage: vi.fn(),
        isConnected: true,
      }),
      useSessionRecording: () => ({
        isRecording: false,
        hasConsent: true,
        toggleRecording: vi.fn(),
        downloadRecording: vi.fn(),
      }),
      useSessionConsent: () => ({
        hasConsent: true,
        consentData: {
          recording: true,
          dataSharing: true,
          emergency: true,
        },
        giveConsent: vi.fn(),
        updateConsent: vi.fn(),
      }),
      useEmergencyEscalation: () => ({
        isEmergency: false,
        escalateEmergency: vi.fn(),
        emergencyData: mockSessionData.emergency,
      }),
    }));

    vi.mock("@/hooks/use-webrtc", () => ({
      useWebRTC: () => ({
        localStream: null,
        remoteStream: null,
        connectionState: "connected",
        networkQuality: "excellent",
      }),
    }));

    vi.mock("@/hooks/usePatients", () => ({
      useCreatePatient: () => ({
        mutate: vi.fn(),
        isLoading: false,
        error: null,
      }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Telemedicine Interface Components", () => {
    test("VideoConsultation component meets WCAG 2.1 AA+ standards for real-time medical consultations", async () => {
      const results = await runOptimizedAccessibilityTest(
        <VideoConsultation
          sessionId={mockSessionData.sessionId}
          onSessionEnd={() => {}}
        />,
        "VideoConsultation",
        "TELEMEDICINE",
      );

      expect(results).toHaveNoViolations();

      // Specific telemedicine accessibility requirements
      expect(
        results.violations.filter(
          (v) =>
            v.id === "aria-live-region" ||
            v.id === "button-name" ||
            v.id === "keyboard",
        ),
      ).toHaveLength(0);
    });

    test("EmergencyEscalation component meets critical accessibility standards for emergency situations", async () => {
      const results = await runOptimizedAccessibilityTest(
        <EmergencyEscalation
          sessionId={mockSessionData.sessionId}
          onEscalate={() => {}}
        />,
        "EmergencyEscalation",
        "EMERGENCY_INTERFACE",
      );

      expect(results).toHaveNoViolations();

      // Critical emergency accessibility requirements
      expect(
        results.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious",
        ),
      ).toHaveLength(0);
    });

    test("WaitingRoom component provides accessible waiting experience", async () => {
      const results = await runOptimizedAccessibilityTest(
        <WaitingRoom
          sessionId={mockSessionData.sessionId}
          estimatedWaitTime={300}
          position={3}
        />,
        "WaitingRoom",
        "PATIENT_PORTAL",
      );

      expect(results).toHaveNoViolations();
    });

    test("SessionConsent component ensures accessible consent management", async () => {
      const results = await runOptimizedAccessibilityTest(
        <SessionConsent
          onConsentChange={() => {}}
          initialConsent={{
            recording: false,
            dataSharing: false,
            emergency: true,
          }}
        />,
        "SessionConsent",
        "PATIENT_PORTAL",
      );

      expect(results).toHaveNoViolations();

      // LGPD consent accessibility requirements
      expect(
        results.violations.filter(
          (v) => v.id === "label" || v.id === "form-field-multiple-labels",
        ),
      ).toHaveLength(0);
    });

    test("ConsentDialog component meets accessibility standards for modal interactions", async () => {
      const results = await runOptimizedAccessibilityTest(
        <ConsentDialog
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          consentType="recording"
        />,
        "ConsentDialog",
        "PATIENT_PORTAL",
      );

      expect(results).toHaveNoViolations();

      // Modal accessibility requirements
      expect(
        results.violations.filter(
          (v) => v.id === "focus-order-semantics" || v.id === "aria-modal",
        ),
      ).toHaveLength(0);
    });
  });

  describe("Patient Management Components", () => {
    test("PatientRegistrationWizard meets healthcare form accessibility standards", async () => {
      const results = await runOptimizedAccessibilityTest(
        <PatientRegistrationWizard onComplete={() => {}} onCancel={() => {}} />,
        "PatientRegistrationWizard",
        "MEDICAL_PROFESSIONAL",
      );

      expect(results).toHaveNoViolations();

      // Healthcare form accessibility requirements
      expect(
        results.violations.filter(
          (v) =>
            v.id === "label" ||
            v.id === "required-attr" ||
            v.id === "aria-describedby",
        ),
      ).toHaveLength(0);
    });

    test("AccessiblePatientCard provides inclusive patient information display", async () => {
      const results = await runOptimizedAccessibilityTest(
        <AccessiblePatientCard
          patient={mockSessionData.patient}
          showSensitiveData={false}
          onEdit={() => {}}
        />,
        "AccessiblePatientCard",
        "MEDICAL_PROFESSIONAL",
      );

      expect(results).toHaveNoViolations();
    });

    test("EnhancedHealthcareForm meets advanced form accessibility requirements", async () => {
      const results = await runOptimizedAccessibilityTest(
        <EnhancedHealthcareForm
          onSubmit={() => {}}
          patientId={mockSessionData.patient.id}
        />,
        "EnhancedHealthcareForm",
        "MEDICAL_PROFESSIONAL",
      );

      expect(results).toHaveNoViolations();

      // Advanced form accessibility requirements
      expect(
        results.violations.filter(
          (v) =>
            v.id === "aria-valid-attr-value" ||
            v.id === "aria-required-children",
        ),
      ).toHaveLength(0);
    });
  });

  describe("Performance and Error Handling", () => {
    test("components maintain accessibility during loading states", async () => {
      // Mock loading state
      vi.mocked(vi.fn()).mockImplementation(() => ({
        isLoading: true,
        data: null,
        error: null,
      }));

      const LoadingComponent = () => (
        <div role="status" aria-live="polite" aria-busy="true">
          <p>Carregando consulta médica...</p>
          <div aria-hidden="true">Loading animation</div>
        </div>
      );

      const results = await runOptimizedAccessibilityTest(
        <LoadingComponent />,
        "LoadingState",
        "PATIENT_PORTAL",
      );

      expect(results).toHaveNoViolations();
    });

    test("components handle error states accessibly", async () => {
      const ErrorComponent = () => (
        <div role="alert" aria-live="assertive">
          <h2>Erro na Consulta</h2>
          <p>Não foi possível conectar com o médico. Tente novamente.</p>
          <button type="button" aria-describedby="retry-help">
            Tentar Novamente
          </button>
          <div id="retry-help">
            Clique para tentar conectar novamente com o médico
          </div>
        </div>
      );

      const results = await runOptimizedAccessibilityTest(
        <ErrorComponent />,
        "ErrorState",
        "TELEMEDICINE",
      );

      expect(results).toHaveNoViolations();
    });
  });

  describe("Mobile Healthcare Accessibility", () => {
    test("components maintain accessibility on mobile viewports", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 667,
      });

      const results = await runOptimizedAccessibilityTest(
        <VideoConsultation
          sessionId={mockSessionData.sessionId}
          onSessionEnd={() => {}}
        />,
        "VideoConsultation_Mobile",
        "TELEMEDICINE",
      );

      expect(results).toHaveNoViolations();

      // Mobile-specific accessibility requirements
      expect(
        results.violations.filter(
          (v) => v.id === "touch-target-size" || v.id === "mobile-viewport",
        ),
      ).toHaveLength(0);
    });
  });
});
