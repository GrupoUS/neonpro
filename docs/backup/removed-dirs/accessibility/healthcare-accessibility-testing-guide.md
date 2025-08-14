# Healthcare Accessibility Testing Guide - NeonPro
## WCAG 2.1 AA Compliance for Brazilian Healthcare Applications

### Overview
This guide provides comprehensive testing procedures for ensuring NeonPro meets healthcare accessibility standards including WCAG 2.1 AA compliance, Brazilian healthcare regulations, and assistive technology compatibility.

### Quick Start Testing

#### Manual Keyboard Testing
1. **Tab Navigation**: Press `Tab` to navigate through all interactive elements
2. **Skip Links**: First tab should reveal skip navigation links
3. **Focus Visibility**: Ensure visible focus indicators on all elements
4. **Escape Key**: Should close modals and dropdown menus
5. **Arrow Keys**: Should navigate through menu items and data tables

#### Screen Reader Testing Commands

##### NVDA (Free Windows Screen Reader)
```
H - Next heading
K - Next link
F - Next form field
T - Next table
L - Next list
Insert+F7 - Elements list
Insert+B - Say all (read everything)
Insert+T - Read page title
```

##### JAWS (Windows Commercial Screen Reader)
```
H - Next heading
Shift+H - Previous heading
F - Next form field
T - Next table
L - Next list
Insert+F6 - Headings list
Insert+F5 - Form fields list
Insert+R - Say all
```

##### VoiceOver (macOS Built-in)
```
Control+Option+Right Arrow - Next item
Control+Option+Left Arrow - Previous item
Control+Option+Command+H - Next heading
Control+Option+U - Open rotor
Control+Option+Command+Right/Left - Navigate rotor
```

### Automated Testing Setup

#### Dependencies Installation
```bash
# Install accessibility testing dependencies
pnpm add -D @playwright/test @axe-core/playwright axe-playwright
pnpm add -D @testing-library/jest-dom jest-axe
```

#### Run Accessibility Tests
```bash
# Run comprehensive accessibility test suite
pnpm test:a11y

# Run specific healthcare accessibility tests
pnpm test tests/accessibility/healthcare-accessibility.spec.ts

# Run with specific browser (test with multiple)
pnpm playwright test --project=chromium tests/accessibility/
pnpm playwright test --project=firefox tests/accessibility/
pnpm playwright test --project=webkit tests/accessibility/
```

### Healthcare-Specific Accessibility Requirements

#### Brazilian Healthcare Data Patterns
- **CPF Format**: 123.456.789-00 (must be announced correctly by screen readers)
- **Phone Format**: (11) 99999-9999 (area code + number format)
- **Portuguese Language**: All content must have proper `lang="pt-BR"` attributes
- **Medical Terminology**: Use standard Brazilian medical terms

#### WCAG 2.1 AA Healthcare Compliance Checklist

##### Level A Requirements
- [ ] **1.1.1** - Non-text Content: All images have alt text
- [ ] **1.2.1** - Audio/Video: Captions for audio content
- [ ] **1.2.2** - Captions (Prerecorded): Videos have captions
- [ ] **1.2.3** - Audio Description: Videos have audio descriptions
- [ ] **1.3.1** - Info and Relationships: Proper semantic markup
- [ ] **1.3.2** - Meaningful Sequence: Logical reading order
- [ ] **1.3.3** - Sensory Characteristics: Don't rely solely on visual cues
- [ ] **1.4.1** - Use of Color: Color is not the only visual means
- [ ] **1.4.2** - Audio Control: Auto-playing audio can be controlled
- [ ] **2.1.1** - Keyboard: All functionality available via keyboard
- [ ] **2.1.2** - No Keyboard Trap: Keyboard focus can move away
- [ ] **2.1.4** - Character Key Shortcuts: Shortcuts can be disabled
- [ ] **2.2.1** - Timing Adjustable: Time limits can be extended
- [ ] **2.2.2** - Pause, Stop, Hide: Moving content can be paused
- [ ] **2.3.1** - Three Flashes: No content flashes more than 3 times per second
- [ ] **2.4.1** - Bypass Blocks: Skip links provided
- [ ] **2.4.2** - Page Titled: Pages have descriptive titles
- [ ] **2.4.3** - Focus Order: Logical focus sequence
- [ ] **2.4.4** - Link Purpose: Link purpose is clear from context
- [ ] **3.1.1** - Language of Page: Page language is declared
- [ ] **3.2.1** - On Focus: Focus doesn't trigger unexpected changes
- [ ] **3.2.2** - On Input: Input doesn't trigger unexpected changes
- [ ] **3.3.1** - Error Identification: Errors are clearly identified
- [ ] **3.3.2** - Labels or Instructions: Form fields have labels
- [ ] **4.1.1** - Parsing: Valid HTML markup
- [ ] **4.1.2** - Name, Role, Value: UI components have proper names/roles

