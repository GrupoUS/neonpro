/**
 * Temporary simplified service for testing download methods
 */

// Interface for patient document data
interface PatientDocument {
  id: string;
  _userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  storagePath: string;
  isEncrypted: boolean;
  documentType?: string;
  description?: string;
}

export class TempPatientDocumentService {
  async getDocument(
    documentId: string,
    _userId: string,
  ): Promise<PatientDocument | null> {
    console.log("getDocument called with:", documentId, _userId);
    return null;
  }

  async getFileContent(storagePath: string): Promise<ArrayBuffer> {
    console.log("getFileContent called with:", storagePath);
    const encoder = new TextEncoder();
    return encoder.encode("Mock content").buffer;
  }
}
