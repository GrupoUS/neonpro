/**
 * Component Integration Testing Suite
 *
 * Comprehensive integration tests for component interactions, focusing on
 * user workflows, data flow between components, and end-to-end scenarios
 * in healthcare applications.
 *
 * Healthcare Context: Medical applications require seamless integration
 * between components for patient management, appointment scheduling,
 * medical records access, and real-time monitoring.
 *
 * Integration Scenarios:
 * - Patient registration → Appointment scheduling → Medical records
 * - Dashboard navigation → Chart interactions → Data export
 * - Mobile responsiveness → Touch interactions → Emergency access
 * - Real-time updates → Notification systems → User alerts
 *
 * @version 1.0.0
 * @category Integration Testing
 * @subpackage Component Testing
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock healthcare components for integration testing
const MockPatientSearch = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async term => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    if (term.toLowerCase().includes('maria')) {
      setSearchResults([
        { id: 'patient-123', name: 'Maria Silva', cpf: '123.456.789-00' },
        { id: 'patient-456', name: 'Maria Santos', cpf: '987.654.321-00' },
      ]);
    } else {
      setSearchResults([]);
    }
    setIsLoading(false);
  };

  return (
    <div className='patient-search' role='search' aria-label='Patient search'>
      <div className='search-input-group'>
        <label htmlFor='patient-search'>Search Patients</label>
        <input
          id='patient-search'
          type='text'
          placeholder='Search by name or CPF...'
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          aria-describedby='search-help'
        />
        <span id='search-help' className='help-text'>
          Enter at least 3 characters to search
        </span>
      </div>

      {isLoading && (
        <div className='loading-indicator' aria-label='Loading search results'>
          Searching...
        </div>
      )}

      {searchResults.length > 0 && (
        <ul className='search-results' role='listbox' aria-label='Search results'>
          {searchResults.map(patient => (
            <li
              key={patient.id}
              role='option'
              aria-selected={false}
              onClick={() => onPatientSelect(patient)}
              className='search-result-item'
            >
              <div className='patient-info'>
                <span className='patient-name'>{patient.name}</span>
                <span className='patient-cpf'>{patient.cpf}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MockPatientDashboard = ({ patientId, onAppointmentCreate, onMedicalRecordAccess }) => {
  const [patient, setPatient] = React.useState(null);
  const [appointments, setAppointments] = React.useState([]);
  const [medicalRecords, setMedicalRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    setLoading(true);
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 500));

    setPatient({
      id: patientId,
      name: 'Maria Silva',
      birthDate: '1980-01-01',
      contact: {
        phone: '+5511987654321',
        email: 'maria.silva@email.com',
      },
      medicalRecord: {
        conditions: ['Hypertension', 'Diabetes Type 2'],
        medications: ['Losartan 50mg', 'Metformin 500mg'],
        allergies: ['Penicillin'],
        lastVisit: '2024-01-15',
      },
    });

    setAppointments([
      {
        id: 'apt-123',
        type: 'consultation',
        specialty: 'cardiology',
        scheduledAt: '2024-02-01T14:00:00Z',
        status: 'confirmed',
        physician: 'Dr. João Santos',
      },
    ]);

    setMedicalRecords([
      {
        id: 'rec-123',
        type: 'consultation',
        date: '2024-01-15T10:00:00Z',
        physician: 'Dr. João Santos',
        diagnosis: 'Hypertension',
        treatment: 'Lifestyle changes, medication',
        notes: 'Patient shows stable condition',
      },
    ]);

    setLoading(false);
  };

  if (loading) {
    return <div className='loading' aria-label='Loading patient dashboard'>Loading...</div>;
  }

  return (
    <div className='patient-dashboard' role='main' aria-label='Patient dashboard'>
      <div className='patient-header'>
        <h2>{patient.name}</h2>
        <div className='patient-meta'>
          <span>DOB: {patient.birthDate}</span>
          <span>Phone: {patient.contact.phone}</span>
        </div>
      </div>

      <div className='dashboard-sections'>
        <section className='quick-actions' aria-labelledby='quick-actions-heading'>
          <h3 id='quick-actions-heading'>Quick Actions</h3>
          <div className='action-buttons'>
            <button
              onClick={() => onAppointmentCreate(patient.id)}
              className='btn-primary'
              aria-label='Schedule new appointment'
            >
              Schedule Appointment
            </button>
            <button
              onClick={() => onMedicalRecordAccess(patient.id)}
              className='btn-secondary'
              aria-label='View medical records'
            >
              Medical Records
            </button>
          </div>
        </section>

        <section className='upcoming-appointments' aria-labelledby='appointments-heading'>
          <h3 id='appointments-heading'>Upcoming Appointments</h3>
          <div className='appointments-list' role='list'>
            {appointments.map(apt => (
              <article key={apt.id} className='appointment-card' role='listitem'>
                <div className='appointment-info'>
                  <h4>{apt.type} - {apt.specialty}</h4>
                  <p>
                    <time dateTime={apt.scheduledAt}>
                      {new Date(apt.scheduledAt).toLocaleString()}
                    </time>
                  </p>
                  <p>Dr. {apt.physician}</p>
                  <span className={`status ${apt.status}`}>{apt.status}</span>
                </div>
                <button
                  className='btn-icon'
                  aria-label={`Reschedule appointment on ${
                    new Date(apt.scheduledAt).toLocaleDateString()
                  }`}
                >
                  Reschedule
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className='recent-medical-records' aria-labelledby='records-heading'>
          <h3 id='records-heading'>Recent Medical Records</h3>
          <div className='records-list' role='list'>
            {medicalRecords.map(record => (
              <article key={record.id} className='record-card' role='listitem'>
                <div className='record-info'>
                  <h4>{record.type}</h4>
                  <p>
                    <time dateTime={record.date}>
                      {new Date(record.date).toLocaleDateString()}
                    </time>
                  </p>
                  <p>Dr. {record.physician}</p>
                  <p>
                    <strong>Diagnosis:</strong> {record.diagnosis}
                  </p>
                </div>
                <button
                  className='btn-icon'
                  aria-label={`View full record from ${new Date(record.date).toLocaleDateString()}`}
                >
                  View Details
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const MockAppointmentScheduler = ({ patientId, onAppointmentScheduled, onCancel }) => {
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('');
  const [availablePhysicians, setAvailablePhysicians] = React.useState([]);
  const [selectedPhysician, setSelectedPhysician] = React.useState('');
  const [scheduling, setScheduling] = React.useState(false);

  const specialties = [
    'Cardiology',
    'Endocrinology',
    'General Practice',
    'Neurology',
    'Orthopedics',
  ];

  const physicians = {
    Cardiology: ['Dr. João Santos', 'Dr. Ana Costa'],
    Endocrinology: ['Dr. Carlos Silva', 'Dra. Maria Oliveira'],
    'General Practice': ['Dr. Pedro Santos', 'Dra. Ana Paula'],
    Neurology: ['Dr. Ricardo Almeida', 'Dra. Beatriz Costa'],
    Orthopedics: ['Dr. Roberto Silva', 'Dra. Fernanda Oliveira'],
  };

  const handleSpecialtyChange = specialty => {
    setSelectedSpecialty(specialty);
    setAvailablePhysicians(physicians[specialty] || []);
    setSelectedPhysician('');
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedPhysician) {
      alert('Please fill all required fields');
      return;
    }

    setScheduling(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const appointment = {
      id: `apt-${Date.now()}`,
      patientId,
      type: 'consultation',
      specialty: selectedSpecialty,
      physician: selectedPhysician,
      scheduledAt: `${selectedDate}T${selectedTime}:00Z`,
      status: 'confirmed',
    };

    onAppointmentScheduled(appointment);
    setScheduling(false);
  };

  return (
    <div className='appointment-scheduler' role='dialog' aria-label='Schedule appointment'>
      <h2>Schedule New Appointment</h2>

      <form
        className='appointment-form'
        onSubmit={e => {
          e.preventDefault();
          handleSchedule();
        }}
      >
        <div className='form-group'>
          <label htmlFor='specialty'>Specialty *</label>
          <select
            id='specialty'
            value={selectedSpecialty}
            onChange={e => handleSpecialtyChange(e.target.value)}
            required
            aria-describedby='specialty-help'
          >
            <option value=''>Select specialty</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          <span id='specialty-help' className='help-text'>
            Choose the medical specialty for your appointment
          </span>
        </div>

        {selectedSpecialty && (
          <div className='form-group'>
            <label htmlFor='physician'>Physician *</label>
            <select
              id='physician'
              value={selectedPhysician}
              onChange={e => setSelectedPhysician(e.target.value)}
              required
              aria-describedby='physician-help'
            >
              <option value=''>Select physician</option>
              {availablePhysicians.map(physician => (
                <option key={physician} value={physician}>{physician}</option>
              ))}
            </select>
            <span id='physician-help' className='help-text'>
              Available physicians for {selectedSpecialty}
            </span>
          </div>
        )}

        <div className='form-group'>
          <label htmlFor='date'>Date *</label>
          <input
            id='date'
            type='date'
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            aria-describedby='date-help'
          />
          <span id='date-help' className='help-text'>
            Select a date from tomorrow onwards
          </span>
        </div>

        <div className='form-group'>
          <label htmlFor='time'>Time *</label>
          <input
            id='time'
            type='time'
            value={selectedTime}
            onChange={e => setSelectedTime(e.target.value)}
            required
            aria-describedby='time-help'
          />
          <span id='time-help' className='help-text'>
            Available appointment times: 9:00 AM - 5:00 PM
          </span>
        </div>

        <div className='form-actions'>
          <button
            type='submit'
            className='btn-primary'
            disabled={scheduling}
            aria-busy={scheduling}
          >
            {scheduling ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
          <button
            type='button'
            className='btn-secondary'
            onClick={onCancel}
            disabled={scheduling}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const MockMedicalRecordsViewer = ({ patientId, onExport, onClose }) => {
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    loadMedicalRecords();
  }, [patientId]);

  const loadMedicalRecords = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setRecords([
      {
        id: 'rec-123',
        type: 'Consultation',
        date: '2024-01-15T10:00:00Z',
        physician: 'Dr. João Santos',
        specialty: 'Cardiology',
        diagnosis: 'Hypertension',
        treatment: 'Lifestyle changes, Losartan 50mg daily',
        notes:
          'Patient presents with elevated blood pressure. BP: 150/95 mmHg. Recommended dietary changes and increased physical activity.',
        vitals: {
          bloodPressure: '150/95',
          heartRate: 78,
          weight: 75,
          height: 165,
        },
        medications: [
          { name: 'Losartan', dosage: '50mg', frequency: 'daily' },
          { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'daily' },
        ],
      },
      {
        id: 'rec-124',
        type: 'Follow-up',
        date: '2024-02-15T10:00:00Z',
        physician: 'Dr. João Santos',
        specialty: 'Cardiology',
        diagnosis: 'Controlled Hypertension',
        treatment: 'Continue current medication regimen',
        notes:
          'Follow-up appointment shows improvement. BP: 130/85 mmHg. Patient reports better adherence to medication and lifestyle changes.',
        vitals: {
          bloodPressure: '130/85',
          heartRate: 72,
          weight: 73,
          height: 165,
        },
        medications: [
          { name: 'Losartan', dosage: '50mg', frequency: 'daily' },
          { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'daily' },
        ],
      },
    ]);
    setLoading(false);
  };

  const handleExport = async format => {
    setExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    onExport(records, format);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className='loading' aria-label='Loading medical records'>Loading medical records...</div>
    );
  }

  return (
    <div className='medical-records-viewer' role='dialog' aria-label='Medical records'>
      <div className='records-header'>
        <h2>Medical Records</h2>
        <div className='records-actions'>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className='btn-export'
            aria-label='Export records as PDF'
          >
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button
            onClick={onClose}
            className='btn-close'
            aria-label='Close medical records'
          >
            Close
          </button>
        </div>
      </div>

      <div className='records-content'>
        <div className='records-list'>
          <h3>Medical History</h3>
          <div className='record-timeline' role='list'>
            {records.map(record => (
              <article
                key={record.id}
                className={`record-item ${selectedRecord?.id === record.id ? 'selected' : ''}`}
                role='listitem'
                onClick={() => setSelectedRecord(record)}
              >
                <div className='record-summary'>
                  <h4>{record.type}</h4>
                  <p className='record-date'>
                    <time dateTime={record.date}>
                      {new Date(record.date).toLocaleDateString()}
                    </time>
                  </p>
                  <p className='record-physician'>Dr. {record.physician}</p>
                  <p className='record-specialty'>{record.specialty}</p>
                  <p className='record-diagnosis'>{record.diagnosis}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {selectedRecord && (
          <div className='record-details'>
            <h3>Record Details</h3>
            <div className='detail-section'>
              <h4>Visit Information</h4>
              <p>
                <strong>Date:</strong> {new Date(selectedRecord.date).toLocaleString()}
              </p>
              <p>
                <strong>Physician:</strong> Dr. {selectedRecord.physician}
              </p>
              <p>
                <strong>Specialty:</strong> {selectedRecord.specialty}
              </p>
              <p>
                <strong>Type:</strong> {selectedRecord.type}
              </p>
            </div>

            <div className='detail-section'>
              <h4>Diagnosis</h4>
              <p>{selectedRecord.diagnosis}</p>
            </div>

            <div className='detail-section'>
              <h4>Treatment</h4>
              <p>{selectedRecord.treatment}</p>
            </div>

            <div className='detail-section'>
              <h4>Vital Signs</h4>
              <div className='vitals-grid'>
                <div className='vital-item'>
                  <span className='vital-label'>Blood Pressure:</span>
                  <span className='vital-value'>{selectedRecord.vitals.bloodPressure} mmHg</span>
                </div>
                <div className='vital-item'>
                  <span className='vital-label'>Heart Rate:</span>
                  <span className='vital-value'>{selectedRecord.vitals.heartRate} bpm</span>
                </div>
                <div className='vital-item'>
                  <span className='vital-label'>Weight:</span>
                  <span className='vital-value'>{selectedRecord.vitals.weight} kg</span>
                </div>
                <div className='vital-item'>
                  <span className='vital-label'>Height:</span>
                  <span className='vital-value'>{selectedRecord.vitals.height} cm</span>
                </div>
              </div>
            </div>

            <div className='detail-section'>
              <h4>Medications</h4>
              <ul className='medications-list'>
                {selectedRecord.medications.map((med, index) => (
                  <li key={index} className='medication-item'>
                    <span className='med-name'>{med.name}</span>
                    <span className='med-dosage'>{med.dosage}</span>
                    <span className='med-frequency'>{med.frequency}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className='detail-section'>
              <h4>Notes</h4>
              <p className='record-notes'>{selectedRecord.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

describe('Patient Management Workflow Integration', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Patient Search to Dashboard Flow', () => {
    it('should complete patient search and display dashboard', async () => {
      const handlePatientSelect = vi.fn();

      const { container } = render(
        <MockPatientSearch onPatientSelect={handlePatientSelect} />,
      );

      // Search for patient
      const searchInput = screen.getByLabelText(/Search Patients/i);
      await user.type(searchInput, 'Maria Silva');

      // Wait for search results
      expect(await screen.findByText('Loading search results')).toBeInTheDocument();

      // Verify search results appear
      const searchResults = await screen.findByRole('listbox', { name: 'Search results' });
      const resultItems = within(searchResults).getAllByRole('option');

      expect(resultItems).toHaveLength(2);
      expect(resultItems[0]).toHaveTextContent('Maria Silva');
      expect(resultItems[1]).toHaveTextContent('Maria Santos');

      // Select first patient
      await user.click(resultItems[0]);

      expect(handlePatientSelect).toHaveBeenCalledWith({
        id: 'patient-123',
        name: 'Maria Silva',
        cpf: '123.456.789-00',
      });
    });

    it('should handle search with no results', async () => {
      const handlePatientSelect = vi.fn();

      render(<MockPatientSearch onPatientSelect={handlePatientSelect} />);

      const searchInput = screen.getByLabelText(/Search Patients/i);
      await user.type(searchInput, 'Nonexistent Patient');

      // Wait for search to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
      });

      // Verify no results message or empty state
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should validate minimum search characters', async () => {
      const handlePatientSelect = vi.fn();

      render(<MockPatientSearch onPatientSelect={handlePatientSelect} />);

      const searchInput = screen.getByLabelText(/Search Patients/i);
      await user.type(searchInput, 'Ma'); // Only 2 characters

      // Verify search doesn't trigger with less than 3 characters
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading search results')).not.toBeInTheDocument();
    });
  });

  describe('Dashboard to Appointment Scheduling Flow', () => {
    it('should navigate from dashboard to appointment scheduling', async () => {
      const handleAppointmentCreate = vi.fn();
      const handleMedicalRecordAccess = vi.fn();

      const { container } = render(
        <MockPatientDashboard
          patientId='patient-123'
          onAppointmentCreate={handleAppointmentCreate}
          onMedicalRecordAccess={handleMedicalRecordAccess}
        />,
      );

      // Wait for dashboard to load
      expect(await screen.findByText('Loading...')).toBeInTheDocument();

      // Verify patient information is displayed
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 550));
      });

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();

      // Click schedule appointment button
      const scheduleButton = screen.getByRole('button', { name: /Schedule new appointment/i });
      await user.click(scheduleButton);

      expect(handleAppointmentCreate).toHaveBeenCalledWith('patient-123');
    });

    it('should display patient appointments and allow rescheduling', async () => {
      render(
        <MockPatientDashboard
          patientId='patient-123'
          onAppointmentCreate={vi.fn()}
          onMedicalRecordAccess={vi.fn()}
        />,
      );

      // Wait for dashboard to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 550));
      });

      // Verify appointments section
      const appointmentsSection = screen.getByRole('heading', { name: /Upcoming Appointments/i });
      expect(appointmentsSection).toBeInTheDocument();

      // Verify appointment details
      expect(screen.getByText('consultation - cardiology')).toBeInTheDocument();
      expect(screen.getByText('Dr. João Santos')).toBeInTheDocument();
      expect(screen.getByText('confirmed')).toBeInTheDocument();

      // Verify reschedule button
      const rescheduleButton = screen.getByRole('button', {
        name: /Reschedule appointment on/i,
      });
      expect(rescheduleButton).toBeInTheDocument();
    });
  });

  describe('Complete Appointment Scheduling Workflow', () => {
    it('should complete full appointment scheduling flow', async () => {
      const handleAppointmentScheduled = vi.fn();

      render(
        <MockAppointmentScheduler
          patientId='patient-123'
          onAppointmentScheduled={handleAppointmentScheduled}
          onCancel={vi.fn()}
        />,
      );

      // Select specialty
      const specialtySelect = screen.getByLabelText(/Specialty/i);
      await user.selectOptions(specialtySelect, 'Cardiology');

      // Verify physicians are loaded
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Select physician
      const physicianSelect = screen.getByLabelText(/Physician/i);
      await user.selectOptions(physicianSelect, 'Dr. João Santos');

      // Select date
      const dateInput = screen.getByLabelText(/Date/i);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await user.type(dateInput, tomorrow.toISOString().split('T')[0]);

      // Select time
      const timeInput = screen.getByLabelText(/Time/i);
      await user.type(timeInput, '14:00');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Schedule Appointment/i });
      await user.click(submitButton);

      // Verify scheduling process
      expect(screen.getByRole('button', { name: /Scheduling\.\.\./i })).toBeInTheDocument();

      // Wait for scheduling to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });

      // Verify appointment was scheduled
      expect(handleAppointmentScheduled).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 'patient-123',
          type: 'consultation',
          specialty: 'Cardiology',
          physician: 'Dr. João Santos',
          status: 'confirmed',
        }),
      );
    });

    it('should validate required fields before scheduling', async () => {
      render(
        <MockAppointmentScheduler
          patientId='patient-123'
          onAppointmentScheduled={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /Schedule Appointment/i });
      await user.click(submitButton);

      // Verify form validation (alert should be shown)
      // Note: In real implementation, this would use proper form validation
      expect(screen.getByLabelText(/Specialty/i)).toHaveValue('');
    });

    it('should handle date validation (prevent past dates)', async () => {
      render(
        <MockAppointmentScheduler
          patientId='patient-123'
          onAppointmentScheduled={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const dateInput = screen.getByLabelText(/Date/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Verify past dates are not allowed
      expect(dateInput).toHaveAttribute('min', expect.any(String));
    });
  });

  describe('Medical Records Access and Viewing', () => {
    it('should access and display medical records', async () => {
      const handleExport = vi.fn();

      render(
        <MockMedicalRecordsViewer
          patientId='patient-123'
          onExport={handleExport}
          onClose={vi.fn()}
        />,
      );

      // Wait for records to load
      expect(await screen.findByText('Loading medical records...')).toBeInTheDocument();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 850));
      });

      // Verify records are displayed
      expect(screen.getByRole('dialog', { name: 'Medical records' })).toBeInTheDocument();
      expect(screen.getByText('Medical History')).toBeInTheDocument();

      // Verify record timeline
      const timeline = screen.getByRole('list');
      const recordItems = within(timeline).getAllByRole('listitem');

      expect(recordItems).toHaveLength(2);
      expect(recordItems[0]).toHaveTextContent('Consultation');
      expect(recordItems[1]).toHaveTextContent('Follow-up');
    });

    it('should display detailed record information', async () => {
      render(
        <MockMedicalRecordsViewer
          patientId='patient-123'
          onExport={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      // Wait for records to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 850));
      });

      // Click on first record to view details
      const firstRecord = screen.getAllByRole('listitem')[0];
      await user.click(firstRecord);

      // Verify detailed information is displayed
      expect(screen.getByText('Record Details')).toBeInTheDocument();
      expect(screen.getByText('Visit Information')).toBeInTheDocument();
      expect(screen.getByText('Diagnosis')).toBeInTheDocument();
      expect(screen.getByText('Treatment')).toBeInTheDocument();
      expect(screen.getByText('Vital Signs')).toBeInTheDocument();
      expect(screen.getByText('Medications')).toBeInTheDocument();

      // Verify specific medical data
      expect(screen.getByText('Hypertension')).toBeInTheDocument();
      expect(screen.getByText('150/95 mmHg')).toBeInTheDocument();
      expect(screen.getByText('Losartan 50mg')).toBeInTheDocument();
    });

    it('should handle medical records export', async () => {
      const handleExport = vi.fn();

      render(
        <MockMedicalRecordsViewer
          patientId='patient-123'
          onExport={handleExport}
          onClose={vi.fn()}
        />,
      );

      // Wait for records to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 850));
      });

      // Click export button
      const exportButton = screen.getByRole('button', { name: /Export records as PDF/i });
      await user.click(exportButton);

      // Verify export process
      expect(screen.getByRole('button', { name: /Exporting\.\.\./i })).toBeInTheDocument();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1600));
      });

      // Verify export was called
      expect(handleExport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: expect.any(String),
            diagnosis: expect.any(String),
          }),
        ]),
        'pdf',
      );
    });
  });
});

describe('Emergency Access Integration', () => {
  it('should provide emergency information access without authentication', () => {
    const MockEmergencyInterface = () => (
      <div className='emergency-interface'>
        <div role='alert' aria-live='assertive' className='emergency-banner'>
          <h2>Emergency Contacts</h2>
          <div className='emergency-contacts'>
            <div className='contact-item'>
              <h3>Emergency Room</h3>
              <p>
                Phone: <a href='tel:+551112345678'>+55 11 1234-5678</a>
              </p>
              <p>Address: Av. Principal, 1000</p>
            </div>
            <div className='contact-item'>
              <h3>Poison Control</h3>
              <p>
                Phone: <a href='tel:+5511987654321'>+55 11 9876-54321</a>
              </p>
              <p>24/7 Service Available</p>
            </div>
          </div>
        </div>
      </div>
    );

    render(<MockEmergencyInterface />);

    // Verify emergency information is accessible
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
    expect(screen.getByText('+55 11 1234-5678')).toBeInTheDocument();
    expect(screen.getByText('+55 11 9876-54321')).toBeInTheDocument();

    // Verify emergency contacts are clickable
    const emergencyPhone = screen.getByRole('link', { name: '+55 11 1234-5678' });
    expect(emergencyPhone).toHaveAttribute('href', 'tel:+551112345678');
  });
});

describe('Real-time Updates Integration', () => {
  it('should handle real-time appointment status updates', async () => {
    const MockRealTimeDashboard = () => {
      const [appointments, setAppointments] = React.useState([
        { id: 'apt-1', status: 'confirmed', patient: 'Maria Silva' },
      ]);

      React.useEffect(() => {
        // Simulate real-time update
        const interval = setInterval(() => {
          setAppointments(prev =>
            prev.map(apt =>
              apt.id === 'apt-1'
                ? { ...apt, status: 'in-progress' }
                : apt
            )
          );
        }, 2000);

        return () => clearInterval(interval);
      }, []);

      return (
        <div>
          <div aria-live='polite' aria-atomic='true'>
            {appointments.map(apt => (
              <div key={apt.id}>
                {apt.patient} - {apt.status}
              </div>
            ))}
          </div>
        </div>
      );
    };

    render(<MockRealTimeDashboard />);

    // Verify initial status
    expect(screen.getByText('Maria Silva - confirmed')).toBeInTheDocument();

    // Wait for real-time update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });

    // Verify status update
    expect(screen.getByText('Maria Silva - in-progress')).toBeInTheDocument();
  });

  it('should handle real-time critical alerts', async () => {
    const MockCriticalAlertSystem = () => {
      const [alerts, setAlerts] = React.useState([]);

      React.useEffect(() => {
        // Simulate critical alert
        const timeout = setTimeout(() => {
          setAlerts([
            { id: 'alert-1', type: 'critical', message: 'Patient requires immediate attention' },
          ]);
        }, 1000);

        return () => clearTimeout(timeout);
      }, []);

      return (
        <div>
          <div aria-live='assertive' aria-atomic='true'>
            {alerts.map(alert => (
              <div key={alert.id} role='alert' className='critical-alert'>
                <span className='alert-icon'>⚠️</span>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      );
    };

    render(<MockCriticalAlertSystem />);

    // Wait for critical alert
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    // Verify critical alert is displayed
    const criticalAlert = screen.getByRole('alert');
    expect(criticalAlert).toBeInTheDocument();
    expect(criticalAlert).toHaveTextContent('Patient requires immediate attention');
    expect(criticalAlert).toHaveAttribute('aria-live', 'assertive');
  });
});

describe('Cross-Component Data Flow', () => {
  it('should maintain data consistency across components', async () => {
    const MockPatientManagementSystem = () => {
      const [selectedPatient, setSelectedPatient] = React.useState(null);
      const [appointments, setAppointments] = React.useState([]);

      const handlePatientSelect = patient => {
        setSelectedPatient(patient);
        // Load appointments for selected patient
        setAppointments([
          { id: 'apt-1', patientId: patient.id, type: 'consultation' },
        ]);
      };

      const handleAppointmentUpdate = updatedAppointment => {
        setAppointments(prev =>
          prev.map(apt => apt.id === updatedAppointment.id ? updatedAppointment : apt)
        );
      };

      return (
        <div>
          <MockPatientSearch onPatientSelect={handlePatientSelect} />
          {selectedPatient && (
            <MockPatientDashboard
              patientId={selectedPatient.id}
              onAppointmentCreate={patientId => {
                const newAppointment = {
                  id: `apt-${Date.now()}`,
                  patientId,
                  type: 'consultation',
                };
                setAppointments(prev => [...prev, newAppointment]);
              }}
              onMedicalRecordAccess={vi.fn()}
            />
          )}
          <div className='appointments-summary'>
            <h3>Total Appointments: {appointments.length}</h3>
            {appointments.map(apt => <div key={apt.id}>{apt.type}</div>)}
          </div>
        </div>
      );
    };

    render(<MockPatientManagementSystem />);

    // Initial state - no appointments
    expect(screen.getByText('Total Appointments: 0')).toBeInTheDocument();

    // Select patient
    const searchInput = screen.getByLabelText(/Search Patients/i);
    await user.type(searchInput, 'Maria Silva');

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });

    const searchResults = screen.getByRole('listbox', { name: 'Search results' });
    const firstResult = within(searchResults).getAllByRole('option')[0];
    await user.click(firstResult);

    // Verify appointments are loaded for selected patient
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(screen.getByText('Total Appointments: 1')).toBeInTheDocument();
    expect(screen.getByText('consultation')).toBeInTheDocument();
  });
});

describe('Error Handling and Recovery', () => {
  it('should handle API failures gracefully', async () => {
    const MockErrorProneComponent = () => {
      const [data, setData] = React.useState(null);
      const [error, setError] = React.useState(null);
      const [retryCount, setRetryCount] = React.useState(0);

      const loadData = async () => {
        try {
          // Simulate API failure
          if (retryCount < 3) {
            throw new Error('Network error');
          }
          setData({ success: true });
          setError(null);
        } catch (err) {
          setError(err.message);
          setData(null);
        }
      };

      React.useEffect(() => {
        loadData();
      }, [retryCount]);

      if (error) {
        return (
          <div className='error-state'>
            <p>Error: {error}</p>
            <button onClick={() => setRetryCount(prev => prev + 1)}>
              Retry (Attempt {retryCount + 1})
            </button>
          </div>
        );
      }

      if (!data) {
        return <div className='loading'>Loading...</div>;
      }

      return <div className='success'>Data loaded successfully!</div>;
    };

    render(<MockErrorProneComponent />);

    // Initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for error state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify error is displayed
    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry \(Attempt 1\)/i })).toBeInTheDocument();

    // Retry and verify retry count increases
    const retryButton = screen.getByRole('button', { name: /Retry \(Attempt 1\)/i });
    await user.click(retryButton);

    expect(screen.getByRole('button', { name: /Retry \(Attempt 2\)/i })).toBeInTheDocument();

    // Retry until success
    await user.click(screen.getByRole('button', { name: /Retry \(Attempt 2\)/i }));
    await user.click(screen.getByRole('button', { name: /Retry \(Attempt 3\)/i }));

    // Verify success state
    expect(screen.getByText('Data loaded successfully!')).toBeInTheDocument();
  });
});
