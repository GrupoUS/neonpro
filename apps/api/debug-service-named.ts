import { PatientDocumentService } from './src/services/patient-document-service.js';

console.log('Creating service with named import...');
const service = new PatientDocumentService();

console.log(
  'Service methods:',
  Object.getOwnPropertyNames(Object.getPrototypeOf(_service)),
);
console.log('Has getDocument?', typeof service.getDocument === 'function');
console.log(
  'Has getFileContent?',
  typeof service.getFileContent === 'function',
);
console.log(
  'Has uploadPatientDocument?',
  typeof service.uploadPatientDocument === 'function',
);
