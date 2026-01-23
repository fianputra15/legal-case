import { useState } from 'react';
import { DocumentApi } from '../api/document';

export const useDocumentActions = () => {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(documentId));

      const blob = await DocumentApi.downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      throw err;
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  };

  return {
    downloadDocument,
    downloadingIds,
    isDownloading: (documentId: string) => downloadingIds.has(documentId),
  };
};