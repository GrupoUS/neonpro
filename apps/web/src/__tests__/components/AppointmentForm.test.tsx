import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { generateMockAppointment } from '@/test/utils';

// Mock appointment form component
const AppointmentForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = React.useState(initialData || {
    patientId: '',
    professionalId: '',
    startTime: '',
    endTime: '',
    title: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} data-testid="appointment-form">
      <input
        data-testid="patient-id-input"
        value={formData.patientId}
        onChange={(e) => handleChange('patientId', e.target.value)}
        placeholder="Patient ID"
      />
      <input
        data-testid="professional-id-input"
        value={formData.professionalId}
        onChange={(e) => handleChange('professionalId', e.target.value)}
        placeholder="Professional ID"
      />
      <input
        data-testid="start-time-input"
        type="datetime-local"
        value={formData.startTime}
        onChange={(e) => handleChange('startTime', e.target.value)}
      />
      <input
        data-testid="end-time-input"
        type="datetime-local"
        value={formData.endTime}
        onChange={(e) => handleChange('endTime', e.target.value)}
      />
      <input
        data-testid="title-input"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="Appointment Title"
      />
      <textarea
        data-testid="notes-input"
        value={formData.notes}
        onChange={(e) => handleChange('notes', e.target.value)}
        placeholder="Notes"
      />
      <button type="submit" data-testid="submit-button">
        {initialData ? 'Update Appointment' : 'Create Appointment'}
      </button>
    </form>
  );
};

describe('AppointmentForm', () => {
  const mockOnSubmit = vi.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all fields', () => {
    render(<AppointmentForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByTestId('appointment-form')).toBeInTheDocument();
    expect(screen.getByTestId('patient-id-input')).toBeInTheDocument();
    expect(screen.getByTestId('professional-id-input')).toBeInTheDocument();
    expect(screen.getByTestId('start-time-input')).toBeInTheDocument();
    expect(screen.getByTestId('end-time-input')).toBeInTheDocument();
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('notes-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(<AppointmentForm onSubmit={mockOnSubmit} />);
    
    const formData = generateMockAppointment();
    
    fireEvent.change(screen.getByTestId('patient-id-input'), {
      target: { value: formData.patientId },
    });
    fireEvent.change(screen.getByTestId('professional-id-input'), {
      target: { value: formData.professionalId },
    });
    fireEvent.change(screen.getByTestId('start-time-input'), {
      target: { value: formData.startTime },
    });
    fireEvent.change(screen.getByTestId('end-time-input'), {
      target: { value: formData.endTime },
    });
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: formData.title },
    });
    fireEvent.change(screen.getByTestId('notes-input'), {
      target: { value: formData.notes },
    });
    
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        patientId: formData.patientId,
        professionalId: formData.professionalId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        title: formData.title,
        notes: formData.notes,
      });
    });
  });

  it('displays initial data when provided', () => {
    const initialData = generateMockAppointment();
    render(<AppointmentForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    expect(screen.getByTestId('patient-id-input')).toHaveValue(initialData.patientId);
    expect(screen.getByTestId('professional-id-input')).toHaveValue(initialData.professionalId);
    expect(screen.getByTestId('start-time-input')).toHaveValue(initialData.startTime);
    expect(screen.getByTestId('end-time-input')).toHaveValue(initialData.endTime);
    expect(screen.getByTestId('title-input')).toHaveValue(initialData.title);
    expect(screen.getByTestId('notes-input')).toHaveValue(initialData.notes);
  });

  it('validates required fields', async () => {
    render(<AppointmentForm onSubmit={mockOnSubmit} />);
    
    // Try to submit empty form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    // Should not call onSubmit if validation fails
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('updates submit button text when editing', () => {
    const initialData = generateMockAppointment();
    render(<AppointmentForm onSubmit={mockOnSubmit} initialData={initialData} />);
    
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Appointment');
  });

  it('has accessible form elements', () => {
    render(<AppointmentForm onSubmit={mockOnSubmit} />);
    
    const form = screen.getByTestId('appointment-form');
    expect(form).toHaveAttribute('role', 'form');
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  });
});