import { useState, useCallback, useEffect } from 'react';
import { DocumentEntity } from '@/entities/document';
import { DocumentApi } from '../api/document';

export const useDocuments = (caseId: string) => {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!caseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await DocumentApi.getDocuments(caseId);

      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? `Failed to load documents: ${err.message}` : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // Auto-fetch documents when caseId changes
  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId, fetchDocuments]);

  const addDocument = useCallback((document: DocumentEntity) => {
    setDocuments(prev => [document, ...prev]);
  }, []);

  const refreshDocuments = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    refreshDocuments,
    documentCount: documents.length,
  };
};