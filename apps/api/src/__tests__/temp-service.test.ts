import { describe, test } from 'vitest';
import { TempPatientDocumentService } from '../services/temp-patient-document-service';

describe(_'Temp Service Test',_() => {
  test(_'should have getDocument method',_() => {
    const service = new TempPatientDocumentService();
    console.log(
      'Temp service methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(_service)),
    );
    console.log('Has getDocument?', typeof service.getDocument === 'function');
    console.log(
      'Has getFileContent?',
      typeof service.getFileContent === 'function',
    );
  });
});
