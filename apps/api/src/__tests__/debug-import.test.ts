import { describe, test } from 'vitest';
import { PatientDocumentService } from '../services/patient-document-service';

describe(_'Debug Service Import',_() => {
  test(_'should import service correctly',_() => {
    console.log('PatientDocumentService:', PatientDocumentService);
    console.log(
      'typeof PatientDocumentService:',
      typeof PatientDocumentService,
    );

    const service = new PatientDocumentService();
    console.log('_service:', _service);
    console.log('service.constructor.name:', service.constructor.name);
    console.log(
      'Object.getOwnPropertyNames(_service):',
      Object.getOwnPropertyNames(_service),
    );
    console.log(
      'Object.getOwnPropertyNames(Object.getPrototypeOf(_service)):',
      Object.getOwnPropertyNames(Object.getPrototypeOf(_service)),
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