##### Level AA Requirements
- [ ] **1.2.4** - Captions (Live): Live audio has captions
- [ ] **1.2.5** - Audio Description (Prerecorded): Videos have audio descriptions
- [ ] **1.4.3** - Contrast (Minimum): 4.5:1 contrast ratio for normal text
- [ ] **1.4.4** - Resize Text: Text can be resized to 200% without scrolling
- [ ] **1.4.5** - Images of Text: Use text rather than images of text
- [ ] **2.4.5** - Multiple Ways: Multiple ways to find pages
- [ ] **2.4.6** - Headings and Labels: Headings and labels are descriptive
- [ ] **2.4.7** - Focus Visible: Keyboard focus is visible
- [ ] **3.1.2** - Language of Parts: Language changes are marked
- [ ] **3.2.3** - Consistent Navigation: Navigation is consistent
- [ ] **3.2.4** - Consistent Identification: Components are consistently identified
- [ ] **3.3.3** - Error Suggestion: Error corrections are suggested
- [ ] **3.3.4** - Error Prevention: Important actions are confirmed

### Healthcare Form Accessibility Patterns

#### Required Field Patterns
```html
<!-- Brazilian CPF field -->
<label for="cpf">CPF <span aria-label="obrigatório">*</span></label>
<input 
  id="cpf" 
  name="cpf" 
  type="text" 
  pattern="[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}-?[0-9]{2}"
  aria-required="true"
  aria-describedby="cpf-format cpf-error"
  placeholder="123.456.789-00"
/>
<div id="cpf-format" class="field-help">
  Formato: 123.456.789-00
</div>
<div id="cpf-error" class="field-error" aria-live="polite" aria-atomic="true">
  <!-- Error messages appear here -->
</div>
```

#### Error Handling Pattern
```html
<!-- Error summary (appears at top of form) -->
<div role="alert" class="error-summary" tabindex="-1">
  <h2>Erros no formulário</h2>
  <ul>
    <li><a href="#cpf">CPF: Formato inválido</a></li>
    <li><a href="#phone">Telefone: Número obrigatório</a></li>
  </ul>
</div>
```

### Patient Data Table Accessibility

#### Proper Table Structure
```html
<table role="table" aria-label="Lista de pacientes da clínica">
  <caption class="sr-only">
    Tabela com informações dos pacientes incluindo nome, contato, CPF, última consulta e status
  </caption>
  <thead>
    <tr>
      <th scope="col">Nome do Paciente</th>
      <th scope="col">Contato (E-mail e Telefone)</th>
      <th scope="col">CPF</th>
      <th scope="col">Última Consulta</th>
      <th scope="col">Status</th>
      <th scope="col"><span class="sr-only">Ações</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <a href="/patients/123" aria-describedby="patient-123-info">
          Maria Silva Santos
        </a>
        <span id="patient-123-info" class="sr-only">
          Visualizar prontuário da paciente Maria Silva Santos
        </span>
      </td>
      <!-- More cells... -->
    </tr>
  </tbody>
</table>
```

### Screen Reader Specific Testing

#### NVDA Testing Checklist
- [ ] All headings are announced with proper hierarchy
- [ ] Form labels are properly associated and announced
- [ ] Table headers are announced when navigating cells
- [ ] Error messages are announced when they appear
- [ ] Button purposes are clear when focused
- [ ] Page titles are descriptive and announced
- [ ] Language is properly detected as Portuguese
- [ ] CPF and phone numbers are pronounced correctly

