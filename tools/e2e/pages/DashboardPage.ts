/**
 * Dashboard Page Object Model
 * Handles dashboard page interactions and validations
 */

import type { Locator, Page, } from '@playwright/test'
import { BasePage, } from './BasePage'

export class DashboardPage extends BasePage {
  // Main navigation locators
  private readonly header: Locator
  private readonly sidebar: Locator
  private readonly mainContent: Locator
  private readonly userMenu: Locator
  private readonly logoutButton: Locator
  private readonly profileButton: Locator
  private readonly settingsButton: Locator
  private readonly notificationsButton: Locator
  private readonly searchInput: Locator

  // Dashboard widgets/cards
  private readonly welcomeCard: Locator
  private readonly statsCards: Locator
  private readonly recentPatientsCard: Locator
  private readonly appointmentsCard: Locator
  private readonly quickActionsCard: Locator
  private readonly analyticsCard: Locator

  // Navigation menu items
  private readonly patientsMenuItem: Locator
  private readonly appointmentsMenuItem: Locator
  private readonly reportsMenuItem: Locator
  private readonly settingsMenuItem: Locator
  private readonly billingMenuItem: Locator

  // Quick action buttons
  private readonly addPatientButton: Locator
  private readonly scheduleAppointmentButton: Locator
  private readonly generateReportButton: Locator
  private readonly viewCalendarButton: Locator

  // Loading and error states
  private readonly loadingSpinner: Locator
  private readonly errorMessage: Locator
  private readonly emptyState: Locator

  constructor(page: Page,) {
    super(page,)

    // Initialize main layout locators
    this.header = page.locator(
      '[data-testid="dashboard-header"], .dashboard-header, header',
    )
    this.sidebar = page.locator(
      '[data-testid="dashboard-sidebar"], .dashboard-sidebar, .sidebar',
    )
    this.mainContent = page.locator(
      '[data-testid="dashboard-content"], .dashboard-content, main',
    )
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu',)
    this.logoutButton = page.locator(
      '[data-testid="logout-button"], .logout-button',
    )
    this.profileButton = page.locator(
      '[data-testid="profile-button"], .profile-button',
    )
    this.settingsButton = page.locator(
      '[data-testid="settings-button"], .settings-button',
    )
    this.notificationsButton = page.locator(
      '[data-testid="notifications-button"], .notifications-button',
    )
    this.searchInput = page.locator(
      '[data-testid="search-input"], .search-input, input[placeholder*="Search"]',
    )

    // Initialize dashboard widgets
    this.welcomeCard = page.locator(
      '[data-testid="welcome-card"], .welcome-card',
    )
    this.statsCards = page.locator('[data-testid="stats-card"], .stats-card',)
    this.recentPatientsCard = page.locator(
      '[data-testid="recent-patients-card"], .recent-patients-card',
    )
    this.appointmentsCard = page.locator(
      '[data-testid="appointments-card"], .appointments-card',
    )
    this.quickActionsCard = page.locator(
      '[data-testid="quick-actions-card"], .quick-actions-card',
    )
    this.analyticsCard = page.locator(
      '[data-testid="analytics-card"], .analytics-card',
    )

    // Initialize navigation menu items
    this.patientsMenuItem = page.locator(
      '[data-testid="patients-menu"], a[href*="patients"]',
    )
    this.appointmentsMenuItem = page.locator(
      '[data-testid="appointments-menu"], a[href*="appointments"]',
    )
    this.reportsMenuItem = page.locator(
      '[data-testid="reports-menu"], a[href*="reports"]',
    )
    this.settingsMenuItem = page.locator(
      '[data-testid="settings-menu"], a[href*="settings"]',
    )
    this.billingMenuItem = page.locator(
      '[data-testid="billing-menu"], a[href*="billing"]',
    )

    // Initialize quick action buttons
    this.addPatientButton = page.locator(
      '[data-testid="add-patient-button"], .add-patient-button',
    )
    this.scheduleAppointmentButton = page.locator(
      '[data-testid="schedule-appointment-button"], .schedule-appointment-button',
    )
    this.generateReportButton = page.locator(
      '[data-testid="generate-report-button"], .generate-report-button',
    )
    this.viewCalendarButton = page.locator(
      '[data-testid="view-calendar-button"], .view-calendar-button',
    )

    // Initialize state locators
    this.loadingSpinner = page.locator(
      '[data-testid="loading"], .loading, .spinner',
    )
    this.errorMessage = page.locator(
      '[data-testid="error-message"], .error-message',
    )
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state',)
  }

