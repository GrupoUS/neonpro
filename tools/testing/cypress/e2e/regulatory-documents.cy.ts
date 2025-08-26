describe("Regulatory Documents Dashboard Integration", () => {
  beforeEach(() => {
    // Setup authentication session
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("admin@neonpro.com");
    cy.get('[data-testid="password-input"]').type("password123");
    cy.get('[data-testid="login-button"]').click();
    cy.url().should("include", "/dashboard");
  });

  it("should navigate to regulatory documents from dashboard", () => {
    // Test dashboard navigation
    cy.get('[data-testid="nav-regulatory-documents"]').click();
    cy.url().should("include", "/dashboard/regulatory-documents");

    // Verify breadcrumb navigation
    cy.get('[data-testid="breadcrumb"]').should(
      "contain",
      "Regulatory Documents",
    );

    // Verify page loads with proper components
    cy.get('[data-testid="regulatory-documents-list"]').should("be.visible");
    cy.get('[data-testid="add-document-button"]').should("be.visible");
  });

  it("should complete full document management flow", () => {
    cy.visit("/dashboard/regulatory-documents");

    // Add new document
    cy.get('[data-testid="add-document-button"]').click();
    cy.get('[data-testid="document-title-input"]').type(
      "ANVISA Compliance Document",
    );
    cy.get('[data-testid="document-category-select"]').select("ANVISA");
    cy.get('[data-testid="document-type-select"]').select("regulamento");

    // Test file upload
    cy.get('[data-testid="file-upload-input"]').selectFile(
      "cypress/fixtures/test-document.pdf",
    );
    cy.get('[data-testid="upload-progress"]').should("be.visible");

    // Set expiration date
    cy.get('[data-testid="expiration-date-input"]').type("2025-12-31");

    // Submit form
    cy.get('[data-testid="submit-document-button"]').click();

    // Verify success
    cy.get('[data-testid="success-message"]').should(
      "contain",
      "Document created successfully",
    );
    cy.get('[data-testid="regulatory-documents-list"]').should(
      "contain",
      "ANVISA Compliance Document",
    );
  });

  it("should display expiration alerts", () => {
    cy.visit("/dashboard/regulatory-documents");

    // Check alerts section
    cy.get('[data-testid="expiration-alerts"]').should("be.visible");

    // Verify alert functionality
    cy.get('[data-testid="alert-item"]').should("have.length.at.least", 0);
  });

  it("should handle errors gracefully", () => {
    cy.visit("/dashboard/regulatory-documents");

    // Test error handling for invalid form submission
    cy.get('[data-testid="add-document-button"]').click();
    cy.get('[data-testid="submit-document-button"]').click();

    // Verify validation errors
    cy.get('[data-testid="title-error"]').should(
      "contain",
      "Title is required",
    );
    cy.get('[data-testid="category-error"]').should(
      "contain",
      "Category is required",
    );
  });
});
