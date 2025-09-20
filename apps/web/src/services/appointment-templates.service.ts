// Temporary stub to unblock type-check; TODO: replace with generated-typed implementation
import type {
  AppointmentTemplate,
  AppointmentTemplateFilters,
  CreateAppointmentTemplateData,
  UpdateAppointmentTemplateData,
} from '@/types/appointment-templates';

class AppointmentTemplatesServiceStub {
  async getAppointmentTemplates(
    _filters?: AppointmentTemplateFilters,
  ): Promise<AppointmentTemplate[]> {
    return [];
  }

  async getAppointmentTemplate(
    _templateId: string,
  ): Promise<AppointmentTemplate | null> {
    return null;
  }

  async createAppointmentTemplate(
    _templateData: CreateAppointmentTemplateData,
    _clinicId: string,
    _userId: string,
  ): Promise<AppointmentTemplate> {
    throw new Error(
      'appointmentTemplatesService.createAppointmentTemplate not implemented',
    );
  }

  async updateAppointmentTemplate(
    _templateId: string,
    _updateData: UpdateAppointmentTemplateData,
    _userId: string,
  ): Promise<AppointmentTemplate> {
    throw new Error(
      'appointmentTemplatesService.updateAppointmentTemplate not implemented',
    );
  }

  async deleteAppointmentTemplate(_templateId: string): Promise<void> {
    // no-op
    return;
  }

  async getTemplatesByCategory(
    _category: string,
    _clinicId?: string,
  ): Promise<AppointmentTemplate[]> {
    return [];
  }

  async getDefaultTemplates(
    _clinicId?: string,
  ): Promise<AppointmentTemplate[]> {
    return [];
  }
}

export const appointmentTemplatesService = new AppointmentTemplatesServiceStub();
