/**
 * Domain Repository Interfaces
 * @package `@neonpro/healthcare-core`
 */

// Patient repositories
export {
  PatientRepository,
  PatientQueryRepository,
  PatientFilter,
  PatientSearchResult,
  type PatientRepository as IPatientRepository,
  type PatientQueryRepository as IPatientQueryRepository,
} from './patient-repository';

// Appointment repositories  
export {
  AppointmentRepository,
  AppointmentQueryRepository,
  AppointmentFilter,
  AppointmentSearchResult,
  type AppointmentRepository as IAppointmentRepository,
  type AppointmentQueryRepository as IAppointmentQueryRepository,
} from './appointment-repository';

// Consent repositories
export {
  ConsentRepository,
  ConsentQueryRepository,
  ConsentFilter,
  ConsentSearchResult,
  type ConsentRepository as IConsentRepository,
  type ConsentQueryRepository as IConsentQueryRepository,
} from './consent-repository';

// Base repository interfaces
export {
  BaseRepository,
  BaseQueryRepository,
  RepositoryFilter,
  RepositorySearchResult,
  type BaseRepository as IBaseRepository,
  type BaseQueryRepository as IBaseQueryRepository,
} from './base-repository';