#### JAWS Testing Checklist
- [ ] Virtual cursor navigation works properly
- [ ] Forms mode is triggered correctly for form fields
- [ ] Table navigation commands work (Ctrl+Alt+Arrow keys)
- [ ] Elements list (Insert+F6/F5) shows all interactive elements
- [ ] Say All (Insert+R) reads content in logical order
- [ ] Brazilian Portuguese pronunciation is accurate

#### VoiceOver Testing Checklist
- [ ] Rotor navigation includes all landmark regions
- [ ] Form controls are grouped properly in rotor
- [ ] Table navigation with VO+Arrow keys works
- [ ] Quick Nav (Left/Right arrows) navigation is logical
- [ ] Gestures work properly on touch devices
- [ ] Portuguese content is pronounced correctly

### Mobile Accessibility Testing

#### iOS VoiceOver (iPhone/iPad)
```
Swipe Right - Next item
Swipe Left - Previous item
Double Tap - Activate element
Swipe Up/Down - Navigate rotor options
Two-finger swipe up - Read all
Two-finger tap - Stop/start reading
```

#### Android TalkBack
```
Swipe Right - Next item
Swipe Left - Previous item
Double Tap - Activate element
Swipe Up then Right - Navigate reading controls
Two-finger swipe down - Read from top
```

### Color and Visual Accessibility

#### Color Contrast Testing Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser**: Free desktop tool
- **Browser DevTools**: Chrome/Firefox have built-in contrast checkers

#### High Contrast Mode Testing
- **Windows**: Enable High Contrast in Settings → Ease of Access
- **macOS**: Enable Increase Contrast in System Preferences → Accessibility
- **Browser Extensions**: High Contrast extensions for testing

### Continuous Integration Integration

#### GitHub Actions Accessibility Testing
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:a11y
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: accessibility-reports
          path: test-results/
```

### Common Healthcare Accessibility Issues to Avoid

#### Critical Issues
1. **Missing Form Labels**: Every form field must have a proper label
2. **Poor Color Contrast**: Text must meet 4.5:1 minimum contrast ratio
3. **Keyboard Traps**: Users must be able to navigate away from all elements
4. **Missing Skip Links**: Provide shortcuts to main content
5. **Improper Heading Structure**: Use h1-h6 in proper hierarchical order
6. **Missing Alt Text**: All meaningful images need alternative text
7. **Inaccessible Data Tables**: Use proper th/td structure with scope
8. **No Error Descriptions**: Form errors must be clearly described
9. **Missing ARIA Labels**: Interactive elements need accessible names
10. **Auto-playing Content**: Media must be controllable by users

#### Healthcare-Specific Issues
1. **CPF/Phone Pronunciation**: Ensure screen readers pronounce Brazilian formats correctly
2. **Medical Terminology**: Use standard Portuguese medical terms
3. **Patient Privacy**: Ensure screen readers don't expose sensitive data unnecessarily
4. **Form Completion Time**: Provide adequate time for users with disabilities
5. **Emergency Information**: Critical health information must be highly accessible

### Resources and References

#### WCAG 2.1 Guidelines
- **Official WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM WCAG Checklist**: https://webaim.org/standards/wcag/checklist

#### Screen Reader Resources
- **NVDA Download**: https://www.nvaccess.org/download/
- **JAWS Screen Reader**: https://www.freedomscientific.com/products/software/jaws/
- **VoiceOver Guide**: Built into macOS/iOS

#### Brazilian Accessibility Standards
- **Lei Brasileira de Inclusão (LBI)**: Federal Law 13.146/2015
- **eMAG**: Electronic Government Accessibility Model
- **WCAG em Português**: Brazilian Portuguese WCAG translation

#### Testing Tools
- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools
- **Pa11y**: Command line accessibility testing tool

### Support and Training

For questions about implementing accessibility features or interpreting test results, consult:
- **W3C Web Accessibility Initiative (WAI)**
- **WebAIM Training Materials**
- **Deque University**
- **Brazilian accessibility community resources**

Remember: Accessibility is not a checklist item but an ongoing commitment to inclusive design that benefits all users, especially in healthcare contexts where access to information can be critical for patient care and safety.
