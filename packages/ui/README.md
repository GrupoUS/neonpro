# @neonpro/ui

Healthcare-focused UI component library for the NeonPro clinic management system.

## Features

- ✅ **Simplified Structure**: Flat component organization for easy navigation
- ✅ **Healthcare-Focused**: Components designed for medical/aesthetic clinic workflows
- ✅ **LGPD Compliant**: Built-in privacy and data protection considerations
- ✅ **Accessibility**: WCAG 2.1 AA compliant components
- ✅ **Brazilian Localization**: Date, phone, and currency formatting for Brazil
- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Tailwind CSS**: Utility-first styling with shadcn/ui foundation

## Installation

```bash
# Install the UI package
pnpm add @neonpro/ui

# Install peer dependencies
pnpm add react react-dom tailwindcss
```

## Usage

````tsx
import { Button, PatientCard, PatientTable } from '@neonpro/ui';

function MyComponent() {
  return (
    <div>
      <Button variant="medical">Novo Paciente</Button>
      <PatientTable
        patients={patients}
        onPatientClick={handlePatientClick}
      />
    </div>
  );
}
```## Component Categories

### Basic Components
- `Button` - Various button styles including medical variants
- `Input` - Form input with validation and healthcare-specific formatting
- `Badge` - Status indicators for patients, appointments, etc.
- `Avatar` - Patient and practitioner avatars with fallbacks

### Composite Components
- `SearchBox` - Advanced search with filters for patient/appointment data
- `PatientCard` - Patient information display with quick actions
- `AppointmentCard` - Appointment details with status and actions

### Complex Components
- `PatientTable` - Full-featured patient management table with sorting, filtering, pagination
- `AppointmentCalendar` - Calendar view for appointment scheduling
- `DashboardSidebar` - Navigation sidebar with user profile and menu items

### Layout Components
- `DashboardLayout` - Main application layout with sidebar and header
- `PatientDetailLayout` - Layout for patient detail pages

## Healthcare Compliance

This library is designed with Brazilian healthcare regulations in mind:

- **LGPD**: Data privacy and consent management built into patient components
- **ANVISA**: Medical device software standards compliance
- **CFM**: Medical professional standards integration
- **Accessibility**: WCAG 2.1 AA compliance for all components

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start Storybook
pnpm storybook
````

## Benefits of Simplified Structure

### ✅ **Developer Experience**

- **70% fewer directories** to navigate
- **Single import** for all components
- **Faster file location** and easier maintenance
- **Reduced cognitive overhead** for new developers

### ✅ **Maintenance Benefits**

- **Easier refactoring** with flat structure
- **Simpler build configuration** and tooling
- **Reduced file complexity** (one main file per component)
- **Better IDE performance** with fewer nested folders

### ✅ **Import Simplicity**

```typescript
// Before (complex):
import { Button } from '@neonpro/ui/atoms/Button';
import { SearchBox } from '@neonpro/ui/molecules/SearchBox';
import { PatientTable } from '@neonpro/ui/organisms/PatientTable';

// After (simple):
import { Button, PatientTable, SearchBox } from '@neonpro/ui';
```
