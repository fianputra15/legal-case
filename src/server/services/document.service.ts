/**
 * Document Service
 * 
 * Secure document management with Supabase storage integration
 */

import { Document, DocumentType, DocumentStatus, Prisma } from '../../../prisma/generated/client';
import { createHash } from 'crypto';
import { prisma } from '@/server/db/client';
import { SupabaseStorage } from '@/server/lib/supabase';
import { 
  validateFileUpload
} from '@/server/config/storage';

export interface DocumentUpload {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
  caseId: string;
  uploadedById: string;
  documentType?: DocumentType;
}

export interface DocumentMetadata {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  documentType: DocumentType;
  status: DocumentStatus;
  caseId: string;
  storagePath: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentService {
  /**
   * Upload and store a document securely to Supabase storage
   */
  static async uploadDocument(upload: DocumentUpload): Promise<Document> {
    // Validate file upload
    const validation = validateFileUpload(
      upload.originalName,
      upload.mimeType,
      upload.size
    );
    
    if (!validation.isValid) {
      throw new Error(`Invalid file upload: ${validation.errors.join(', ')}`);
    }
    
    // Generate secure file path for Supabase storage
    const storagePath = SupabaseStorage.generateFilePath(
      upload.caseId,
      upload.originalName
    );
    
    // Generate file checksum
    const checksum = createHash('sha256').update(upload.buffer).digest('hex');
    
    try {
      // Upload file to Supabase storage
      const { path: uploadedPath } = await SupabaseStorage.uploadFile(
        storagePath,
        upload.buffer,
        {
          contentType: upload.mimeType,
          upsert: false,
        }
      );
      
      // Create database record
      const document = await prisma.document.create({
        data: {
          caseId: upload.caseId,
          originalName: upload.originalName,
          storedName: uploadedPath.split('/').pop() || upload.originalName,
          relativePath: uploadedPath, // Store full Supabase path
          size: upload.size,
          mimeType: upload.mimeType,
          documentType: upload.documentType || DocumentType.OTHER,
          checksum,
          uploadedById: upload.uploadedById,
          status: DocumentStatus.PROCESSED
        }
      });
      
      return document;
      
    } catch (error) {
      // Cleanup file if database operation failed
      try {
        await SupabaseStorage.deleteFile(storagePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup file after database error:', cleanupError);
      }
      
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get document metadata by ID
   */
  static async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!document) {
      return null;
    }
    
    return {
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      mimeType: document.mimeType,
      documentType: document.documentType,
      status: document.status,
      caseId: document.caseId,
      storagePath: document.relativePath,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
  
  /**
   * Get document file buffer from Supabase storage (for download)
   */
  static async getDocumentFile(documentId: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }> {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    if (document.status === DocumentStatus.DELETED) {
      throw new Error('Document has been deleted');
    }
    
    try {
      // Download file from Supabase storage
      const { buffer } = await SupabaseStorage.downloadFile(document.relativePath);
      
      // Verify file integrity if checksum exists
      if (document.checksum) {
        const fileChecksum = createHash('sha256').update(buffer).digest('hex');
        if (fileChecksum !== document.checksum) {
          throw new Error('File integrity check failed - file may be corrupted');
        }
      }
      
      return {
        buffer,
        mimeType: document.mimeType, // Use stored MIME type for consistency
        originalName: document.originalName,
      };
      
    } catch (error) {
      console.error('Failed to get document file:', error);
      throw new Error('Failed to retrieve document file');
    }
  }
  
  /**
   * List documents for a case
   */
  static async getCaseDocuments(
    caseId: string,
    options?: {
      status?: DocumentStatus;
      documentType?: DocumentType;
      limit?: number;
      offset?: number;
    }
  ): Promise<DocumentMetadata[]> {
    const where: Prisma.DocumentWhereInput = {
      caseId,
      ...(options?.status && { status: options.status }),
      ...(options?.documentType && { documentType: options.documentType })
    };
    
    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(options?.limit && { take: options.limit }),
      ...(options?.offset && { skip: options.offset })
    });
    
    return documents.map(doc => ({
      id: doc.id,
      originalName: doc.originalName,
      size: doc.size,
      mimeType: doc.mimeType,
      documentType: doc.documentType,
      status: doc.status,
      caseId: doc.caseId,
      storagePath: doc.relativePath,
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }
  
  /**
   * Update document status (e.g., mark as processed, archived)
   */
  static async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus
  ): Promise<Document> {
    return await prisma.document.update({
      where: { id: documentId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Soft delete document (mark as deleted, keep file)
   */
  static async deleteDocument(documentId: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.DELETED,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Hard delete document (remove from Supabase storage and database)
   */
  static async hardDeleteDocument(documentId: string): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    try {
      // Remove file from Supabase storage
      await SupabaseStorage.deleteFile(document.relativePath);
    } catch (error) {
      console.error('Failed to remove file during hard delete:', error);
      // Continue with database deletion even if file removal fails
    }
    
    // Remove database record
    await prisma.document.delete({
      where: { id: documentId }
    });
  }
  
  /**
   * Verify document integrity for all documents in a case
   */
  static async verifyCaseDocuments(caseId: string): Promise<{
    verified: number;
    corrupted: string[];
    missing: string[];
  }> {
    const documents = await prisma.document.findMany({
      where: {
        caseId,
        status: { not: DocumentStatus.DELETED }
      }
    });
    
    const results = {
      verified: 0,
      corrupted: [] as string[],
      missing: [] as string[]
    };
    
    for (const document of documents) {
      try {
        // Download file from Supabase storage for verification
        const { buffer } = await SupabaseStorage.downloadFile(document.relativePath);
        
        // Check file integrity if checksum exists
        if (document.checksum) {
          const fileChecksum = createHash('sha256').update(buffer).digest('hex');
          if (fileChecksum === document.checksum) {
            results.verified++;
          } else {
            results.corrupted.push(document.id);
          }
        } else {
          results.verified++;
        }
      } catch (error) {
        console.log(error);
        results.missing.push(document.id);
      }
    }
    
    return results;
  }

  /**
   * Generate signed URL for secure document access
   */
  static async getDocumentSignedUrl(documentId: string, expiresIn: number = 3600): Promise<string> {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    if (document.status === DocumentStatus.DELETED) {
      throw new Error('Document has been deleted');
    }
    
    try {
      return await SupabaseStorage.getSignedUrl(document.relativePath, expiresIn);
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
}