  // Navigation methods
  async navigateToDashboard() {
    await this.goto('/dashboard',)
    await this.waitForPageLoad()
  }

  async navigateToPatients() {
    await this.clickElement(this.patientsMenuItem,)
    await this.waitForUrl(/\/patients/,)
  }

  async navigateToAppointments() {
    await this.clickElement(this.appointmentsMenuItem,)
    await this.waitForUrl(/\/appointments/,)
  }

  async navigateToReports() {
    await this.clickElement(this.reportsMenuItem,)
    await this.waitForUrl(/\/reports/,)
  }

  async navigateToSettings() {
    await this.clickElement(this.settingsMenuItem,)
    await this.waitForUrl(/\/settings/,)
  }

  async navigateToBilling() {
    await this.clickElement(this.billingMenuItem,)
    await this.waitForUrl(/\/billing/,)
  }

  // User menu interactions
  async openUserMenu() {
    await this.clickElement(this.userMenu,)
    await this.waitForElementToBeVisible(this.logoutButton,)
  }

  async logout() {
    await this.openUserMenu()
    await this.clickElement(this.logoutButton,)
    await this.waitForUrl(/\/login/,)
  }

  async goToProfile() {
    await this.openUserMenu()
    await this.clickElement(this.profileButton,)
    await this.waitForUrl(/\/profile/,)
  }

  async goToUserSettings() {
    await this.openUserMenu()
    await this.clickElement(this.settingsButton,)
    await this.waitForUrl(/\/settings/,)
  }

  // Quick actions
  async addNewPatient() {
    await this.clickElement(this.addPatientButton,)
    await this.waitForUrl(/\/patients\/new/,)
  }

  async scheduleNewAppointment() {
    await this.clickElement(this.scheduleAppointmentButton,)
    await this.waitForUrl(/\/appointments\/new/,)
  }

  async generateNewReport() {
    await this.clickElement(this.generateReportButton,)
    await this.waitForUrl(/\/reports\/new/,)
  }

  async viewCalendar() {
    await this.clickElement(this.viewCalendarButton,)
    await this.waitForUrl(/\/calendar/,)
  }

  // Search functionality
  async searchFor(query: string,) {
    await this.fillInput(this.searchInput, query,)
    await this.pressKey('Enter',)
    await this.waitForLoadingToFinish()
  }

  async clearSearch() {
    await this.fillInput(this.searchInput, '',)
  }

  // Dashboard data methods
  async getWelcomeMessage(): Promise<string> {
    await this.waitForElementToBeVisible(this.welcomeCard,)
    return await this.getElementText(this.welcomeCard,)
  }

  async getStatsCardCount(): Promise<number> {
    await this.waitForElementToBeVisible(this.statsCards.first(),)
    return await this.statsCards.count()
  }

  async getStatsCardValue(index: number,): Promise<string> {
    const card = this.statsCards.nth(index,)
    await this.waitForElementToBeVisible(card,)
    return await this.getElementText(card,)
  }

  async getRecentPatientsCount(): Promise<number> {
    const patientItems = this.recentPatientsCard.locator(
      '.patient-item, [data-testid="patient-item"]',
    )
    return await patientItems.count()
  }

  async getUpcomingAppointmentsCount(): Promise<number> {
    const appointmentItems = this.appointmentsCard.locator(
      '.appointment-item, [data-testid="appointment-item"]',
    )
    return await appointmentItems.count()
  }

  // Validation methods
  async expectDashboardToBeLoaded() {
    await this.expectElementToBeVisible(this.header,)
    await this.expectElementToBeVisible(this.sidebar,)
    await this.expectElementToBeVisible(this.mainContent,)
  }

  async expectWelcomeCardToBeVisible() {
    await this.expectElementToBeVisible(this.welcomeCard,)
  }

  async expectStatsCardsToBeVisible(expectedCount = 4,) {
    await this.expectElementToBeVisible(this.statsCards.first(),)
    const actualCount = await this.getStatsCardCount()
    if (actualCount !== expectedCount) {
      throw new Error(
        `Expected ${expectedCount} stats cards, but found ${actualCount}`,
      )
    }
  }

  async expectQuickActionsToBeVisible() {
    await this.expectElementToBeVisible(this.quickActionsCard,)
    await this.expectElementToBeVisible(this.addPatientButton,)
    await this.expectElementToBeVisible(this.scheduleAppointmentButton,)
  }

