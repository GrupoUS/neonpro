import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { generateMockPatient } from '@/test/utils';

// Mock patient list component
const PatientList = ({ patients, onPatientSelect, onPatientDelete, onPatientEdit }) => {
  return (
    <div data-testid="patient-list">
      {patients.length === 0 ? (
        <div data-testid="empty-state">No patients found</div>
      ) : (
        <div data-testid="patient-items">
          {patients.map((patient) => (
            <div key={patient.id} data-testid={`patient-item-${patient.id}`}>
              <div data-testid={`patient-name-${patient.id}`}>{patient.fullName}</div>
              <div data-testid={`patient-email-${patient.id}`}>{patient.email}</div>
              <div data-testid={`patient-phone-${patient.id}`}>{patient.phonePrimary}</div>
              <button
                data-testid={`edit-patient-${patient.id}`}
                onClick={() => onPatientEdit(patient)}
              >
                Edit
              </button>
              <button
                data-testid={`delete-patient-${patient.id}`}
                onClick={() => onPatientDelete(patient.id)}
              >
                Delete
              </button>
              <button
                data-testid={`select-patient-${patient.id}`}
                onClick={() => onPatientSelect(patient)}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('PatientList', () => {
  const mockOnPatientSelect = vi.fn();
  const mockOnPatientDelete = vi.fn();
  const mockOnPatientEdit = vi.fn();
  
  const mockPatients = [
    generateMockPatient({ id: '1', fullName: 'Maria Silva', email: 'maria@example.com' }),
    generateMockPatient({ id: '2', fullName: 'João Santos', email: 'joao@example.com' }),
  ];

  beforeEach(() => {
    mockOnPatientSelect.mockClear();
    mockOnPatientDelete.mockClear();
    mockOnPatientEdit.mockClear();
  });

  it('renders empty state when no patients', () => {
    render(<PatientList 
      patients={[]} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No patients found')).toBeInTheDocument();
  });

  it('renders list of patients', () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
    expect(screen.getByTestId('patient-items')).toBeInTheDocument();
    
    // Check that all patients are rendered
    mockPatients.forEach(patient => {
      expect(screen.getByTestId(`patient-item-${patient.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`patient-name-${patient.id}`)).toHaveTextContent(patient.fullName);
      expect(screen.getByTestId(`patient-email-${patient.id}`)).toHaveTextContent(patient.email);
      expect(screen.getByTestId(`patient-phone-${patient.id}`)).toHaveTextContent(patient.phonePrimary);
    });
  });

  it('calls onPatientSelect when select button is clicked', async () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`select-patient-${mockPatients[0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatients[0]);
    });
  });

  it('calls onPatientDelete when delete button is clicked', async () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`delete-patient-${mockPatients[0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientDelete).toHaveBeenCalledWith(mockPatients[0].id);
    });
  });

  it('calls onPatientEdit when edit button is clicked', async () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`edit-patient-${mockPatients[0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientEdit).toHaveBeenCalledWith(mockPatients[0]);
    });
  });

  it('filters patients based on search term', async () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    // Initially shows all patients
    expect(screen.getByTestId('patient-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-item-2')).toBeInTheDocument();
    
    // Add search functionality would be tested here
    // This is a placeholder for the actual search test
  });

  it('sorts patients alphabetically by name', () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    const patientItems = screen.getAllByTestId(/patient-item-/);
    
    // Check that patients are sorted alphabetically
    expect(patientItems[0]).toHaveTextContent('João Santos');
    expect(patientItems[1]).toHaveTextContent('Maria Silva');
  });

  it('handles patient deletion confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`delete-patient-${mockPatients[0].id}`));
    
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnPatientDelete).toHaveBeenCalledWith(mockPatients[0].id);
    });
    
    confirmSpy.mockRestore();
  });

  it('has accessible list structure', () => {
    render(<PatientList 
      patients={mockPatients} 
      onPatientSelect={mockOnPatientSelect}
      onPatientDelete={mockOnPatientDelete}
      onPatientEdit={mockOnPatientEdit}
    />);
    
    const patientList = screen.getByTestId('patient-list');
    expect(patientList).toHaveAttribute('role', 'list');
    
    const patientItems = screen.getAllByTestId(/patient-item-/);
    patientItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'listitem');
    });
  });
});