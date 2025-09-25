import { IAIProvider } from '../providers/base-provider';
import { logger } from '@neonpro/shared';

/**
 * Clinical decision support and AI-powered medical assistance
 */
export class ClinicalAIService {
  constructor(private readonly provider: IAIProvider) {}

  /**
   * Generate medical pre-assessment based on symptoms
   */
  async generatePreAssessment(
    symptoms: string[],
    patientContext?: PatientContext
  ): Promise<MedicalAssessment> {
    const prompt = this.buildPreAssessmentPrompt(symptoms, patientContext);
    
    try {
      const response = await this.provider.generateCompletion(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
        systemPrompt: `You are a clinical AI assistant providing pre-assessment guidance. 
        Provide accurate information while emphasizing this is not a substitute for professional medical care. 
        Always include clear disclaimers and recommendations to consult healthcare professionals.`
      });

      return this.parseAssessmentResponse(response.text);
    } catch (error) {
      logger.error('Error generating pre-assessment', { symptoms, patientContext, error });
      throw new Error('Failed to generate medical pre-assessment');
    }
  }

  /**
   * Analyze treatment recommendations
   */
  async analyzeTreatmentOptions(
    condition: string,
    patientHistory: PatientHistory
  ): Promise<TreatmentAnalysis> {
    const prompt = this.buildTreatmentAnalysisPrompt(condition, patientHistory);
    
    try {
      const response = await this.provider.generateCompletion(prompt, {
        temperature: 0.2,
        maxTokens: 1500,
        systemPrompt: `You are analyzing treatment options for medical conditions. 
        Provide evidence-based information about conventional and alternative treatments, 
        including efficacy, risks, and considerations. Always defer to medical professionals.`
      });

      return this.parseTreatmentAnalysis(response.text);
    } catch (error) {
      logger.error('Error analyzing treatment options', { 
        condition, 
        patientHistory, 
        error 
      });
      throw new Error('Failed to analyze treatment options');
    }
  }

  /**
   * Generate patient education content
   */
  async generatePatientEducation(
    topic: string,
    readingLevel: 'basic' | 'intermediate' | 'advanced' = 'intermediate',
    language: string = 'pt-BR'
  ): Promise<PatientEducation> {
    const prompt = this.buildPatientEducationPrompt(topic, readingLevel, language);
    
    try {
      const response = await this.provider.generateCompletion(prompt, {
        temperature: 0.4,
        maxTokens: 2000,
        systemPrompt: `You are creating patient education materials. 
        Write clear, accurate, and empathetic content that patients can understand. 
        Use simple language, include key points, and always recommend consulting healthcare providers.`
      });

      return {
        topic,
        content: response.text,
        readingLevel,
        language,
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Error generating patient education', { 
        topic, 
        readingLevel, 
        language, 
        error 
      });
      throw new Error('Failed to generate patient education');
    }
  }

  /**
   * Suggest follow-up care recommendations
   */
  async suggestFollowUpCare(
    treatment: string,
    patientCondition: string,
    lastVisit: Date
  ): Promise<FollowUpRecommendations> {
    const prompt = this.buildFollowUpPrompt(treatment, patientCondition, lastVisit);
    
    try {
      const response = await this.provider.generateCompletion(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
        systemPrompt: `You are suggesting follow-up care recommendations. 
        Provide general guidelines for timing, monitoring, and when to seek additional care. 
        Always emphasize individual variation and the importance of following healthcare provider instructions.`
      });

      return this.parseFollowUpRecommendations(response.text);
    } catch (error) {
      logger.error('Error suggesting follow-up care', { 
        treatment, 
        patientCondition, 
        lastVisit, 
        error 
      });
      throw new Error('Failed to suggest follow-up care');
    }
  }

  /**
   * Risk assessment for procedures
   */
  async assessProcedureRisk(
    procedure: string,
    patientProfile: PatientProfile
  ): Promise<RiskAssessment> {
    const prompt = this.buildRiskAssessmentPrompt(procedure, patientProfile);
    
    try {
      const response = await this.provider.generateCompletion(prompt, {
        temperature: 0.2,
        maxTokens: 1200,
        systemPrompt: `You are assessing risks for medical procedures. 
        Provide general information about potential risks, contraindications, and considerations. 
        Always emphasize that individual risk assessment must be performed by qualified healthcare providers.`
      });

      return this.parseRiskAssessment(response.text);
    } catch (error) {
      logger.error('Error assessing procedure risk', { 
        procedure, 
        patientProfile, 
        error 
      });
      throw new Error('Failed to assess procedure risk');
    }
  }

  private buildPreAssessmentPrompt(
    symptoms: string[], 
    patientContext?: PatientContext
  ): string {
    const contextSection = patientContext ? `
Patient Context:
- Age: ${patientContext.age}
- Gender: ${patientContext.gender}
- Relevant Medical History: ${patientContext.medicalHistory?.join(', ') || 'None reported'}
- Current Medications: ${patientContext.currentMedications?.join(', ') || 'None reported'}
- Known Allergies: ${patientContext.allergies?.join(', ') || 'None reported'}
` : '';

    return `Please provide a pre-assessment for the following symptoms:

Symptoms: ${symptoms.join(', ')}
${contextSection}

Please provide:
1. Possible explanations for these symptoms
2. General guidance on severity levels
3. Recommendations for next steps
4. Clear disclaimers about seeking professional medical care

Remember: This is AI-generated information and not medical advice.`;
  }

  private buildTreatmentAnalysisPrompt(
    condition: string, 
    patientHistory: PatientHistory
  ): string {
    return `Please analyze treatment options for: ${condition}

Patient History:
- Age: ${patientHistory.age}
- Gender: ${patientHistory.gender}
- Relevant Conditions: ${patientHistory.conditions?.join(', ') || 'None reported'}
- Current Medications: ${patientHistory.currentMedications?.join(', ') || 'None reported'}
- Known Allergies: ${patientHistory.allergies?.join(', ') || 'None reported'}
- Previous Treatments: ${patientHistory.previousTreatments?.join(', ') || 'None reported'}

Please provide analysis of:
1. Conventional treatment approaches
2. Alternative/complementary options (if applicable)
3. General efficacy information
4. Common considerations and precautions
5. Importance of professional medical guidance`;
  }

  private buildPatientEducationPrompt(
    topic: string, 
    readingLevel: string, 
    language: string
  ): string {
    return `Create patient education content about: ${topic}

Requirements:
- Reading Level: ${readingLevel}
- Language: ${language}
- Include key points and takeaways
- Use clear, simple language
- Include when to seek medical attention
- Add disclaimers about consulting healthcare providers`;
  }

  private buildFollowUpPrompt(
    treatment: string, 
    patientCondition: string, 
    lastVisit: Date
  ): string {
    const daysSinceVisit = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    return `Suggest follow-up care recommendations for:

Treatment: ${treatment}
Condition: ${patientCondition}
Last Visit: ${daysSinceVisit} days ago

Please provide general guidance on:
1. Typical follow-up timing
2. Signs that warrant earlier follow-up
3. Monitoring recommendations
4. When to seek immediate care
5. Lifestyle considerations`;
  }

  private buildRiskAssessmentPrompt(
    procedure: string, 
    patientProfile: PatientProfile
  ): string {
    return `Assess general risks for the procedure: ${procedure}

Patient Profile:
- Age: ${patientProfile.age}
- Gender: ${patientProfile.gender}
- BMI: ${patientProfile.bmi || 'Not provided'}
- Relevant Conditions: ${patientProfile.conditions?.join(', ') || 'None reported'}
- Current Medications: ${patientProfile.currentMedications?.join(', ') || 'None reported'}

Please provide general information about:
1. Common risks and complications
2. Contraindications
3. Pre-procedure considerations
4. Post-procedure monitoring
5. When to seek medical attention`;
  }

  private parseAssessmentResponse(text: string): MedicalAssessment {
    // Simple parsing - in production, this would be more sophisticated
    return {
      possibleExplanations: this.extractSection(text, 'possible explanations') || [],
      severityGuidance: this.extractSection(text, 'severity') || 'Information not available',
      recommendations: this.extractSection(text, 'recommendations') || [],
      disclaimers: this.extractSection(text, 'disclaimers') || ['Always consult healthcare professionals'],
      generatedAt: new Date(),
    };
  }

  private parseTreatmentAnalysis(text: string): TreatmentAnalysis {
    return {
      conventionalTreatments: this.extractSection(text, 'conventional') || [],
      alternativeOptions: this.extractSection(text, 'alternative') || [],
      efficacy: this.extractSection(text, 'efficacy') || 'Information not available',
      considerations: this.extractSection(text, 'considerations') || [],
      generatedAt: new Date(),
    };
  }

  private parseFollowUpRecommendations(text: string): FollowUpRecommendations {
    return {
      typicalTiming: this.extractSection(text, 'timing') || 'Information not available',
      warningSigns: this.extractSection(text, 'warning') || [],
      monitoring: this.extractSection(text, 'monitoring') || [],
      lifestyle: this.extractSection(text, 'lifestyle') || [],
      generatedAt: new Date(),
    };
  }

  private parseRiskAssessment(text: string): RiskAssessment {
    return {
      commonRisks: this.extractSection(text, 'risks') || [],
      contraindications: this.extractSection(text, 'contraindications') || [],
      preProcedure: this.extractSection(text, 'pre') || [],
      postProcedure: this.extractSection(text, 'post') || [],
      generatedAt: new Date(),
    };
  }

  private extractSection(text: string, keyword: string): string[] | string {
    // Simple section extraction - would be more sophisticated in production
    const lowerText = text.toLowerCase();
    const keywordIndex = lowerText.indexOf(keyword);
    
    if (keywordIndex === -1) return keyword === 'guidance' || keyword === 'efficacy' ? 'Information not available' : [];
    
    // Find the start of the section
    const startIndex = text.lastIndexOf('\n', keywordIndex) + 1;
    
    // Find the end of the section (next numbered item or major section)
    let endIndex = text.length;
    const nextSectionMatch = text.slice(startIndex + 50).match(/\n\d+\.|\n[A-Z][a-zA-Z\s]+:/);
    if (nextSectionMatch) {
      endIndex = startIndex + 50 + nextSectionMatch.index!;
    }
    
    const sectionText = text.slice(startIndex, endIndex).trim();
    
    if (keyword === 'guidance' || keyword === 'efficacy') {
      return sectionText.replace(/^[^:]+:\s*/, '').trim();
    }
    
    // Extract bullet points or numbered items
    const items = sectionText
      .split(/\n\s*[-*•]\s*|\n\s*\d+\.\s*/)
      .filter(item => item.trim().length > 0)
      .map(item => item.replace(/^[-*•]\s*|\d+\.\s*/, '').trim());
    
    return items.length > 0 ? items : [sectionText];
  }
}

// Type definitions
interface PatientContext {
  age: number;
  gender: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
}

interface PatientHistory {
  age: number;
  gender: string;
  conditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  previousTreatments?: string[];
}

interface PatientProfile {
  age: number;
  gender: string;
  bmi?: number;
  conditions?: string[];
  currentMedications?: string[];
}

interface MedicalAssessment {
  possibleExplanations: string[];
  severityGuidance: string;
  recommendations: string[];
  disclaimers: string[];
  generatedAt: Date;
}

interface TreatmentAnalysis {
  conventionalTreatments: string[];
  alternativeOptions: string[];
  efficacy: string;
  considerations: string[];
  generatedAt: Date;
}

interface PatientEducation {
  topic: string;
  content: string;
  readingLevel: string;
  language: string;
  generatedAt: Date;
}

interface FollowUpRecommendations {
  typicalTiming: string;
  warningSigns: string[];
  monitoring: string[];
  lifestyle: string[];
  generatedAt: Date;
}

interface RiskAssessment {
  commonRisks: string[];
  contraindications: string[];
  preProcedure: string[];
  postProcedure: string[];
  generatedAt: Date;
}