/**
 * Emergency Interface Accessibility Test Runner
 * Comprehensive WCAG 2.1 AAA+ testing for emergency healthcare components
 */

import type { AccessibilityTestResult } from "./emergency-accessibility";
import {
  emergencyAccessibility,
  testEmergencyComponentAccessibility,
} from "./emergency-accessibility";

export interface EmergencyAccessibilityTestSuite {
  suiteName: string;
  components: {
    name: string;
    createElement: () => HTMLElement;
    expectedLevel: "A" | "AA" | "AAA";
  }[];
}

export class EmergencyAccessibilityTestRunner {
  private testContainer: HTMLElement | null = null;

  /**
   * Initialize test environment
   */
  private initializeTestEnvironment(): void {
    if (this.testContainer) {
      document.body.removeChild(this.testContainer);
    }

    this.testContainer = document.createElement("div");
    this.testContainer.id = "a11y-test-container";
    this.testContainer.style.cssText = `
      position: absolute;
      top: -10000px;
      left: -10000px;
      width: 1000px;
      height: 800px;
      visibility: hidden;
    `;
    document.body.append(this.testContainer);
  }

  /**
   * Clean up test environment
   */
  private cleanupTestEnvironment(): void {
    if (this.testContainer && document.body.contains(this.testContainer)) {
      document.body.removeChild(this.testContainer);
      this.testContainer = null;
    }
  }

  /**
   * Create mock emergency patient data for testing
   */
  private createMockEmergencyData() {
    return {
      patient: {
        id: "test-patient-001",
        name: "João Silva",
        age: 45,
        bloodType: "O+",
        allergies: ["Penicillin", "Sulfonamides", "Latex"],
        criticalConditions: ["Diabetes Type 2", "Hypertension"],
        emergencyContacts: [
          { name: "Maria Silva", phone: "+5511999999999", relation: "Spouse" },
          {
            name: "Dr. Carlos Santos",
            phone: "+5511888888888",
            relation: "Cardiologist",
          },
        ],
        currentStatus: "life-threatening" as const,
        medications: [
          { name: "Metformin", dosage: "850mg", frequency: "Twice daily" },
          { name: "Losartan", dosage: "50mg", frequency: "Once daily" },
        ],
        cfmNumber: "CFM-123456",
        lgpdConsent: true,
      },
      allergies: [
        {
          allergen: "Penicillin",
          severity: "life-threatening" as const,
          reaction: "Anaphylaxis",
          lastOccurrence: "2023-03-15",
          crossReactivities: ["Amoxicillin", "Ampicillin"],
          treatment: "EpiPen, immediate hospitalization",
          notes: "Patient carries EpiPen at all times",
        },
        {
          allergen: "Latex",
          severity: "severe" as const,
          reaction: "Contact dermatitis, respiratory symptoms",
          lastOccurrence: "2023-08-22",
          crossReactivities: ["Banana", "Avocado", "Kiwi"],
          treatment: "Antihistamines, corticosteroids",
          notes: "Avoid latex gloves during procedures",
        },
      ],
    };
  }

