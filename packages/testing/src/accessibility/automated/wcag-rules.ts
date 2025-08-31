/**
 * WCAG 2.1 AA+ Rules Configuration for Healthcare Applications
 * Customized for NeonPro medical interface accessibility requirements
 */

export const WCAG21AA_RULES = {
  // Core WCAG 2.1 AA rules
  'color-contrast': { enabled: true, options: { 
    AALevel: 'AA',
    largeTextMinContrast: 4.5,
    normalTextMinContrast: 7, // Enhanced for healthcare emergency scenarios
    ignoreTextLength: false
  }},
  'color-contrast-enhanced': { enabled: true }, // WCAG 2.1 AAA
  'focus-order-semantics': { enabled: true },
  'keyboard': { enabled: true },
  'keyboard-no-exception': { enabled: true },
  'aria-allowed-attr': { enabled: true },
  'aria-command-name': { enabled: true },
  'aria-hidden-body': { enabled: true },
  'aria-hidden-focus': { enabled: true },
  'aria-input-field-name': { enabled: true },
  'aria-label': { enabled: true },
  'aria-labelledby': { enabled: true },
  'aria-live-region-atomic': { enabled: true },
  'aria-required-attr': { enabled: true },
  'aria-required-children': { enabled: true },
  'aria-required-parent': { enabled: true },
  'aria-roledescription': { enabled: true },
  'aria-roles': { enabled: true },
  'aria-text': { enabled: true },
  'aria-toggle-field-name': { enabled: true },
  'aria-tooltip-name': { enabled: true },
  'aria-valid-attr-value': { enabled: true },
  'aria-valid-attr': { enabled: true },
  
  // Navigation and Focus Management
  'bypass': { enabled: true }, // Skip links requirement
  'focus-visible': { enabled: true },
  'no-focus-scroll': { enabled: true },
  'scrollable-region-focusable': { enabled: true },
  'skip-link': { enabled: true },
  'tabindex': { enabled: true },
  
  // Language and Reading Order
  'html-has-lang': { enabled: true },
  'html-lang-valid': { enabled: true },
  'html-xml-lang-mismatch': { enabled: true },
  'landmark-banner-is-top-level': { enabled: true },
  'landmark-complementary-is-top-level': { enabled: true },
  'landmark-contentinfo-is-top-level': { enabled: true },
  'landmark-main-is-top-level': { enabled: true },
  'landmark-no-duplicate-banner': { enabled: true },
  'landmark-no-duplicate-contentinfo': { enabled: true },
  'landmark-one-main': { enabled: true },
  'landmark-unique': { enabled: true },
  'page-has-heading-one': { enabled: true },
  'region': { enabled: true },

  // Forms and Input
  'form-field-multiple-labels': { enabled: true },
  'input-button-name': { enabled: true },
  'input-image-alt': { enabled: true },
  'label': { enabled: true },
  'label-title-only': { enabled: true },
  
  // Images and Media
  'image-alt': { enabled: true },
  'image-redundant-alt': { enabled: true },
  'svg-img-alt': { enabled: true },
  
  // Structure and Semantics
  'heading-order': { enabled: true },
  'link-name': { enabled: true },
  'list': { enabled: true },
  'listitem': { enabled: true },
  
  // Interactive Elements
  'button-name': { enabled: true },
  'link-in-text-block': { enabled: true },
  'nested-interactive': { enabled: true },
  'role-img-alt': { enabled: true },
  
  // Error Handling and Feedback
  'error-message': { enabled: true },
  'valid-lang': { enabled: true }
};

export const EMERGENCY_CONTRAST_RULES = {
  // Emergency-specific accessibility rules
  'emergency-high-contrast': {
    enabled: true,
    minimumRatio: 7, // 7:1 for emergency elements
    applyTo: [
      '[data-emergency="true"]',
      '.emergency-button',
      '[aria-label*="EMERGÊNCIA"]',
      '[aria-label*="emergência"]'
    ]
  },
  'emergency-focus-indicators': {
    enabled: true,
    minimumRatio: 3, // 3:1 for focus indicators
    applyTo: [
      ':focus',
      '.focus-emergency',
      '.focus-enhanced'
    ]
  },
  'medical-interface-contrast': {
    enabled: true,
    minimumRatio: 4.5, // 4.5:1 for medical interface elements
    applyTo: [
      '[data-medical="true"]',
      '.medical-button',
      '[aria-label*="médico"]',
      '[aria-label*="assistente médico"]'
    ]
  }
};

export const MEDICAL_TERMINOLOGY_RULES = {
  // Portuguese medical terminology accessibility rules
  'medical-term-pronunciation': {
    enabled: true,
    requiredTerms: [
      'emergência',
      'médico', 
      'paciente',
      'lgpd',
      'anvisa',
      'cfm',
      'botox',
      'preenchimentos', 
      'procedimentos',
      'consultas',
      'tratamentos',
      'plantão'
    ],
    requirePronunciationGuide: true,
    checkElements: [
      '[data-term]',
      '[data-pronunciation]', 
      '[data-context]'
    ]
  },
  'brazilian-portuguese-lang': {
    enabled: true,
    requiredLanguage: 'pt-BR',
    checkElements: ['html', '[lang]']
  },
  'medical-context-announcements': {
    enabled: true,
    requiredAriaLive: ['polite', 'assertive'],
    emergencyPriority: 'assertive',
    medicalPriority: 'polite'
  }
};

