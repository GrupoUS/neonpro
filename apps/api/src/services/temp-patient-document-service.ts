/**
 * Temporary simplified service for testing download methods
 */
export class TempPatientDocumentService {
  async getDocument(documentId: string, userId: string): Promise<any | null> {
    console.log("getDocument called with:", documentId, userId);
    return null;
  }

  async getFileContent(storagePath: string): Promise<ArrayBuffer> {
    console.log("getFileContent called with:", storagePath);
    const encoder = new TextEncoder();
    return encoder.encode("Mock content").buffer;
  }
}
