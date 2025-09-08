import type { Locator, Page, } from '@playwright/test'
import { expect, } from '@playwright/test'
import { BasePage, } from './BasePage'

/**
 * Page Object Model para a página de agendamentos
 * Gerencia interações com consultas, horários e calendário
 */
export class AppointmentsPage extends BasePage {
  // Locators principais
  private readonly pageHeader: Locator
  private readonly calendarView: Locator
  private readonly appointmentsList: Locator
  private readonly searchInput: Locator
  private readonly filterDropdown: Locator
  private readonly dateRangePicker: Locator

  // Botões de ação
  private readonly newAppointmentBtn: Locator
  private readonly exportBtn: Locator
  private readonly refreshBtn: Locator
  private readonly viewToggleBtn: Locator

  // Calendário
  private readonly calendarGrid: Locator
  private readonly timeSlots: Locator
  private readonly appointmentCards: Locator
  private readonly dayView: Locator
  private readonly weekView: Locator
  private readonly monthView: Locator

  // Modal de agendamento
  private readonly appointmentModal: Locator
  private readonly patientSelect: Locator
  private readonly doctorSelect: Locator
  private readonly dateInput: Locator
  private readonly timeInput: Locator
  private readonly durationSelect: Locator
  private readonly notesTextarea: Locator
  private readonly saveBtn: Locator
  private readonly cancelBtn: Locator

  // Estados e mensagens
  private readonly loadingSpinner: Locator
  private readonly emptyState: Locator
  private readonly errorMessage: Locator
  private readonly successMessage: Locator

  constructor(page: Page,) {
    super(page,)

    // Inicializar locators
    this.pageHeader = page.locator('[data-testid="appointments-header"]',)
    this.calendarView = page.locator('[data-testid="calendar-view"]',)
    this.appointmentsList = page.locator('[data-testid="appointments-list"]',)
    this.searchInput = page.locator('[data-testid="appointments-search"]',)
    this.filterDropdown = page.locator('[data-testid="appointments-filter"]',)
    this.dateRangePicker = page.locator('[data-testid="date-range-picker"]',)

    // Botões
    this.newAppointmentBtn = page.locator(
      '[data-testid="new-appointment-btn"]',
    )
    this.exportBtn = page.locator('[data-testid="export-appointments-btn"]',)
    this.refreshBtn = page.locator('[data-testid="refresh-appointments-btn"]',)
    this.viewToggleBtn = page.locator('[data-testid="view-toggle-btn"]',)

    // Calendário
    this.calendarGrid = page.locator('[data-testid="calendar-grid"]',)
    this.timeSlots = page.locator('[data-testid="time-slots"]',)
    this.appointmentCards = page.locator('[data-testid="appointment-card"]',)
    this.dayView = page.locator('[data-testid="day-view"]',)
    this.weekView = page.locator('[data-testid="week-view"]',)
    this.monthView = page.locator('[data-testid="month-view"]',)

    // Modal
    this.appointmentModal = page.locator('[data-testid="appointment-modal"]',)
    this.patientSelect = page.locator('[data-testid="patient-select"]',)
    this.doctorSelect = page.locator('[data-testid="doctor-select"]',)
    this.dateInput = page.locator('[data-testid="appointment-date"]',)
    this.timeInput = page.locator('[data-testid="appointment-time"]',)
    this.durationSelect = page.locator('[data-testid="appointment-duration"]',)
    this.notesTextarea = page.locator('[data-testid="appointment-notes"]',)
    this.saveBtn = page.locator('[data-testid="save-appointment-btn"]',)
    this.cancelBtn = page.locator('[data-testid="cancel-appointment-btn"]',)

    // Estados
    this.loadingSpinner = page.locator('[data-testid="appointments-loading"]',)
    this.emptyState = page.locator('[data-testid="appointments-empty"]',)
    this.errorMessage = page.locator('[data-testid="appointments-error"]',)
    this.successMessage = page.locator('[data-testid="appointments-success"]',)
  }

  // Implementação dos métodos abstratos
  async isLoaded(): Promise<boolean> {
    try {
      await this.pageHeader.waitFor({ state: 'visible', timeout: 5000, },)
      await this.calendarView.waitFor({ state: 'visible', timeout: 5000, },)
      return true
    } catch {
      return false
    }
  }

  async getPageTitle(): Promise<string> {
    return (await this.pageHeader.textContent()) || ''
  }

  // Navegação
  async navigateToAppointments(): Promise<void> {
    await this.page.goto('/appointments',)
    await this.waitForPageLoad()
  }

  // Busca e filtros
  async searchAppointments(query: string,): Promise<void> {
    await this.searchInput.fill(query,)
    await this.searchInput.press('Enter',)
    await this.waitForLoadingToComplete()
  }

  async filterByStatus(status: string,): Promise<void> {
    await this.filterDropdown.click()
    await this.page.locator(`[data-value="${status}"]`,).click()
    await this.waitForLoadingToComplete()
  }

  async filterByDateRange(startDate: string, endDate: string,): Promise<void> {
    await this.dateRangePicker.click()
    await this.page.locator('[data-testid="start-date"]',).fill(startDate,)
    await this.page.locator('[data-testid="end-date"]',).fill(endDate,)
    await this.page.locator('[data-testid="apply-date-filter"]',).click()
    await this.waitForLoadingToComplete()
  }

  // Visualizações do calendário
  async switchToCalendarView(): Promise<void> {
    await this.viewToggleBtn.click()
    await this.page.locator('[data-testid="calendar-view-option"]',).click()
    await this.calendarView.waitFor({ state: 'visible', },)
  }