  async expectNavigationMenuToBeVisible() {
    await this.expectElementToBeVisible(this.sidebar,)
    await this.expectElementToBeVisible(this.patientsMenuItem,)
    await this.expectElementToBeVisible(this.appointmentsMenuItem,)
    await this.expectElementToBeVisible(this.reportsMenuItem,)
  }

  async expectUserMenuToBeVisible() {
    await this.expectElementToBeVisible(this.userMenu,)
  }

  async expectSearchToBeVisible() {
    await this.expectElementToBeVisible(this.searchInput,)
  }

  async expectNoErrorMessages() {
    const isErrorVisible = await this.isElementVisible(this.errorMessage,)
    if (isErrorVisible) {
      const errorText = await this.getElementText(this.errorMessage,)
      throw new Error(`Unexpected error message found: ${errorText}`,)
    }
  }

  async expectLoadingToFinish() {
    await this.waitForLoadingToFinish()
    const isLoadingVisible = await this.isElementVisible(this.loadingSpinner,)
    if (isLoadingVisible) {
      throw new Error('Loading spinner is still visible after timeout',)
    }
  }

  // Responsive design checks
  async expectMobileLayoutToBeVisible() {
    // Check if sidebar is collapsed or hidden on mobile
    const sidebarVisible = await this.isElementVisible(this.sidebar,)
    const mobileMenuButton = this.page.locator(
      '[data-testid="mobile-menu-button"], .mobile-menu-button',
    )

    if (!sidebarVisible) {
      await this.expectElementToBeVisible(mobileMenuButton,)
    }
  }

  async expectDesktopLayoutToBeVisible() {
    await this.expectElementToBeVisible(this.sidebar,)
    await this.expectElementToBeVisible(this.header,)
  }

  // Accessibility checks
  async expectKeyboardNavigationToWork() {
    await this.patientsMenuItem.focus()
    await this.pressKey('Tab',)
    await this.pressKey('Tab',)
    await this.pressKey('Enter',)
  }

  async expectAriaLabelsToBePresent() {
    const menuItems = [
      this.patientsMenuItem,
      this.appointmentsMenuItem,
      this.reportsMenuItem,
    ]

    for (const item of menuItems) {
      const ariaLabel = await item.getAttribute('aria-label',)
      if (!ariaLabel) {
        throw new Error(
          `Menu item missing aria-label: ${await item.textContent()}`,
        )
      }
    }
  }

  // Performance checks
  async expectFastLoadTime(maxLoadTimeMs = 3000,) {
    const startTime = Date.now()
    await this.waitForPageLoad()
    const loadTime = Date.now() - startTime

    if (loadTime > maxLoadTimeMs) {
      throw new Error(
        `Dashboard loaded too slowly: ${loadTime}ms (max: ${maxLoadTimeMs}ms)`,
      )
    }
  }

  // Data refresh methods
  async refreshDashboard() {
    await this.page.reload()
    await this.waitForPageLoad()
  }

  async waitForDataToLoad() {
    await this.waitForLoadingToFinish()
    await this.waitForElementToBeVisible(this.welcomeCard,)
    await this.waitForElementToBeVisible(this.statsCards.first(),)
  }

  // Implementation of abstract methods
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElementToBeVisible(this.header,)
      await this.waitForElementToBeVisible(this.sidebar,)
      await this.waitForElementToBeVisible(this.mainContent,)
      await this.waitForLoadingToFinish()
      return true
    } catch {
      return false
    }
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title()
  }

  // Utility methods for testing
  async takeScreenshotOfDashboard(name = 'dashboard',) {
    await this.page.screenshot({
      path: `tools/e2e/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    },)
  }

  async getPageMetrics() {
    return {
      statsCardsCount: await this.getStatsCardCount(),
      recentPatientsCount: await this.getRecentPatientsCount(),
      upcomingAppointmentsCount: await this.getUpcomingAppointmentsCount(),
      welcomeMessage: await this.getWelcomeMessage(),
    }
  }

  // Test data helpers
  static getExpectedDashboardElements() {
    return {
      minStatsCards: 3,
      maxStatsCards: 6,
      requiredQuickActions: ['Add Patient', 'Schedule Appointment',],
      requiredMenuItems: ['Patients', 'Appointments', 'Reports',],
    }
  }
}