export const KEYBOARD_NAVIGATION_RULES = {
  // Healthcare keyboard navigation requirements
  'emergency-keyboard-shortcuts': {
    enabled: true,
    requiredShortcuts: [
      { key: 'e', modifiers: ['ctrlKey'], description: 'Ativar emergência' },
      { key: 'E', modifiers: ['altKey'], description: 'Ativar emergência (alt)' },
      { key: 'Escape', modifiers: [], description: 'Sair do modo emergência' }
    ],
    priority: 'critical'
  },
  'medical-keyboard-shortcuts': {
    enabled: true,
    requiredShortcuts: [
      { key: 'm', modifiers: ['ctrlKey'], description: 'Toggle reconhecimento de voz' },
      { key: 'l', modifiers: ['ctrlKey'], description: 'Limpar chat médico' }
    ],
    priority: 'important'
  },
  'standard-keyboard-shortcuts': {
    enabled: true,
    requiredShortcuts: [
      { key: '/', modifiers: ['ctrlKey'], description: 'Mostrar ajuda' },
      { key: '?', modifiers: [], description: 'Mostrar ajuda (alt)' }
    ],
    priority: 'standard'
  },
  'tab-order-healthcare': {
    enabled: true,
    priorityOrder: [
      'emergency', // data-emergency="true" elements first
      'medical',    // data-medical="true" elements second  
      'standard'    // other interactive elements last
    ]
  }
};

export const ARIA_IMPLEMENTATION_RULES = {
  // ARIA implementation requirements for healthcare
  'emergency-aria-labels': {
    enabled: true,
    requiredLabels: [
      'EMERGÊNCIA: Chamar médico imediatamente',
      'Modo de emergência médica',
      'Ação de emergência médica crítica'
    ],
    elements: [
      '[data-emergency="true"]',
      '.emergency-button'
    ]
  },
  'medical-aria-labels': {
    enabled: true,
    requiredLabels: [
      'assistente médico',
      'mensagem para o assistente médico',
      'análise médica',
      'consulta médica'
    ],
    elements: [
      '[data-medical="true"]',
      'input[aria-label*="médico"]',
      'button[aria-label*="médico"]'
    ]
  },
  'live-regions-healthcare': {
    enabled: true,
    requiredRegions: [
      { selector: '[aria-live="assertive"]', purpose: 'Emergency announcements' },
      { selector: '[aria-live="polite"]', purpose: 'Medical status updates' },
      { selector: '[role="status"]', purpose: 'System status' },
      { selector: '[role="log"]', purpose: 'Chat messages' }
    ]
  },
  'skip-links-healthcare': {
    enabled: true,
    requiredSkipLinks: [
      { text: 'Pular para mensagens do chat', target: '#chat-messages' },
      { text: 'Pular para entrada de mensagem', target: '#chat-input' },
      { text: 'Pular para ações de emergência', target: '#emergency-actions', conditional: 'emergencyMode' }
    ]
  }
};

export const HEALTHCARE_SPECIFIC_RULES = {
  // Rules specific to healthcare applications
  'patient-privacy-indicators': {
    enabled: true,
    requiredElements: [
      '[aria-label*="LGPD"]',
      '[data-term="lgpd"]'
    ],
    description: 'Patient privacy compliance indicators must be present'
  },
  'regulatory-compliance-terms': {
    enabled: true,
    requiredTerms: ['ANVISA', 'CFM', 'LGPD'],
    checkPronunciation: true,
    description: 'Brazilian healthcare regulatory terms must have pronunciation guides'
  },
  'emergency-response-time': {
    enabled: true,
    maxResponseTime: 200, // 200ms for emergency interactions
    checkElements: [
      '[data-emergency="true"]',
      '.emergency-button'
    ],
    description: 'Emergency elements must respond within 200ms'
  },
  'medical-procedure-terminology': {
    enabled: true,
    requiredTerms: ['botox', 'preenchimentos', 'procedimentos'],
    requireContext: true,
    description: 'Medical procedure terms must have contextual information'
  }
};

// Combined rule set for comprehensive testing
export const COMPREHENSIVE_HEALTHCARE_RULES = {
  ...WCAG21AA_RULES,
  ...EMERGENCY_CONTRAST_RULES,
  ...MEDICAL_TERMINOLOGY_RULES,
  ...KEYBOARD_NAVIGATION_RULES,
  ...ARIA_IMPLEMENTATION_RULES,
  ...HEALTHCARE_SPECIFIC_RULES
};

// Rule priorities for testing order
export const RULE_PRIORITIES = {
  critical: [
    'emergency-high-contrast',
    'emergency-keyboard-shortcuts', 
    'emergency-aria-labels',
    'emergency-response-time'
  ],
  important: [
    'medical-term-pronunciation',
    'medical-keyboard-shortcuts',
    'medical-aria-labels',
    'keyboard',
    'color-contrast'
  ],
  standard: [
    'aria-label',
    'button-name',
    'link-name',
    'bypass',
    'focus-visible'
  ],
  optional: [
    'color-contrast-enhanced',
    'landmark-unique',
    'heading-order'
  ]
};

export default {
  WCAG21AA_RULES,
  EMERGENCY_CONTRAST_RULES,
  MEDICAL_TERMINOLOGY_RULES, 
  KEYBOARD_NAVIGATION_RULES,
  ARIA_IMPLEMENTATION_RULES,
  HEALTHCARE_SPECIFIC_RULES,
  COMPREHENSIVE_HEALTHCARE_RULES,
  RULE_PRIORITIES
};