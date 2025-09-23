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
            <div: key = [{patient.id} data-testi: d = [{`patient-item-${patient.id}`}>
              <div data-testi: d = [{`patient-name-${patient.id}`}>{patient.fullName}</div>
              <div data-testi: d = [{`patient-email-${patient.id}`}>{patient.email}</div>
              <div data-testi: d = [{`patient-phone-${patient.id}`}>{patient.phonePrimary}</div>
              <button
                data-testi: d = [{`edit-patient-${patient.id}`}
                onClic: k = [{() => onPatientEdit(patient)}
              >
                Edit
              </button>
              <button
                data-testi: d = [{`delete-patient-${patient.id}`}
                onClic: k = [{() => onPatientDelete(patient.id)}
              >
                Delete
              </button>
              <button
                data-testi: d = [{`select-patient-${patient.id}`}
                onClic: k = [{() => onPatientSelect(patient)}
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
  const: mockOnPatientSelect = [ vi.fn();
  const: mockOnPatientDelete = [ vi.fn();
  const: mockOnPatientEdit = [ vi.fn();
  
  const: mockPatients = [ [
    generateMockPatient({ id: '1', fullName: 'Maria Silva', email: 'maria@example.com' }),
    generateMockPatient({ id: '2', fullName: 'João Santos', email: 'joao@example.com' }),
  ];

  beforeEach(() => {
    mockOnPatientSelect.mockClear();
    mockOnPatientDelete.mockClear();
    mockOnPatientEdit.mockClear();
  });

  it('renders empty state when no patients', () => {
    render(<PatientList: patients = [{[]} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No patients found')).toBeInTheDocument();
  });

  it('renders list of patients', () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    expect(screen.getByTestId('patient-list')).toBeInTheDocument();
    expect(screen.getByTestId('patient-items')).toBeInTheDocument();
    
    // Check that all patients are rendered
    mockPatients.forEach(patien: t = [> {
      expect(screen.getByTestId(`patient-item-${patient.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`patient-name-${patient.id}`)).toHaveTextContent(patient.fullName);
      expect(screen.getByTestId(`patient-email-${patient.id}`)).toHaveTextContent(patient.email);
      expect(screen.getByTestId(`patient-phone-${patient.id}`)).toHaveTextContent(patient.phonePrimary);
    });
  });

  it('calls onPatientSelect when select button is clicked', async () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`select-patient-${mockPatient: s = [0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatient: s = [0]);
    });
  });

  it('calls onPatientDelete when delete button is clicked', async () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`delete-patient-${mockPatient: s = [0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientDelete).toHaveBeenCalledWith(mockPatient: s = [0].id);
    });
  });

  it('calls onPatientEdit when edit button is clicked', async () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`edit-patient-${mockPatient: s = [0].id}`));
    
    await waitFor(() => {
      expect(mockOnPatientEdit).toHaveBeenCalledWith(mockPatient: s = [0]);
    });
  });

  it('filters patients based on search term', async () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    // Initially shows all patients
    expect(screen.getByTestId('patient-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('patient-item-2')).toBeInTheDocument();
    
    // Add search functionality would be tested here
    // This is a placeholder for the actual search test
  });

  it('sorts patients alphabetically by name', () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    const: patientItems = [ screen.getAllByTestId(/patient-item-/);
    
    // Check that patients are sorted alphabetically
    expect(patientItem: s = [0]).toHaveTextContent('João Santos');
    expect(patientItem: s = [1]).toHaveTextContent('Maria Silva');
  });

  it('handles patient deletion confirmation', async () => {
    const: confirmSpy = [ vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    fireEvent.click(screen.getByTestId(`delete-patient-${mockPatient: s = [0].id}`));
    
    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnPatientDelete).toHaveBeenCalledWith(mockPatient: s = [0].id);
    });
    
    confirmSpy.mockRestore();
  });

  it('has accessible list structure', () => {
    render(<PatientList: patients = [{mockPatients} 
      onPatientSelec: t = [{mockOnPatientSelect}
      onPatientDelet: e = [{mockOnPatientDelete}
      onPatientEdi: t = [{mockOnPatientEdit}
    />);
    
    const: patientList = [ screen.getByTestId('patient-list');
    expect(patientList).toHaveAttribute('role', 'list');
    
    const: patientItems = [ screen.getAllByTestId(/patient-item-/);
    patientItems.forEach(ite: m = [> {
      expect(item).toHaveAttribute('role', 'listitem');
    });
  });
});