  async switchToListView(): Promise<void> {
    await this.viewToggleBtn.click()
    await this.page.locator('[data-testid="list-view-option"]',).click()
    await this.appointmentsList.waitFor({ state: 'visible', },)
  }

  async switchToDayView(): Promise<void> {
    await this.page.locator('[data-testid="day-view-btn"]',).click()
    await this.dayView.waitFor({ state: 'visible', },)
  }

  async switchToWeekView(): Promise<void> {
    await this.page.locator('[data-testid="week-view-btn"]',).click()
    await this.weekView.waitFor({ state: 'visible', },)
  }

  async switchToMonthView(): Promise<void> {
    await this.page.locator('[data-testid="month-view-btn"]',).click()
    await this.monthView.waitFor({ state: 'visible', },)
  }

  // Criação de agendamentos
  async openNewAppointmentModal(): Promise<void> {
    await this.newAppointmentBtn.click()
    await this.appointmentModal.waitFor({ state: 'visible', },)
  }

  async createAppointment(appointmentData: {
    patientId: string
    doctorId: string
    date: string
    time: string
    duration: string
    notes?: string
  },): Promise<void> {
    await this.openNewAppointmentModal()

    // Preencher formulário
    await this.patientSelect.click()
    await this.page
      .locator(`[data-value="${appointmentData.patientId}"]`,)
      .click()

    await this.doctorSelect.click()
    await this.page
      .locator(`[data-value="${appointmentData.doctorId}"]`,)
      .click()

    await this.dateInput.fill(appointmentData.date,)
    await this.timeInput.fill(appointmentData.time,)

    await this.durationSelect.click()
    await this.page
      .locator(`[data-value="${appointmentData.duration}"]`,)
      .click()

    if (appointmentData.notes) {
      await this.notesTextarea.fill(appointmentData.notes,)
    }

    await this.saveBtn.click()
    await this.waitForSuccessMessage()
  }

  // Interações com agendamentos
  async clickAppointment(appointmentId: string,): Promise<void> {
    await this.page.locator(`[data-appointment-id="${appointmentId}"]`,).click()
  }

  async editAppointment(
    appointmentId: string,
    updates: Record<string, string>,
  ): Promise<void> {
    await this.clickAppointment(appointmentId,)
    await this.page.locator('[data-testid="edit-appointment-btn"]',).click()

    // Aplicar atualizações
    for (const [field, value,] of Object.entries(updates,)) {
      const input = this.page.locator(`[data-testid="${field}"]`,)
      await input.clear()
      await input.fill(value,)
    }

    await this.saveBtn.click()
    await this.waitForSuccessMessage()
  }

  async cancelAppointment(
    appointmentId: string,
    reason: string,
  ): Promise<void> {
    await this.clickAppointment(appointmentId,)
    await this.page.locator('[data-testid="cancel-appointment-btn"]',).click()
    await this.page.locator('[data-testid="cancellation-reason"]',).fill(reason,)
    await this.page.locator('[data-testid="confirm-cancel-btn"]',).click()
    await this.waitForSuccessMessage()
  }

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
  ): Promise<void> {
    await this.clickAppointment(appointmentId,)
    await this.page
      .locator('[data-testid="reschedule-appointment-btn"]',)
      .click()
    await this.dateInput.fill(newDate,)
    await this.timeInput.fill(newTime,)
    await this.saveBtn.click()
    await this.waitForSuccessMessage()
  }

  // Validações
  async getAppointmentCount(): Promise<number> {
    await this.waitForLoadingToComplete()
    return await this.appointmentCards.count()
  }

  async getAppointmentDetails(
    appointmentId: string,
  ): Promise<Record<string, string>> {
    const appointmentCard = this.page.locator(
      `[data-appointment-id="${appointmentId}"]`,
    )

    return {
      patient: (await appointmentCard
        .locator('[data-testid="patient-name"]',)
        .textContent()) || '',
      doctor: (await appointmentCard
        .locator('[data-testid="doctor-name"]',)
        .textContent()) || '',
      date: (await appointmentCard
        .locator('[data-testid="appointment-date"]',)
        .textContent()) || '',
      time: (await appointmentCard
        .locator('[data-testid="appointment-time"]',)
        .textContent()) || '',
      status: (await appointmentCard
        .locator('[data-testid="appointment-status"]',)
        .textContent()) || '',
    }
  }

  async hasAppointmentConflict(): Promise<boolean> {
    return await this.page
      .locator('[data-testid="conflict-warning"]',)
      .isVisible()
  }

  // Utilitários
  async refreshAppointments(): Promise<void> {
    await this.refreshBtn.click()
    await this.waitForLoadingToComplete()
  }

  async exportAppointments(): Promise<void> {
    await this.exportBtn.click()
    // Aguardar download ou confirmação
    await this.page.waitForTimeout(2000,)
  }

  private async waitForLoadingToComplete(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10_000, },)
  }

  private async waitForSuccessMessage(): Promise<void> {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000, },)
  }

  // Métodos de teste estáticos
  static getTestAppointmentData() {
    return {
      patientId: 'patient-123',
      doctorId: 'doctor-456',
      date: '2024-02-15',
      time: '14:30',
      duration: '30',
      notes: 'Consulta de rotina',
    }
  }

  static getConflictingAppointmentData() {
    return {
      patientId: 'patient-789',
      doctorId: 'doctor-456', // Mesmo médico
      date: '2024-02-15', // Mesma data
      time: '14:30', // Mesmo horário
      duration: '30',
    }
  }
}
