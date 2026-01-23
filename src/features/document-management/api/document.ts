import { apiClient } from '@/shared/api';
import { DocumentEntity } from '@/entities/document';

export class DocumentApi {
  static async getDocuments(caseId: string): Promise<{ success: boolean; data: DocumentEntity[] }> {
    return apiClient.get(`/api/cases/${caseId}/documents`);
  }

  static async uploadDocument(caseId: string, file: File, documentType: string): Promise<{ success: boolean; data: DocumentEntity }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Upload failed with status ${response.status}`);
    }

    return data;
  }

  static async downloadDocument(documentId: string): Promise<Blob> {
    const response = await fetch(`/api/documents/${documentId}/download`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Download failed with status ${response.status}`);
    }

    return response.blob();
  }
}