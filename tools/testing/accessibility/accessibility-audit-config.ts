// tools/testing/accessibility/accessibility-audit-config.ts
import type { AxeConfig } from 'axe-core';

/**
 * NEONPRO HEALTHCARE - WCAG 2.1 AA COMPLIANCE CONFIGURATION
 *
 * Comprehensive accessibility testing configuration for healthcare applications
 * with enhanced requirements for medical data handling and emergency interfaces.
 */

export const WCAG_AA_CONFIG: AxeConfig = {
  rules: {
    // WCAG 2.1 Level A Rules - Critical
    'area-alt': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-meter-name': { enabled: true },
    'aria-progressbar-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-tooltip-name': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'audio-caption': { enabled: true },
    blink: { enabled: true },
    'button-name': { enabled: true },
    bypass: { enabled: true },
    'color-contrast': {
      enabled: true,
      options: {
        noScroll: true,
        // Enhanced contrast requirements for medical interfaces
        contrastRatio: {
          normal: 4.5, // WCAG AA standard
          large: 3.0, // WCAG AA standard
          enhanced: 7.0, // Healthcare enhanced requirement
        },
      },
    },
    'definition-list': { enabled: true },
    dlitem: { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'html-xml-lang-mismatch': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'input-image-alt': { enabled: true },
    label: { enabled: true },
    'link-name': { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    marquee: { enabled: true },
    'meta-refresh': { enabled: true },
    'object-alt': { enabled: true },
    'role-img-alt': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'server-side-image-map': { enabled: true },
    'svg-img-alt': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'valid-lang': { enabled: true },
    'video-caption': { enabled: true },

    // WCAG 2.1 Level AA Rules - Enhanced
    'autocomplete-valid': { enabled: true },
    'avoid-inline-spacing': { enabled: true },
    'color-contrast-enhanced': {
      enabled: true,
      options: {
        // Healthcare-specific enhanced contrast
        contrastRatio: {
          normal: 7.0, // Enhanced for medical data
          large: 4.5, // Enhanced for medical data
        },
      },
    },
    'focus-order-semantics': { enabled: true },
    'hidden-content': { enabled: true },
    'image-redundant-alt': { enabled: true },
    'label-title-only': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'link-in-text-block': { enabled: true },
    'no-autoplay-audio': { enabled: true },
    'page-has-heading-one': { enabled: true },
    region: { enabled: true },
    'scope-attr-valid': { enabled: true },
    'skip-link': { enabled: true },
  },

  // Healthcare-specific tags for targeted testing
  tags: [
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'best-practice',
    'ACT', // Accessibility Conformance Testing
    'section508', // US Federal compliance
    'experimental', // Latest WCAG 2.2 draft rules
  ],

  // Enhanced reporting for medical applications
  reporter: 'v2',
  resultTypes: ['violations', 'incomplete', 'passes'],

  // Healthcare-specific element selectors
  include: [
    '[data-medical-context]',
    '[data-sensitive]',
    '[data-lgpd]',
    '[data-emergency]',
    '[data-priority]',
    'form[data-form-type]',
    'table[data-patient-data]',
    '[role="alert"]',
    '[role="alertdialog"]',
    '[aria-live]',
  ],

  // Exclude third-party components that are already audited
  exclude: ['#storybook-root', '.sb-show-main', '[data-test-ignore-a11y]'],
};

/**
 * Healthcare-specific accessibility test scenarios
 */
export const HEALTHCARE_A11Y_SCENARIOS = {
  // Critical Emergency Interfaces
  emergency: {
    selectors: [
      '[data-priority="critical"]',
      '[data-emergency="true"]',
      '.emergency-alert',
      '[role="alert"][data-medical-context="emergency"]',
    ],
    requirements: {
      colorContrast: 7.0,
      focusManagement: true,
      screenReaderSupport: true,
      keyboardNavigation: true,
      multiModalAlerts: true,
    },
  },

  // Patient Data Interfaces
  patientData: {
    selectors: [
      '[data-sensitive="true"]',
      '[data-patient-data="true"]',
      'form[data-form-type="patient-registration"]',
      'table[data-patient-data="true"]',
    ],
    requirements: {
      lgpdCompliance: true,
      dataProtection: true,
      privacyIndicators: true,
      auditTrail: true,
    },
  },

  // Form Interfaces
  forms: {
    selectors: [
      'form[data-form-type]',
      'input[data-medical-type]',
      '[data-validation]',
      '.form-section',
    ],
    requirements: {
      labelAssociation: true,
      errorHandling: true,
      validationFeedback: true,
      autocompleteAttributes: true,
    },
  },

  // Navigation and Layout
  navigation: {
    selectors: [
      'nav',
      '[role="navigation"]',
      '.breadcrumb',
      '[data-skip-link]',
    ],
    requirements: {
      skipLinks: true,
      landmarkRoles: true,
      focusOrder: true,
      keyboardNavigation: true,
    },
  },

  // Data Tables
  tables: {
    selectors: ['table', '[role="table"]', '[role="grid"]', '.data-table'],
    requirements: {
      tableHeaders: true,
      sortingIndicators: true,
      rowSelection: true,
      dataRelationships: true,
    },
  },
};

/**
 * Color contrast validation for healthcare themes
 */
export const HEALTHCARE_COLOR_CONTRAST = {
  // Enhanced contrast ratios for medical applications
  ratios: {
    normalText: 7.0, // Enhanced from WCAG AA 4.5:1
    largeText: 4.5, // Enhanced from WCAG AA 3:1
    graphicalObjects: 4.5, // WCAG AA 3:1 enhanced
    uiComponents: 4.5, // Enhanced for clarity
  },

  // Critical color combinations for medical contexts
  criticalPairs: [
    { background: '#ffffff', foreground: '#000000' }, // Maximum contrast
    { background: '#f8f9fa', foreground: '#212529' }, // Light theme
    { background: '#212529', foreground: '#ffffff' }, // Dark theme
    { background: '#dc3545', foreground: '#ffffff' }, // Emergency red
    { background: '#28a745', foreground: '#ffffff' }, // Success green
    { background: '#ffc107', foreground: '#000000' }, // Warning yellow
  ],
};

/**
 * Keyboard navigation test patterns
 */
export const KEYBOARD_NAVIGATION_TESTS = {
  tabOrder: [
    'Skip links should be first in tab order',
    'Main navigation should follow logical sequence',
    'Form fields should follow visual order',
    'Interactive elements should be focusable',
    'Modal dialogs should trap focus',
    'Dropdown menus should be keyboard accessible',
  ],

  keyPatterns: {
    Tab: 'Move to next focusable element',
    'Shift+Tab': 'Move to previous focusable element',
    Enter: 'Activate buttons and links',
    Space: 'Activate buttons and checkboxes',
    'Arrow keys': 'Navigate within component groups',
    Escape: 'Close modals and menus',
    'Home/End': 'Move to first/last item in lists',
  },
};

/**
 * Screen reader test scenarios
 */
export const SCREEN_READER_TESTS = {
  landmarks: [
    'Page should have proper landmark structure',
    'Main content should be identifiable',
    'Navigation areas should be labeled',
    'Form sections should be grouped logically',
  ],

  announcements: [
    'Form validation errors should be announced',
    'Dynamic content changes should be announced',
    'Loading states should be announced',
    'Success messages should be announced',
  ],

  labels: [
    'All form controls should have accessible names',
    'Images should have appropriate alt text',
    'Icons should have text alternatives',
    'Data tables should have proper headers',
  ],
};

export default WCAG_AA_CONFIG;
