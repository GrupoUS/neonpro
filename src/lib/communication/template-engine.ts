/**
 * Template Engine - Mock implementation for testing
 * Story 2.3: Automated Communication System
 */

export class TemplateEngine {
  constructor() {
    // Mock implementation
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    // Mock implementation for testing
    return `Template ${templateId} rendered with variables: ${JSON.stringify(variables)}`
  }

  async getTemplate(templateId: string): Promise<{
    id: string;
    content: string;
    variables: string[];
  } | null> {
    // Mock implementation
    return {
      id: templateId,
      content: 'Mock template content',
      variables: ['patientName', 'appointmentTime']
    }
  }
}