  /**
   * Create EmergencyPatientCard test element
   */
  private createEmergencyPatientCardElement(): HTMLElement {
    const mockData = this.createMockEmergencyData();
    const container = document.createElement("div");
    container.className = "emergency-patient-card-test";

    // Simulate the EmergencyPatientCard component structure
    container.innerHTML = `
      <div 
        class="emergency-patient-card bg-white dark:bg-gray-900 border-2 border-red-500 rounded-lg p-4 shadow-lg"
        role="region"
        aria-label="Emergency Patient Information: ${mockData.patient.name}"
        data-emergency="true"
        data-emergency-level="life-threatening"
        tabindex="0"
      >
        <div class="emergency-header flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-red-600" role="heading" aria-level="2">
            🚨 EMERGENCY PATIENT
          </h2>
          <div 
            class="status-indicator bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse"
            role="status"
            aria-live="assertive"
            aria-label="Patient status: life-threatening emergency"
          >
            LIFE-THREATENING
          </div>
        </div>

        <div class="patient-info grid grid-cols-2 gap-4 mb-4">
          <div class="info-field">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient Name
            </label>
            <div 
              class="text-lg font-semibold"
              aria-label="Patient name: ${mockData.patient.name}"
            >
              ${mockData.patient.name}
            </div>
          </div>
          
          <div class="info-field">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Blood Type
            </label>
            <div 
              class="text-lg font-bold text-red-600"
              aria-label="Blood type: ${mockData.patient.bloodType}"
            >
              ${mockData.patient.bloodType}
            </div>
          </div>
        </div>

        <div class="critical-allergies mb-4" role="alert" aria-live="assertive">
          <h3 class="text-md font-bold text-red-600 mb-2" role="heading" aria-level="3">
            ⚠️ CRITICAL ALLERGIES
          </h3>
          <div class="allergies-list">
            ${
      mockData.patient.allergies
        .map(
          (allergy, index) => `
              <div 
                class="allergy-item bg-red-100 dark:bg-red-900 border border-red-300 rounded p-2 mb-2"
                role="listitem"
                aria-label="Life-threatening allergy: ${allergy}"
                data-allergy-severity="life-threatening"
              >
                <span class="font-bold text-red-800 dark:text-red-200">${allergy}</span>
                <span class="text-sm text-red-600 dark:text-red-300 ml-2">LIFE-THREATENING</span>
              </div>
            `,
        )
        .join("")
    }
          </div>
        </div>

        <div class="emergency-actions flex gap-3 mt-4">
          <button
            type="button"
            class="samu-call-btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-300 transition-colors"
            aria-label="Call SAMU Emergency Services at 192"
            data-emergency-contact="true"
          >
            📞 CALL SAMU 192
          </button>
          
          <button
            type="button"
            class="emergency-contact-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
            aria-label="Call emergency contact: ${mockData.patient.emergencyContacts[0].name}"
            data-emergency-contact="true"
          >
            📱 CALL EMERGENCY CONTACT
          </button>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Create CriticalAllergiesPanel test element
   */
  private createCriticalAllergiesPanelElement(): HTMLElement {
    const mockData = this.createMockEmergencyData();
    const container = document.createElement("div");
    container.className = "critical-allergies-panel-test";

    container.innerHTML = `
      <div 
        class="critical-allergies-panel bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg p-4"
        role="region"
        aria-label="Critical Allergies Information"
        data-emergency="true"
      >
        <header class="panel-header flex items-center justify-between mb-4">
          <h2 
            class="text-xl font-bold text-red-600 dark:text-red-400"
            role="heading"
            aria-level="2"
          >
            ⚠️ CRITICAL ALLERGIES
          </h2>
          <div 
            class="allergy-count bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold"
            role="status"
            aria-label="${mockData.allergies.length} critical allergies on file"
          >
            ${mockData.allergies.length} CRITICAL
          </div>
        </header>

        <div class="allergies-list space-y-3" role="list">
          ${
      mockData.allergies
        .map(
          (allergy, index) => `
            <div 
              class="allergy-card border-l-4 border-red-500 bg-white dark:bg-gray-900 p-4 rounded shadow"
              role="listitem"
              tabindex="0"
              aria-label="Critical allergy: ${allergy.allergen}, severity: ${allergy.severity}"
              data-allergy-severity="${allergy.severity}"
            >
              <div class="allergy-header flex items-center justify-between mb-2">
                <h3 
                  class="text-lg font-bold text-red-800 dark:text-red-200"
                  role="heading"
                  aria-level="3"
                >
                  ${allergy.allergen}
                </h3>
                <span 
                  class="severity-badge bg-red-600 text-white px-2 py-1 rounded text-sm font-bold ${
            allergy.severity === "life-threatening" ? "animate-pulse" : ""
          }"
                  aria-label="Severity: ${allergy.severity}"
                >
                  ${allergy.severity.toUpperCase()}
                </span>
              </div>
              
              <div class="allergy-details text-sm">
                <p class="reaction mb-1">
                  <strong>Reaction:</strong> 
                  <span aria-label="Allergic reaction: ${allergy.reaction}">${allergy.reaction}</span>
                </p>
                <p class="treatment mb-1">
                  <strong>Treatment:</strong> 
                  <span aria-label="Emergency treatment: ${allergy.treatment}">${allergy.treatment}</span>
                </p>
                ${
            allergy.notes
              ? `
                  <p class="notes">
                    <strong>Notes:</strong> 
                    <span aria-label="Additional notes: ${allergy.notes}">${allergy.notes}</span>
                  </p>
                `
              : ""
          }
              </div>

              <button
                type="button"
                class="expand-details-btn mt-2 text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-expanded="false"
                aria-controls="allergy-details-${index}"
                aria-label="Show detailed information for ${allergy.allergen} allergy"
              >
                Show Details
              </button>
              
              <div 
                id="allergy-details-${index}"
                class="detailed-info mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded hidden"
                aria-hidden="true"
              >
                <p class="cross-reactivities mb-2">
                  <strong>Cross-reactivities:</strong> ${allergy.crossReactivities.join(", ")}
                </p>
                <p class="last-occurrence">
                  <strong>Last occurrence:</strong> ${allergy.lastOccurrence}
                </p>
              </div>
            </div>
          `,
        )
        .join("")
    }
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Create SAMUDialButton test element
   */
  private createSAMUDialButtonElement(): HTMLElement {
    const container = document.createElement("div");
    container.className = "samu-dial-button-test";

    container.innerHTML = `
      <div 
        class="samu-dial-button-container"
        role="region"
        aria-label="SAMU Emergency Services Contact"
        data-emergency="true"
      >
        <div class="samu-info mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-300 rounded-lg">
          <h2 
            class="text-lg font-bold text-red-600 dark:text-red-400 mb-2"
            role="heading"
            aria-level="2"
          >
            📞 SAMU - Emergency Medical Services
          </h2>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Brazilian Emergency Medical Service - Call 192 for immediate assistance
          </p>
        </div>

        <div class="emergency-level-selection mb-4" role="radiogroup" aria-label="Select emergency level">
          <fieldset>
            <legend class="text-md font-bold mb-2">Emergency Level:</legend>
            
            <label class="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="emergency-level" 
                value="life-threatening"
                class="mr-2 focus:ring-2 focus:ring-red-300"
                aria-describedby="life-threatening-desc"
              />
              <span class="font-bold text-red-600">Life-Threatening Emergency</span>
            </label>
            <p id="life-threatening-desc" class="text-xs text-gray-600 dark:text-gray-400 ml-6 mb-3">
              Cardiac arrest, severe bleeding, unconscious patient
            </p>

            <label class="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="emergency-level" 
                value="urgent"
                class="mr-2 focus:ring-2 focus:ring-orange-300"
                aria-describedby="urgent-desc"
              />
              <span class="font-bold text-orange-600">Urgent</span>
            </label>
            <p id="urgent-desc" class="text-xs text-gray-600 dark:text-gray-400 ml-6 mb-3">
              Severe pain, difficulty breathing, suspected fractures
            </p>

            <label class="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="emergency-level" 
                value="non-urgent"
                class="mr-2 focus:ring-2 focus:ring-yellow-300"
                aria-describedby="non-urgent-desc"
              />
              <span class="font-bold text-yellow-600">Non-Urgent</span>
            </label>
            <p id="non-urgent-desc" class="text-xs text-gray-600 dark:text-gray-400 ml-6 mb-3">
              Minor injuries, routine medical transport
            </p>
          </fieldset>
        </div>

        <div class="location-info mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-300 rounded">
          <h3 
            class="text-md font-bold text-blue-600 dark:text-blue-400 mb-2"
            role="heading"
            aria-level="3"
          >
            📍 Current Location
          </h3>
          <p 
            class="text-sm"
            aria-label="Current location: Clinica NeonPro, Av. Paulista 1000, São Paulo - SP"
          >
            Clinica NeonPro<br/>
            Av. Paulista, 1000<br/>
            São Paulo - SP, CEP 01310-100
          </p>
          <button
            type="button"
            class="mt-2 text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Share precise GPS location with SAMU"
          >
            📍 Share GPS Location
          </button>
        </div>

        <div class="call-actions">
          <button
            type="button"
            class="primary-call-btn w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg mb-3 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all text-lg"
            aria-label="Call SAMU Emergency Services at 192 immediately"
            data-emergency-contact="true"
          >
            🚨 CALL SAMU 192 NOW
          </button>
          
          <button
            type="button"
            class="secondary-call-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            aria-label="Call clinic emergency line for coordination"
            data-emergency-contact="true"
          >
            📞 Call Clinic Emergency Line
          </button>
        </div>

        <div class="call-status mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded hidden" role="status" aria-live="polite">
          <p class="text-sm">
            <span class="font-bold">Status:</span> Ready to call SAMU
          </p>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Run complete accessibility test suite
   */
  async runEmergencyAccessibilityTests(): Promise<{
    overallResult: boolean;
    testResults: AccessibilityTestResult[];
    summary: string;
  }> {
    console.log(
      "🧪 Starting Emergency Interface Accessibility Tests (WCAG 2.1 AAA+)",
    );

    this.initializeTestEnvironment();

    const testSuite: EmergencyAccessibilityTestSuite = {
      suiteName: "Emergency Interface WCAG 2.1 AAA+ Test Suite",
      components: [
        {
          name: "EmergencyPatientCard",
          createElement: () => this.createEmergencyPatientCardElement(),
          expectedLevel: "AAA",
        },
        {
          name: "CriticalAllergiesPanel",
          createElement: () => this.createCriticalAllergiesPanelElement(),
          expectedLevel: "AAA",
        },
        {
          name: "SAMUDialButton",
          createElement: () => this.createSAMUDialButtonElement(),
          expectedLevel: "AAA",
        },
      ],
    };

    const testResults: AccessibilityTestResult[] = [];
    let overallResult = true;

    for (const component of testSuite.components) {
      console.log(`\n🔍 Testing ${component.name}...`);

      if (!this.testContainer) {
        continue;
      }

      const element = component.createElement();
      this.testContainer.append(element);

      try {
        const result = await testEmergencyComponentAccessibility(
          component.name,
          element,
        );
        testResults.push(result);

        const passed = result.passed && result.level === component.expectedLevel;
        if (!passed) {
          overallResult = false;
        }

        console.log(
          `${
            passed ? "✅" : "❌"
          } ${component.name}: ${result.score}% (${result.issues.length} issues)`,
        );

        if (result.issues.length > 0) {
          console.log(`   Issues found:`);
          result.issues.forEach((issue) => {
            const icon = issue.severity === "error"
              ? "🚨"
              : issue.severity === "warning"
              ? "⚠️"
              : "ℹ️";
            console.log(`   ${icon} ${issue.rule}: ${issue.description}`);
          });
        }
      } catch (error) {
        console.error(`❌ Error testing ${component.name}:`, error);
        overallResult = false;
      }

      this.testContainer.removeChild(element);
    }

    this.cleanupTestEnvironment();

    const passedTests = testResults.filter((r) => r.passed).length;
    const totalTests = testResults.length;
    const averageScore = testResults.length > 0
      ? testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length
      : 0;

    const summary =
      `Emergency Interface Accessibility Test Results: ${passedTests}/${totalTests} components passed | Average score: ${
        averageScore.toFixed(1)
      }% | Overall: ${overallResult ? "PASSED" : "FAILED"}`;

    console.log(`\n📊 ${summary}`);

    return {
      overallResult,
      testResults,
      summary,
    };
  }
}

// Export test runner instance
export const emergencyAccessibilityTestRunner = new EmergencyAccessibilityTestRunner();
