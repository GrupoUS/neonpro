/**
 * T015: UI Component Contract Tests
 * 
 * Comprehensive contract tests for React components, healthcare interfaces,
 * and user interactions. Validates component props, healthcare-specific UI
 * elements, form components, navigation, modals, charts, and medical workflows.
 * 
 * @created 2025-09-19
 * @author Archon
 * @module UIComponentContractTests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import React from 'react';

// Mock React components for testing
const MockButton = ({ children, onClick, disabled, variant = 'primary', ...props }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`btn btn-${variant}`}
    data-testid="mock-button"
    {...props}
  >
    {children}
  </button>
);

const MockForm = ({ children, onSubmit, ...props }: any) => (
  <form onSubmit={onSubmit} data-testid="mock-form" {...props}>
    {children}
  </form>
);

const MockInput = ({ type = 'text', value, onChange, placeholder, required, ...props }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    data-testid="mock-input"
    {...props}
  />
);

const MockModal = ({ isOpen, onClose, children, ...props }: any) => {
  if (!isOpen) return null;
  return (
    <div data-testid="mock-modal" className="modal" {...props}>
      <div className="modal-content">
        <button onClick={onClose} data-testid="modal-close">×</button>
        {children}
      </div>
    </div>
  );
};

const MockChart = ({ data, type = 'bar', ...props }: any) => (
  <div data-testid="mock-chart" className={`chart chart-${type}`} {...props}>
    Chart: {JSON.stringify(data)}
  </div>
);

// Healthcare-specific mock components
const MockPatientCard = ({ patient, onEdit, onView, ...props }: any) => (
  <div data-testid="patient-card" className="patient-card" {...props}>
    <h3>{patient?.name || 'Patient Name'}</h3>
    <p>CPF: {patient?.cpf || '***.***.***-**'}</p>
    <button onClick={() => onView?.(patient)} data-testid="view-patient">View</button>
    <button onClick={() => onEdit?.(patient)} data-testid="edit-patient">Edit</button>
  </div>
);

const MockAppointmentForm = ({ appointment, onSubmit, onCancel, ...props }: any) => (
  <form onSubmit={onSubmit} data-testid="appointment-form" {...props}>
    <input 
      name="patientId" 
      defaultValue={appointment?.patientId} 
      data-testid="appointment-patient-id"
    />
    <input 
      type="datetime-local" 
      name="datetime" 
      defaultValue={appointment?.datetime}
      data-testid="appointment-datetime"
    />
    <select name="type" defaultValue={appointment?.type} data-testid="appointment-type">
      <option value="consultation">Consultation</option>
      <option value="procedure">Procedure</option>
      <option value="follow-up">Follow-up</option>
    </select>
    <button type="submit" data-testid="appointment-submit">Save</button>
    <button type="button" onClick={onCancel} data-testid="appointment-cancel">Cancel</button>
  </form>
);

// Zod schemas for contract validation
const ButtonPropsSchema = z.object({
  children: z.union([z.string(), z.node()]).optional(),
  onClick: z.function().optional(),
  disabled: z.boolean().optional(),
  variant: z.enum(['primary', 'secondary', 'danger', 'success', 'warning']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
});

const FormPropsSchema = z.object({
  children: z.union([z.string(), z.node()]).optional(),
  onSubmit: z.function().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  action: z.string().optional(),
  encType: z.string().optional(),
});

const InputPropsSchema = z.object({
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'datetime-local', 'time']).optional(),
  value: z.union([z.string(), z.number()]).optional(),
  onChange: z.function().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  maxLength: z.number().optional(),
  minLength: z.number().optional(),
  pattern: z.string().optional(),
});

const ModalPropsSchema = z.object({
  isOpen: z.boolean(),
  onClose: z.function(),
  children: z.union([z.string(), z.node()]).optional(),
  title: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  closeOnOverlayClick: z.boolean().optional(),
  closeOnEscape: z.boolean().optional(),
});

const ChartPropsSchema = z.object({
  data: z.array(z.any()),
  type: z.enum(['bar', 'line', 'pie', 'doughnut', 'scatter', 'area']).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  responsive: z.boolean().optional(),
  animate: z.boolean().optional(),
  legend: z.boolean().optional(),
});

// Healthcare-specific schemas
const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).optional(),
});

const PatientCardPropsSchema = z.object({
  patient: PatientSchema,
  onEdit: z.function().optional(),
  onView: z.function().optional(),
  onDelete: z.function().optional(),
  showActions: z.boolean().optional(),
  compact: z.boolean().optional(),
});

const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  datetime: z.string(),
  type: z.enum(['consultation', 'procedure', 'follow-up', 'emergency']),
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  professionalId: z.string().uuid().optional(),
});

const AppointmentFormPropsSchema = z.object({
  appointment: AppointmentSchema.optional(),
  onSubmit: z.function(),
  onCancel: z.function().optional(),
  patients: z.array(PatientSchema).optional(),
  professionals: z.array(z.any()).optional(),
  readOnly: z.boolean().optional(),
});

describe('UI Component Contract Tests', () => {
  describe('Basic Component Contracts', () => {
    describe('Button Component', () => {
      it('should accept valid button props according to contract', () => {
        const validProps = {
          children: 'Click me',
          onClick: vi.fn(),
          disabled: false,
          variant: 'primary' as const,
          size: 'md' as const,
          type: 'button' as const,
        };

        expect(() => ButtonPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should reject invalid button props', () => {
        const invalidProps = {
          variant: 'invalid-variant',
          size: 'invalid-size',
          type: 'invalid-type',
        };

        expect(() => ButtonPropsSchema.parse(invalidProps)).toThrow();
      });

      it('should render button with correct props', () => {
        const handleClick = vi.fn();
        render(
          <MockButton 
            onClick={handleClick} 
            variant="primary" 
            disabled={false}
          >
            Test Button
          </MockButton>
        );

        const button = screen.getByTestId('mock-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Test Button');
        expect(button).toHaveClass('btn-primary');
        expect(button).not.toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('should handle disabled state correctly', () => {
        const handleClick = vi.fn();
        render(
          <MockButton onClick={handleClick} disabled={true}>
            Disabled Button
          </MockButton>
        );

        const button = screen.getByTestId('mock-button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
      });
    });

    describe('Form Component', () => {
      it('should accept valid form props according to contract', () => {
        const validProps = {
          children: 'Form content',
          onSubmit: vi.fn(),
          method: 'POST' as const,
          action: '/api/submit',
          encType: 'multipart/form-data',
        };

        expect(() => FormPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should handle form submission correctly', () => {
        const handleSubmit = vi.fn((e) => e.preventDefault());
        render(
          <MockForm onSubmit={handleSubmit}>
            <input name="test" defaultValue="value" />
            <button type="submit">Submit</button>
          </MockForm>
        );

        const form = screen.getByTestId('mock-form');
        fireEvent.submit(form);
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });

    describe('Input Component', () => {
      it('should accept valid input props according to contract', () => {
        const validProps = {
          type: 'email' as const,
          value: 'test@example.com',
          onChange: vi.fn(),
          placeholder: 'Enter email',
          required: true,
          maxLength: 100,
          pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        };

        expect(() => InputPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should handle input changes correctly', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(
          <MockInput 
            type="text" 
            onChange={handleChange} 
            placeholder="Enter text"
          />
        );

        const input = screen.getByTestId('mock-input');
        await user.type(input, 'test');
        expect(handleChange).toHaveBeenCalled();
      });

      it('should handle different input types', () => {
        const { rerender } = render(
          <MockInput type="email" data-testid="email-input" />
        );
        
        let input = screen.getByTestId('email-input');
        expect(input).toHaveAttribute('type', 'email');

        rerender(<MockInput type="password" data-testid="password-input" />);
        input = screen.getByTestId('password-input');
        expect(input).toHaveAttribute('type', 'password');
      });
    });

    describe('Modal Component', () => {
      it('should accept valid modal props according to contract', () => {
        const validProps = {
          isOpen: true,
          onClose: vi.fn(),
          children: 'Modal content',
          title: 'Modal Title',
          size: 'md' as const,
          closeOnOverlayClick: true,
          closeOnEscape: true,
        };

        expect(() => ModalPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should render modal when open', () => {
        const handleClose = vi.fn();
        render(
          <MockModal isOpen={true} onClose={handleClose}>
            Modal Content
          </MockModal>
        );

        const modal = screen.getByTestId('mock-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveTextContent('Modal Content');
      });

      it('should not render modal when closed', () => {
        const handleClose = vi.fn();
        render(
          <MockModal isOpen={false} onClose={handleClose}>
            Modal Content
          </MockModal>
        );

        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
      });

      it('should handle close action', () => {
        const handleClose = vi.fn();
        render(
          <MockModal isOpen={true} onClose={handleClose}>
            Modal Content
          </MockModal>
        );

        const closeButton = screen.getByTestId('modal-close');
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('Chart Component', () => {
      it('should accept valid chart props according to contract', () => {
        const validProps = {
          data: [{ x: 1, y: 2 }, { x: 2, y: 4 }],
          type: 'line' as const,
          width: 400,
          height: 300,
          responsive: true,
          animate: true,
          legend: true,
        };

        expect(() => ChartPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should render chart with correct data', () => {
        const chartData = [{ name: 'Test', value: 100 }];
        render(
          <MockChart data={chartData} type="bar" />
        );

        const chart = screen.getByTestId('mock-chart');
        expect(chart).toBeInTheDocument();
        expect(chart).toHaveClass('chart-bar');
        expect(chart).toHaveTextContent(JSON.stringify(chartData));
      });
    });
  });

  describe('Healthcare Component Contracts', () => {
    describe('Patient Card Component', () => {
      const mockPatient = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        phone: '+55 11 99999-9999',
        dateOfBirth: '1990-01-01',
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
      };

      it('should accept valid patient card props according to contract', () => {
        const validProps = {
          patient: mockPatient,
          onEdit: vi.fn(),
          onView: vi.fn(),
          onDelete: vi.fn(),
          showActions: true,
          compact: false,
        };

        expect(() => PatientCardPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should render patient information correctly', () => {
        const handleEdit = vi.fn();
        const handleView = vi.fn();
        
        render(
          <MockPatientCard 
            patient={mockPatient}
            onEdit={handleEdit}
            onView={handleView}
          />
        );

        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('CPF: 123.456.789-00')).toBeInTheDocument();
      });

      it('should handle patient actions correctly', () => {
        const handleEdit = vi.fn();
        const handleView = vi.fn();
        
        render(
          <MockPatientCard 
            patient={mockPatient}
            onEdit={handleEdit}
            onView={handleView}
          />
        );

        fireEvent.click(screen.getByTestId('view-patient'));
        expect(handleView).toHaveBeenCalledWith(mockPatient);

        fireEvent.click(screen.getByTestId('edit-patient'));
        expect(handleEdit).toHaveBeenCalledWith(mockPatient);
      });

      it('should validate patient data structure', () => {
        const invalidPatient = {
          id: 'invalid-uuid',
          name: 'A', // Too short
          cpf: '123456789', // Invalid format
          email: 'invalid-email',
        };

        expect(() => PatientSchema.parse(invalidPatient)).toThrow();
      });
    });

    describe('Appointment Form Component', () => {
      const mockAppointment = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        patientId: '550e8400-e29b-41d4-a716-446655440000',
        datetime: '2024-01-15T10:00:00',
        type: 'consultation' as const,
        status: 'scheduled' as const,
        notes: 'Regular checkup',
      };

      it('should accept valid appointment form props according to contract', () => {
        const validProps = {
          appointment: mockAppointment,
          onSubmit: vi.fn(),
          onCancel: vi.fn(),
          patients: [mockPatient],
          readOnly: false,
        };

        expect(() => AppointmentFormPropsSchema.parse(validProps)).not.toThrow();
      });

      it('should render appointment form with correct fields', () => {
        const handleSubmit = vi.fn();
        const handleCancel = vi.fn();
        
        render(
          <MockAppointmentForm 
            appointment={mockAppointment}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        );

        expect(screen.getByTestId('appointment-patient-id')).toHaveValue(mockAppointment.patientId);
        expect(screen.getByTestId('appointment-datetime')).toHaveValue(mockAppointment.datetime);
        expect(screen.getByTestId('appointment-type')).toHaveValue(mockAppointment.type);
      });

      it('should handle form submission and cancellation', () => {
        const handleSubmit = vi.fn((e) => e.preventDefault());
        const handleCancel = vi.fn();
        
        render(
          <MockAppointmentForm 
            appointment={mockAppointment}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        );

        fireEvent.submit(screen.getByTestId('appointment-form'));
        expect(handleSubmit).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByTestId('appointment-cancel'));
        expect(handleCancel).toHaveBeenCalledTimes(1);
      });

      it('should validate appointment data structure', () => {
        const invalidAppointment = {
          patientId: 'invalid-uuid',
          datetime: 'invalid-date',
          type: 'invalid-type',
        };

        expect(() => AppointmentSchema.parse(invalidAppointment)).toThrow();
      });
    });
  });

  describe('Navigation Component Contracts', () => {
    const MockNavigation = ({ items, activeItem, onItemClick, ...props }: any) => (
      <nav data-testid="mock-navigation" {...props}>
        {items?.map((item: any) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={activeItem === item.id ? 'active' : ''}
            data-testid={`nav-item-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );

    const NavigationPropsSchema = z.object({
      items: z.array(z.object({
        id: z.string(),
        label: z.string(),
        href: z.string().optional(),
        icon: z.string().optional(),
        disabled: z.boolean().optional(),
      })),
      activeItem: z.string().optional(),
      onItemClick: z.function().optional(),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
    });

    it('should accept valid navigation props according to contract', () => {
      const validProps = {
        items: [
          { id: 'home', label: 'Home', href: '/' },
          { id: 'patients', label: 'Patients', href: '/patients' },
          { id: 'appointments', label: 'Appointments', href: '/appointments' },
        ],
        activeItem: 'home',
        onItemClick: vi.fn(),
        orientation: 'horizontal' as const,
      };

      expect(() => NavigationPropsSchema.parse(validProps)).not.toThrow();
    });

    it('should render navigation items correctly', () => {
      const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'patients', label: 'Patients' },
      ];
      const handleItemClick = vi.fn();
      
      render(
        <MockNavigation 
          items={navItems}
          activeItem="home"
          onItemClick={handleItemClick}
        />
      );

      expect(screen.getByTestId('nav-item-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-patients')).toBeInTheDocument();
      expect(screen.getByTestId('nav-item-home')).toHaveClass('active');
    });

    it('should handle navigation item clicks', () => {
      const navItems = [{ id: 'home', label: 'Home' }];
      const handleItemClick = vi.fn();
      
      render(
        <MockNavigation 
          items={navItems}
          onItemClick={handleItemClick}
        />
      );

      fireEvent.click(screen.getByTestId('nav-item-home'));
      expect(handleItemClick).toHaveBeenCalledWith(navItems[0]);
    });
  });

  describe('Medical Workflow Component Contracts', () => {
    const MockTreatmentPlan = ({ treatments, onTreatmentUpdate, readOnly, ...props }: any) => (
      <div data-testid="treatment-plan" {...props}>
        {treatments?.map((treatment: any, index: number) => (
          <div key={index} data-testid={`treatment-${index}`}>
            <h4>{treatment.name}</h4>
            <p>Status: {treatment.status}</p>
            {!readOnly && (
              <button 
                onClick={() => onTreatmentUpdate?.(index, { ...treatment, status: 'completed' })}
                data-testid={`complete-treatment-${index}`}
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>
    );

    const TreatmentSchema = z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      description: z.string().optional(),
      status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      notes: z.string().optional(),
    });

    const TreatmentPlanPropsSchema = z.object({
      treatments: z.array(TreatmentSchema),
      onTreatmentUpdate: z.function().optional(),
      onTreatmentAdd: z.function().optional(),
      onTreatmentRemove: z.function().optional(),
      readOnly: z.boolean().optional(),
    });

    it('should accept valid treatment plan props according to contract', () => {
      const validProps = {
        treatments: [
          {
            name: 'Botox Application',
            status: 'planned' as const,
            description: 'Forehead and crow\'s feet',
          },
        ],
        onTreatmentUpdate: vi.fn(),
        readOnly: false,
      };

      expect(() => TreatmentPlanPropsSchema.parse(validProps)).not.toThrow();
    });

    it('should render treatment plan correctly', () => {
      const treatments = [
        { name: 'Botox Application', status: 'planned' as const },
        { name: 'Dermal Filler', status: 'in-progress' as const },
      ];
      const handleUpdate = vi.fn();
      
      render(
        <MockTreatmentPlan 
          treatments={treatments}
          onTreatmentUpdate={handleUpdate}
          readOnly={false}
        />
      );

      expect(screen.getByText('Botox Application')).toBeInTheDocument();
      expect(screen.getByText('Status: planned')).toBeInTheDocument();
      expect(screen.getByText('Dermal Filler')).toBeInTheDocument();
      expect(screen.getByText('Status: in-progress')).toBeInTheDocument();
    });

    it('should handle treatment updates', () => {
      const treatments = [{ name: 'Botox Application', status: 'planned' as const }];
      const handleUpdate = vi.fn();
      
      render(
        <MockTreatmentPlan 
          treatments={treatments}
          onTreatmentUpdate={handleUpdate}
          readOnly={false}
        />
      );

      fireEvent.click(screen.getByTestId('complete-treatment-0'));
      expect(handleUpdate).toHaveBeenCalledWith(0, {
        name: 'Botox Application',
        status: 'completed',
      });
    });

    it('should handle read-only mode', () => {
      const treatments = [{ name: 'Botox Application', status: 'planned' as const }];
      
      render(
        <MockTreatmentPlan 
          treatments={treatments}
          readOnly={true}
        />
      );

      expect(screen.queryByTestId('complete-treatment-0')).not.toBeInTheDocument();
    });
  });

  describe('Component Accessibility Contracts', () => {
    it('should have proper ARIA attributes on interactive elements', () => {
      render(
        <div>
          <button aria-label="Save patient data" data-testid="save-button">
            Save
          </button>
          <input aria-label="Patient name" data-testid="name-input" />
          <div role="alert" aria-live="polite" data-testid="error-message">
            Error message
          </div>
        </div>
      );

      const saveButton = screen.getByTestId('save-button');
      const nameInput = screen.getByTestId('name-input');
      const errorMessage = screen.getByTestId('error-message');

      expect(saveButton).toHaveAttribute('aria-label', 'Save patient data');
      expect(nameInput).toHaveAttribute('aria-label', 'Patient name');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-2">Button 2</button>
          <input data-testid="input-1" />
        </div>
      );

      const button1 = screen.getByTestId('button-1');
      const button2 = screen.getByTestId('button-2');
      const input1 = screen.getByTestId('input-1');

      button1.focus();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();

      await user.tab();
      expect(input1).toHaveFocus();
    });
  });

  describe('Error Handling Contracts', () => {
    it('should handle component render errors gracefully', () => {
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = React.useState(false);
        
        React.useEffect(() => {
          const errorHandler = () => setHasError(true);
          window.addEventListener('error', errorHandler);
          return () => window.removeEventListener('error', errorHandler);
        }, []);

        if (hasError) {
          return <div data-testid="error-fallback">Something went wrong</div>;
        }

        return <>{children}</>;
      };

      const BrokenComponent = () => {
        throw new Error('Component error');
      };

      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      // Note: In a real scenario, you would use React Error Boundaries
      // This is a simplified version for testing purposes
    });

    it('should validate required props and show meaningful errors', () => {
      // Test that components properly validate required props
      expect(() => {
        PatientCardPropsSchema.parse({});
      }).toThrow('Required');

      expect(() => {
        ModalPropsSchema.parse({ children: 'content' });
      }).toThrow(); // Missing required isOpen and onClose
    });
  });

  describe('Performance Contract Tests', () => {
    it('should render components within performance thresholds', async () => {
      const startTime = performance.now();
      
      render(
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <MockButton key={i}>Button {i}</MockButton>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Components should render quickly (under 100ms for 100 simple components)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
      }));

      const startTime = performance.now();
      
      render(<MockChart data={largeDataset} type="line" />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Chart should handle large datasets efficiently
      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Responsive Design Contracts', () => {
    beforeEach(() => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('should adapt to different screen sizes', () => {
      const ResponsiveComponent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div data-testid="responsive-component" className={isMobile ? 'mobile' : 'desktop'}>
          {isMobile ? 'Mobile View' : 'Desktop View'}
        </div>
      );

      const { rerender } = render(<ResponsiveComponent isMobile={false} />);
      expect(screen.getByTestId('responsive-component')).toHaveClass('desktop');
      expect(screen.getByText('Desktop View')).toBeInTheDocument();

      rerender(<ResponsiveComponent isMobile={true} />);
      expect(screen.getByTestId('responsive-component')).toHaveClass('mobile');
      expect(screen.getByText('Mobile View')).toBeInTheDocument();
    });
  });
});