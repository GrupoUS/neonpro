/**
 * Template Engine - Dynamic message template rendering
 * Story 2.3: Automated Communication System
 */

import { MessageTemplate, TemplateVariables } from './types';

export interface RenderedTemplate {
  content: string;
  subject?: string;
  variables_used: string[];
  missing_variables: string[];
}

export class TemplateEngine {
  /**
   * Render a template with provided variables
   */
  async render(
    template: MessageTemplate,
    variables: TemplateVariables
  ): Promise<RenderedTemplate> {
    try {
      const variablesUsed: string[] = [];
      const missingVariables: string[] = [];
      
      // Render content
      const renderedContent = this.renderString(
        template.content,
        variables,
        variablesUsed,
        missingVariables
      );
      
      // Render subject if exists (for email)
      let renderedSubject: string | undefined;
      if (template.subject) {
        renderedSubject = this.renderString(
          template.subject,
          variables,
          variablesUsed,
          missingVariables
        );
      }
      
      return {
        content: renderedContent,
        subject: renderedSubject,
        variables_used: [...new Set(variablesUsed)],
        missing_variables: [...new Set(missingVariables)]
      };
    } catch (error) {
      console.error('Template rendering error:', error);
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

  /**
   * Validate template syntax
   */
  validateTemplate(template: MessageTemplate): {
    valid: boolean;
    errors: string[];
    variables_found: string[];
  } {
    const errors: string[] = [];
    const variablesFound: string[] = [];
    
    try {
      // Check for basic template structure
      if (!template.content || template.content.trim().length === 0) {
        errors.push('Template content cannot be empty');
      }
      
      // Extract variables from content
      const contentVariables = this.extractVariables(template.content);
      variablesFound.push(...contentVariables);
      
      // Extract variables from subject if exists
      if (template.subject) {
        const subjectVariables = this.extractVariables(template.subject);
        variablesFound.push(...subjectVariables);
      }
      
      // Check for unclosed variable tags
      const openTags = (template.content.match(/\{\{/g) || []).length;
      const closeTags = (template.content.match(/\}\}/g) || []).length;
      
      if (openTags !== closeTags) {
        errors.push('Mismatched variable tags - check {{ and }} pairs');
      }
      
      // Check for nested variables (not supported)
      const nestedPattern = /\{\{[^}]*\{\{/g;
      if (nestedPattern.test(template.content)) {
        errors.push('Nested variables are not supported');
      }
      
      // Validate against declared variables
      const declaredVariables = template.variables || [];
      const undeclaredVariables = variablesFound.filter(
        v => !declaredVariables.includes(v)
      );
      
      if (undeclaredVariables.length > 0) {
        errors.push(
          `Undeclared variables found: ${undeclaredVariables.join(', ')}`
        );
      }
      
      return {
        valid: errors.length === 0,
        errors,
        variables_found: [...new Set(variablesFound)]
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Template validation failed: ${error.message}`],
        variables_found: variablesFound
      };
    }
  }

  /**
   * Create a preview of the template with sample data
   */
  createPreview(template: MessageTemplate): {
    content: string;
    subject?: string;
    sample_variables: TemplateVariables;
  } {
    const sampleVariables: TemplateVariables = {
      patient_name: 'João Silva',
      patient_first_name: 'João',
      clinic_name: 'Clínica NeonPro',
      appointment_date: '15/03/2024',
      appointment_time: '14:30',
      professional_name: 'Dr. Maria Santos',
      service_name: 'Consulta Médica',
      clinic_phone: '(11) 99999-9999',
      clinic_address: 'Rua das Flores, 123 - São Paulo/SP',
      confirmation_link: 'https://app.neonpro.com/confirm/123',
      reschedule_link: 'https://app.neonpro.com/reschedule/123',
      cancel_link: 'https://app.neonpro.com/cancel/123',
      custom_message: 'Lembre-se de trazer seus documentos.'
    };
    
    try {
      const rendered = this.renderString(template.content, sampleVariables);
      const renderedSubject = template.subject 
        ? this.renderString(template.subject, sampleVariables)
        : undefined;
      
      return {
        content: rendered,
        subject: renderedSubject,
        sample_variables: sampleVariables
      };
    } catch (error) {
      return {
        content: `Error rendering preview: ${error.message}`,
        subject: template.subject,
        sample_variables: sampleVariables
      };
    }
  }

  /**
   * Get available template variables with descriptions
   */
  getAvailableVariables(): Array<{
    name: string;
    description: string;
    example: string;
    required: boolean;
  }> {
    return [
      {
        name: 'patient_name',
        description: 'Nome completo do paciente',
        example: 'João Silva',
        required: true
      },
      {
        name: 'patient_first_name',
        description: 'Primeiro nome do paciente',
        example: 'João',
        required: false
      },
      {
        name: 'clinic_name',
        description: 'Nome da clínica',
        example: 'Clínica NeonPro',
        required: true
      },
      {
        name: 'appointment_date',
        description: 'Data do agendamento',
        example: '15/03/2024',
        required: true
      },
      {
        name: 'appointment_time',
        description: 'Horário do agendamento',
        example: '14:30',
        required: true
      },
      {
        name: 'professional_name',
        description: 'Nome do profissional',
        example: 'Dr. Maria Santos',
        required: true
      },
      {
        name: 'service_name',
        description: 'Nome do serviço',
        example: 'Consulta Médica',
        required: true
      },
      {
        name: 'clinic_phone',
        description: 'Telefone da clínica',
        example: '(11) 99999-9999',
        required: false
      },
      {
        name: 'clinic_address',
        description: 'Endereço da clínica',
        example: 'Rua das Flores, 123 - São Paulo/SP',
        required: false
      },
      {
        name: 'confirmation_link',
        description: 'Link para confirmação',
        example: 'https://app.neonpro.com/confirm/123',
        required: false
      },
      {
        name: 'reschedule_link',
        description: 'Link para reagendamento',
        example: 'https://app.neonpro.com/reschedule/123',
        required: false
      },
      {
        name: 'cancel_link',
        description: 'Link para cancelamento',
        example: 'https://app.neonpro.com/cancel/123',
        required: false
      },
      {
        name: 'custom_message',
        description: 'Mensagem personalizada',
        example: 'Lembre-se de trazer seus documentos.',
        required: false
      }
    ];
  }

  /**
   * Create default templates for different message types
   */
  getDefaultTemplates(): Record<string, Partial<MessageTemplate>> {
    return {
      sms_reminder: {
        name: 'Lembrete SMS Padrão',
        channel: 'sms',
        type: 'reminder',
        content: 'Olá {{patient_first_name}}! Lembrete: você tem consulta marcada para {{appointment_date}} às {{appointment_time}} com {{professional_name}} na {{clinic_name}}. Para confirmar: {{confirmation_link}}',
        variables: ['patient_first_name', 'appointment_date', 'appointment_time', 'professional_name', 'clinic_name', 'confirmation_link']
      },
      email_reminder: {
        name: 'Lembrete Email Padrão',
        channel: 'email',
        type: 'reminder',
        subject: 'Lembrete: Consulta agendada para {{appointment_date}}',
        content: `
          <h2>Lembrete de Consulta</h2>
          <p>Olá {{patient_name}},</p>
          <p>Este é um lembrete de que você tem uma consulta agendada:</p>
          <ul>
            <li><strong>Data:</strong> {{appointment_date}}</li>
            <li><strong>Horário:</strong> {{appointment_time}}</li>
            <li><strong>Profissional:</strong> {{professional_name}}</li>
            <li><strong>Serviço:</strong> {{service_name}}</li>
            <li><strong>Local:</strong> {{clinic_name}}</li>
          </ul>
          <p><a href="{{confirmation_link}}">Confirmar Presença</a> | <a href="{{reschedule_link}}">Reagendar</a> | <a href="{{cancel_link}}">Cancelar</a></p>
          <p>Em caso de dúvidas, entre em contato: {{clinic_phone}}</p>
          <p>Atenciosamente,<br>{{clinic_name}}</p>
        `,
        variables: ['patient_name', 'appointment_date', 'appointment_time', 'professional_name', 'service_name', 'clinic_name', 'confirmation_link', 'reschedule_link', 'cancel_link', 'clinic_phone']
      },
      whatsapp_reminder: {
        name: 'Lembrete WhatsApp Padrão',
        channel: 'whatsapp',
        type: 'reminder',
        content: '🏥 *{{clinic_name}}*\n\nOlá {{patient_first_name}}!\n\n📅 Lembrete da sua consulta:\n• Data: {{appointment_date}}\n• Horário: {{appointment_time}}\n• Profissional: {{professional_name}}\n• Serviço: {{service_name}}\n\n✅ Confirme sua presença: {{confirmation_link}}\n\n📞 Dúvidas? {{clinic_phone}}',
        variables: ['clinic_name', 'patient_first_name', 'appointment_date', 'appointment_time', 'professional_name', 'service_name', 'confirmation_link', 'clinic_phone']
      },
      confirmation_request: {
        name: 'Solicitação de Confirmação',
        channel: 'sms',
        type: 'confirmation',
        content: '{{clinic_name}}: Por favor, confirme sua consulta de {{appointment_date}} às {{appointment_time}}. Confirmar: {{confirmation_link}} ou responda SIM.',
        variables: ['clinic_name', 'appointment_date', 'appointment_time', 'confirmation_link']
      }
    };
  }

  // Private helper methods
  private renderString(
    template: string,
    variables: TemplateVariables,
    variablesUsed?: string[],
    missingVariables?: string[]
  ): string {
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      
      if (variablesUsed) {
        variablesUsed.push(trimmedName);
      }
      
      if (variables[trimmedName as keyof TemplateVariables] !== undefined) {
        return String(variables[trimmedName as keyof TemplateVariables]);
      } else {
        if (missingVariables) {
          missingVariables.push(trimmedName);
        }
        return match; // Keep original if variable not found
      }
    });
  }

  private extractVariables(template: string): string[] {
    const matches = template.match(/\{\{\s*([^}]+)\s*\}\}/g) || [];
    return matches.map(match => {
      const variableName = match.replace(/\{\{\s*|\s*\}\}/g, '');
      return variableName.trim();
    });
  }
}
