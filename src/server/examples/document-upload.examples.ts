/**
 * Document Upload API Test Script
 * 
 * Example usage of the document upload endpoint
 */

// Test the document upload API with different scenarios
export const documentUploadExamples = {
  
  /**
   * Example 1: Upload PDF contract
   */
  async uploadPDFContract(caseId: string, authToken: string) {
    const formData = new FormData();
    
    // Simulate a PDF file (in real usage, this would be from file input)
    const pdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    formData.append('file', pdfBlob, 'service-agreement.pdf');
    formData.append('documentType', 'CONTRACT');
    
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    return response.json();
  },
  
  /**
   * Example 2: Upload evidence photo with cookie auth
   */
  async uploadEvidencePhoto(caseId: string) {
    const formData = new FormData();
    
    // Simulate a JPEG image
    const imageBlob = new Blob(['JPEG data'], { type: 'image/jpeg' });
    formData.append('file', imageBlob, 'evidence-photo.jpg');
    formData.append('documentType', 'EVIDENCE');
    
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
      body: formData
    });
    
    return response.json();
  },
  
  /**
   * Example 3: Error handling for invalid file type
   */
  async attemptInvalidUpload(caseId: string) {
    const formData = new FormData();
    
    // Try to upload an unsupported file type
    const executableBlob = new Blob(['executable'], { type: 'application/exe' });
    formData.append('file', executableBlob, 'malicious.exe');
    
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const result = await response.json();
    
    // Expected error response
    console.log('Expected error:', result.error?.message);
    return result;
  }
};

/**
 * Frontend integration example with React
 */
export const ReactDocumentUpload = `
import React, { useState } from 'react';

interface DocumentUploadProps {
  caseId: string;
  onSuccess: (document: any) => void;
  onError: (error: string) => void;
}

export function DocumentUpload({ caseId, onSuccess, onError }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('OTHER');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      onError('Please select a file');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      const response = await fetch(\`/api/cases/\${caseId}/documents\`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
      }
      
      onSuccess(result.data);
      setFile(null);
      
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md"
        >
          <option value="OTHER">Other</option>
          <option value="CONTRACT">Contract</option>
          <option value="EVIDENCE">Evidence</option>
          <option value="CORRESPONDENCE">Correspondence</option>
          <option value="LEGAL_BRIEF">Legal Brief</option>
          <option value="COURT_FILING">Court Filing</option>
          <option value="IDENTIFICATION">Identification</option>
          <option value="FINANCIAL_RECORD">Financial Record</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          File (PDF, DOCX, PNG, JPEG - Max 25MB)
        </label>
        <input
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={uploading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
`;

/**
 * cURL examples for testing
 */
export const curlExamples = {
  
  // Upload with Bearer token
  bearerToken: `curl -X POST \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -F "file=@/path/to/document.pdf" \\
  -F "documentType=CONTRACT" \\
  http://localhost:3000/api/cases/CASE_ID/documents`,
  
  // Upload with cookie authentication
  cookieAuth: `curl -X POST \\
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \\
  -F "file=@/path/to/evidence.jpg" \\
  -F "documentType=EVIDENCE" \\
  http://localhost:3000/api/cases/CASE_ID/documents`,
  
  // Test error handling
  invalidFile: `curl -X POST \\
  -H "Cookie: auth-token=YOUR_JWT_TOKEN" \\
  -F "file=@/path/to/malicious.exe" \\
  http://localhost:3000/api/cases/CASE_ID/documents`
};

/**
 * Response validation helper
 */
export function validateDocumentUploadResponse(response: any): boolean {
  return (
    response &&
    typeof response.success === 'boolean' &&
    (
      (response.success && response.data && response.data.id) ||
      (!response.success && response.error && response.error.message)
    )
  );
}

/**
 * File size helper
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  documentUploadExamples,
  ReactDocumentUpload,
  curlExamples,
  validateDocumentUploadResponse,
  formatFileSize
};