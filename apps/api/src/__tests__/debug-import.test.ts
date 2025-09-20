import { describe, test } from 'vitest';
import { PatientDocumentService } from '../services/patient-document-service';

describe('Debug Service Import', () => {
  test('should import service correctly', () => {
    console.log('PatientDocumentService:', PatientDocumentService);
    console.log(
      'typeof PatientDocumentService:',
      typeof PatientDocumentService,
    );

    const service = new PatientDocumentService();
    console.log('service:', service);
    console.log('service.constructor.name:', service.constructor.name);
    console.log(
      'Object.getOwnPropertyNames(service):',
      Object.getOwnPropertyNames(service),
    );
    console.log(
      'Object.getOwnPropertyNames(Object.getPrototypeOf(service)):',
      Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
    );

    // Check what methods exist
    console.log(
      'service.uploadPatientDocument:',
      service.uploadPatientDocument,
    );
    console.log('service.getDocument:', service.getDocument);
    console.log('service.getFileContent:', service.getFileContent);
  });
});
