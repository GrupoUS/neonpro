/**
 * Patients Page Object Model
 * Handles patients page interactions and validations
 */

import type { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PatientsPage extends BasePage {
  // Page header and navigation
  private readonly pageHeader: Locator;
  private readonly breadcrumb: Locator;
  private readonly backButton: Locator;

  // Search and filters
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly clearSearchButton: Locator;
  private readonly filterButton: Locator;
  private readonly filterPanel: Locator;
  private readonly statusFilter: Locator;
  private readonly ageFilter: Locator;
  private readonly genderFilter: Locator;
  private readonly dateRangeFilter: Locator;

  // Action buttons
  private readonly addPatientButton: Locator;
  private readonly importPatientsButton: Locator;
  private readonly exportPatientsButton: Locator;
  private readonly bulkActionsButton: Locator;

  // Patients table/list
  private readonly patientsTable: Locator;
  private readonly patientsTableHeader: Locator;
  private readonly patientsTableBody: Locator;
  private readonly patientRows: Locator;
  private readonly selectAllCheckbox: Locator;
  private readonly patientCheckboxes: Locator;

  // Table columns
  private readonly nameColumn: Locator;
  private readonly emailColumn: Locator;
  private readonly phoneColumn: Locator;
  private readonly ageColumn: Locator;
  private readonly statusColumn: Locator;
  private readonly actionsColumn: Locator;

  // Pagination
  private readonly pagination: Locator;
  private readonly previousPageButton: Locator;
  private readonly nextPageButton: Locator;
  private readonly pageNumbers: Locator;
  private readonly itemsPerPageSelect: Locator;
  private readonly totalItemsCount: Locator;

  // Patient actions
  private readonly viewPatientButtons: Locator;
  private readonly editPatientButtons: Locator;
  private readonly deletePatientButtons: Locator;
  private readonly patientMenuButtons: Locator;

  // Modals and dialogs
  private readonly deleteConfirmModal: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly cancelDeleteButton: Locator;

  // Loading and empty states
  private readonly loadingSpinner: Locator;
  private readonly emptyState: Locator;
  private readonly errorMessage: Locator;
  private readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize page header locators
    this.pageHeader = page.locator(
      '[data-testid="patients-header"], .patients-header, h1',
    );
    this.breadcrumb = page.locator('[data-testid="breadcrumb"], .breadcrumb');
    this.backButton = page.locator('[data-testid="back-button"], .back-button');

    // Initialize search and filter locators
    this.searchInput = page.locator(
      '[data-testid="patients-search"], .patients-search, input[placeholder*="Search patients"]',
    );
    this.searchButton = page.locator(
      '[data-testid="search-button"], .search-button',
    );
    this.clearSearchButton = page.locator(
      '[data-testid="clear-search"], .clear-search',
    );
    this.filterButton = page.locator(
      '[data-testid="filter-button"], .filter-button',
    );
    this.filterPanel = page.locator(
      '[data-testid="filter-panel"], .filter-panel',
    );
    this.statusFilter = page.locator(
      '[data-testid="status-filter"], select[name="status"]',
    );
    this.ageFilter = page.locator(
      '[data-testid="age-filter"], select[name="age"]',
    );
    this.genderFilter = page.locator(
      '[data-testid="gender-filter"], select[name="gender"]',
    );
    this.dateRangeFilter = page.locator(
      '[data-testid="date-range-filter"], .date-range-filter',
    );

    // Initialize action button locators
    this.addPatientButton = page.locator(
      '[data-testid="add-patient-button"], .add-patient-button',
    );
    this.importPatientsButton = page.locator(
      '[data-testid="import-patients-button"], .import-patients-button',
    );
    this.exportPatientsButton = page.locator(
      '[data-testid="export-patients-button"], .export-patients-button',
    );
    this.bulkActionsButton = page.locator(
      '[data-testid="bulk-actions-button"], .bulk-actions-button',
    );

    // Initialize table locators
    this.patientsTable = page.locator(
      '[data-testid="patients-table"], .patients-table, table',
    );
    this.patientsTableHeader = page.locator(
      '[data-testid="patients-table-header"], thead',
    );
    this.patientsTableBody = page.locator(
      '[data-testid="patients-table-body"], tbody',
    );
    this.patientRows = page.locator(
      '[data-testid="patient-row"], .patient-row, tbody tr',
    );
    this.selectAllCheckbox = page.locator(
      '[data-testid="select-all-checkbox"], .select-all-checkbox',
    );
    this.patientCheckboxes = page.locator(
      '[data-testid="patient-checkbox"], .patient-checkbox',
    );

    // Initialize column locators
    this.nameColumn = page.locator('[data-testid="name-column"], .name-column');
    this.emailColumn = page.locator(
      '[data-testid="email-column"], .email-column',
    );
    this.phoneColumn = page.locator(
      '[data-testid="phone-column"], .phone-column',
    );
    this.ageColumn = page.locator('[data-testid="age-column"], .age-column');
    this.statusColumn = page.locator(
      '[data-testid="status-column"], .status-column',
    );
    this.actionsColumn = page.locator(
      '[data-testid="actions-column"], .actions-column',
    );

    // Initialize pagination locators
    this.pagination = page.locator('[data-testid="pagination"], .pagination');
    this.previousPageButton = page.locator(
      '[data-testid="previous-page"], .previous-page',
    );
    this.nextPageButton = page.locator('[data-testid="next-page"], .next-page');
    this.pageNumbers = page.locator(
      '[data-testid="page-number"], .page-number',
    );
    this.itemsPerPageSelect = page.locator(
      '[data-testid="items-per-page"], .items-per-page',
    );
    this.totalItemsCount = page.locator(
      '[data-testid="total-items"], .total-items',
    );

    // Initialize action locators
    this.viewPatientButtons = page.locator(
      '[data-testid="view-patient"], .view-patient',
    );
    this.editPatientButtons = page.locator(
      '[data-testid="edit-patient"], .edit-patient',
    );
    this.deletePatientButtons = page.locator(
      '[data-testid="delete-patient"], .delete-patient',
    );
    this.patientMenuButtons = page.locator(
      '[data-testid="patient-menu"], .patient-menu',
    );

    // Initialize modal locators
    this.deleteConfirmModal = page.locator(
      '[data-testid="delete-confirm-modal"], .delete-confirm-modal',
    );
    this.confirmDeleteButton = page.locator(
      '[data-testid="confirm-delete"], .confirm-delete',
    );
    this.cancelDeleteButton = page.locator(
      '[data-testid="cancel-delete"], .cancel-delete',
    );

    // Initialize state locators
    this.loadingSpinner = page.locator(
      '[data-testid="loading"], .loading, .spinner',
    );
    this.emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    this.errorMessage = page.locator(
      '[data-testid="error-message"], .error-message',
    );
    this.noResultsMessage = page.locator(
      '[data-testid="no-results"], .no-results',
    );
  }

  // Navigation methods
  async navigateToPatients() {
    await this.goto("/patients");
    await this.waitForPageLoad();
  }

  async navigateToAddPatient() {
    await this.clickElement(this.addPatientButton);
    await this.waitForUrl(/\/patients\/new/);
  }

  async navigateToPatientDetails(patientId: string) {
    await this.goto(`/patients/${patientId}`);
    await this.waitForPageLoad();
  }

  async navigateToEditPatient(patientId: string) {
    await this.goto(`/patients/${patientId}/edit`);
    await this.waitForPageLoad();
  }

  // Search and filter methods
  async searchPatients(query: string) {
    await this.fillInput(this.searchInput, query);
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToFinish();
  }

  async quickSearchPatients(query: string) {
    await this.fillInput(this.searchInput, query);
    await this.pressKey("Enter");
    await this.waitForLoadingToFinish();
  }

  async clearSearch() {
    await this.clickElement(this.clearSearchButton);
    await this.waitForLoadingToFinish();
  }

  async openFilterPanel() {
    await this.clickElement(this.filterButton);
    await this.waitForElementToBeVisible(this.filterPanel);
  }

  async filterByStatus(status: string) {
    await this.openFilterPanel();
    await this.selectOption(this.statusFilter, status);
    await this.waitForLoadingToFinish();
  }

  async filterByGender(gender: string) {
    await this.openFilterPanel();
    await this.selectOption(this.genderFilter, gender);
    await this.waitForLoadingToFinish();
  }

  async filterByAgeRange(minAge: string, maxAge: string) {
    await this.openFilterPanel();
    const minAgeInput = this.ageFilter.locator('input[name="minAge"]');
    const maxAgeInput = this.ageFilter.locator('input[name="maxAge"]');
    await this.fillInput(minAgeInput, minAge);
    await this.fillInput(maxAgeInput, maxAge);
    await this.waitForLoadingToFinish();
  }

  async clearAllFilters() {
    const clearFiltersButton = this.filterPanel.locator(
      '[data-testid="clear-filters"], .clear-filters',
    );
    await this.clickElement(clearFiltersButton);
    await this.waitForLoadingToFinish();
  }

  // Table interaction methods
  async getPatientRowCount(): Promise<number> {
    await this.waitForElementToBeVisible(this.patientsTable);
    return await this.patientRows.count();
  }

  async getPatientDataFromRow(rowIndex: number): Promise<{
    name: string;
    email: string;
    phone: string;
    age: string;
    status: string;
  }> {
    const row = this.patientRows.nth(rowIndex);
    await this.waitForElementToBeVisible(row);

    return {
      name:
        (await row
          .locator('.name-cell, [data-testid="name-cell"]')
          .textContent()) || "",
      email:
        (await row
          .locator('.email-cell, [data-testid="email-cell"]')
          .textContent()) || "",
      phone:
        (await row
          .locator('.phone-cell, [data-testid="phone-cell"]')
          .textContent()) || "",
      age:
        (await row
          .locator('.age-cell, [data-testid="age-cell"]')
          .textContent()) || "",
      status:
        (await row
          .locator('.status-cell, [data-testid="status-cell"]')
          .textContent()) || "",
    };
  }

  async selectPatientRow(rowIndex: number) {
    const checkbox = this.patientCheckboxes.nth(rowIndex);
    await this.clickElement(checkbox);
  }

  async selectAllPatients() {
    await this.clickElement(this.selectAllCheckbox);
  }

  async getSelectedPatientsCount(): Promise<number> {
    const checkedBoxes = this.patientCheckboxes.locator(":checked");
    return await checkedBoxes.count();
  }

  // Patient actions
  async viewPatient(rowIndex: number) {
    const viewButton = this.viewPatientButtons.nth(rowIndex);
    await this.clickElement(viewButton);
    await this.waitForUrl(/\/patients\/\d+/);
  }

  async editPatient(rowIndex: number) {
    const editButton = this.editPatientButtons.nth(rowIndex);
    await this.clickElement(editButton);
    await this.waitForUrl(/\/patients\/\d+\/edit/);
  }

  async deletePatient(rowIndex: number) {
    const deleteButton = this.deletePatientButtons.nth(rowIndex);
    await this.clickElement(deleteButton);
    await this.waitForElementToBeVisible(this.deleteConfirmModal);
  }

  async confirmDeletePatient() {
    await this.clickElement(this.confirmDeleteButton);
    await this.waitForElementToBeHidden(this.deleteConfirmModal);
    await this.waitForLoadingToFinish();
  }

  async cancelDeletePatient() {
    await this.clickElement(this.cancelDeleteButton);
    await this.waitForElementToBeHidden(this.deleteConfirmModal);
  }

  async openPatientMenu(rowIndex: number) {
    const menuButton = this.patientMenuButtons.nth(rowIndex);
    await this.clickElement(menuButton);
  }

  // Bulk actions
  async performBulkAction(action: string) {
    await this.clickElement(this.bulkActionsButton);
    const actionButton = this.page.locator(
      `[data-testid="bulk-${action}"], .bulk-${action}`,
    );
    await this.clickElement(actionButton);
    await this.waitForLoadingToFinish();
  }

  async bulkDeleteSelectedPatients() {
    await this.performBulkAction("delete");
    await this.waitForElementToBeVisible(this.deleteConfirmModal);
    await this.confirmDeletePatient();
  }

  // Pagination methods
  async goToNextPage() {
    await this.clickElement(this.nextPageButton);
    await this.waitForLoadingToFinish();
  }

  async goToPreviousPage() {
    await this.clickElement(this.previousPageButton);
    await this.waitForLoadingToFinish();
  }

  async goToPage(pageNumber: number) {
    const pageButton = this.pageNumbers.locator(`text="${pageNumber}"`);
    await this.clickElement(pageButton);
    await this.waitForLoadingToFinish();
  }

  async changeItemsPerPage(itemsCount: string) {
    await this.selectOption(this.itemsPerPageSelect, itemsCount);
    await this.waitForLoadingToFinish();
  }

  async getTotalItemsCount(): Promise<string> {
    await this.waitForElementToBeVisible(this.totalItemsCount);
    return await this.getElementText(this.totalItemsCount);
  }

  // Import/Export methods
  async importPatients(filePath: string) {
    await this.clickElement(this.importPatientsButton);
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await this.waitForLoadingToFinish();
  }

  async exportPatients(format: "csv" | "excel" | "pdf" = "csv") {
    await this.clickElement(this.exportPatientsButton);
    const exportButton = this.page.locator(
      `[data-testid="export-${format}"], .export-${format}`,
    );
    await this.clickElement(exportButton);
  }

  // Validation methods
  async expectPatientsTableToBeVisible() {
    await this.expectElementToBeVisible(this.patientsTable);
    await this.expectElementToBeVisible(this.patientsTableHeader);
    await this.expectElementToBeVisible(this.patientsTableBody);
  }

  async expectSearchToBeVisible() {
    await this.expectElementToBeVisible(this.searchInput);
    await this.expectElementToBeVisible(this.searchButton);
  }

  async expectAddPatientButtonToBeVisible() {
    await this.expectElementToBeVisible(this.addPatientButton);
  }

  async expectPaginationToBeVisible() {
    await this.expectElementToBeVisible(this.pagination);
  }

  async expectPatientRowsToBeVisible(minCount: number = 1) {
    const rowCount = await this.getPatientRowCount();
    if (rowCount < minCount) {
      throw new Error(
        `Expected at least ${minCount} patient rows, but found ${rowCount}`,
      );
    }
  }

  async expectEmptyState() {
    await this.expectElementToBeVisible(this.emptyState);
  }

  async expectNoResultsMessage() {
    await this.expectElementToBeVisible(this.noResultsMessage);
  }

  async expectErrorMessage(expectedMessage?: string) {
    await this.expectElementToBeVisible(this.errorMessage);
    if (expectedMessage) {
      await this.expectElementToContainText(this.errorMessage, expectedMessage);
    }
  }

  async expectPatientInResults(patientName: string) {
    const patientRow = this.patientRows.locator(`text="${patientName}"`);
    await this.expectElementToBeVisible(patientRow);
  }

  async expectPatientNotInResults(patientName: string) {
    const patientRow = this.patientRows.locator(`text="${patientName}"`);
    const isVisible = await this.isElementVisible(patientRow);
    if (isVisible) {
      throw new Error(
        `Expected patient "${patientName}" not to be in results, but it was found`,
      );
    }
  }

  // Sorting methods
  async sortByColumn(columnName: string) {
    const columnHeader = this.patientsTableHeader.locator(
      `text="${columnName}"`,
    );
    await this.clickElement(columnHeader);
    await this.waitForLoadingToFinish();
  }

  async expectColumnToBeSorted(columnName: string, direction: "asc" | "desc") {
    const columnHeader = this.patientsTableHeader.locator(
      `text="${columnName}"`,
    );
    const sortIndicator = columnHeader.locator(
      `.sort-${direction}, [data-sort="${direction}"]`,
    );
    await this.expectElementToBeVisible(sortIndicator);
  }

  // Implementation of abstract methods
  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForElementToBeVisible(this.pageHeader);
      await this.waitForElementToBeVisible(this.patientsTable);
      await this.waitForLoadingToFinish();
      return true;
    } catch {
      return false;
    }
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  // Test data helpers
  static getTestPatientData() {
    return {
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "(11) 99999-9999",
      age: "35",
      gender: "Masculino",
      status: "Ativo",
    };
  }

  static getSearchQueries() {
    return {
      validName: "João",
      validEmail: "joao@",
      validPhone: "99999",
      invalidQuery: "xyz123nonexistent",
      emptyQuery: "",
    };
  }

  static getFilterOptions() {
    return {
      status: ["Ativo", "Inativo", "Pendente"],
      gender: ["Masculino", "Feminino", "Outro"],
      ageRanges: {
        young: { min: "18", max: "30" },
        adult: { min: "31", max: "60" },
        senior: { min: "61", max: "100" },
      },
    };
  }
}
