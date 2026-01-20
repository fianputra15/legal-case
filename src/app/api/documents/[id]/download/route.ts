/**
 * Document Download API Route
 * GET /api/documents/[id]/download
 * 
 * Secure document download with authorization and streaming
 * 
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download document file
 *     description: |
 *       Download a specific document file. Requires authentication and case access authorization.
 *       The user must have access to the case that contains the document. Files are streamed
 *       securely without exposing internal file paths.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Document ID to download
 *         schema:
 *           type: string
 *           example: "cldoc789xyz"
 *     responses:
 *       200:
 *         description: Document file downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Type:
 *             description: MIME type of the document
 *             schema:
 *               type: string
 *               example: "application/pdf"
 *           Content-Disposition:
 *             description: Attachment header with original filename
 *             schema:
 *               type: string
 *               example: "attachment; filename=\"contract-v2.pdf\""
 *           Content-Length:
 *             description: Size of the document in bytes
 *             schema:
 *               type: integer
 *               example: 2048576
 *       400:
 *         description: Bad request - invalid document ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "BAD_REQUEST"
 *                 message: "Invalid document ID"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Document not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Document not found or access denied"
 *       410:
 *         description: Document has been deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "GONE"
 *                 message: "Document has been deleted"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/server/auth/middleware';
import { AuthorizationService } from '@/server/auth/authorization';
import { DocumentService } from '@/server/services/document.service';
import { ResponseHandler } from '@/server/utils/response';
import { Logger } from '@/server/utils/logger';

/**
 * GET /api/documents/[id]/download - Download document file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    
    // 1. Authenticate user
    const authResult = await AuthMiddleware.requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return auth error response
    }
    const { user } = authResult;
    
    // 2. Validate document ID format
    if (!documentId || typeof documentId !== 'string' || documentId.trim().length === 0) {
      return ResponseHandler.badRequest('Invalid document ID');
    }
    
    // 3. Get document metadata first (includes case information)
    let documentMetadata;
    try {
      documentMetadata = await DocumentService.getDocumentMetadata(documentId);
    } catch (error) {
      Logger.error(`Document metadata retrieval failed for ${documentId}:`, error);
      // Use generic error to avoid information leakage
      return ResponseHandler.notFound('Document not found or access denied');
    }
    
    if (!documentMetadata) {
      // Log access attempt for security audit
      Logger.warn(`User ${user.email} attempted to access non-existent document ${documentId}`);
      return ResponseHandler.notFound('Document not found or access denied');
    }
    
    // 4. Check if document has been deleted
    if (documentMetadata.status === 'DELETED') {
      Logger.warn(`User ${user.email} attempted to access deleted document ${documentId}`);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'GONE',
            message: 'Document has been deleted'
          }
        }),
        {
          status: 410,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // 5. Check case access authorization (critical security check)
    const canAccess = await AuthorizationService.canAccessCase(user, documentMetadata.caseId);
    if (!canAccess) {
      // Log unauthorized access attempt for security audit
      Logger.warn(`User ${user.email} attempted unauthorized access to document ${documentId} in case ${documentMetadata.caseId}`);
      // Use same error message as non-existent document (security)
      return ResponseHandler.notFound('Document not found or access denied');
    }
    
    // 6. Get document file data
    let documentFile;
    try {
      documentFile = await DocumentService.getDocumentFile(documentId);
    } catch (error) {
      Logger.error(`Document file retrieval failed for ${documentId}:`, error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Document not found')) {
          return ResponseHandler.notFound('Document not found or access denied');
        }
        if (error.message.includes('Document has been deleted')) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: {
                code: 'GONE',
                message: 'Document has been deleted'
              }
            }),
            {
              status: 410,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        if (error.message.includes('File integrity check failed')) {
          Logger.error(`File integrity check failed for document ${documentId} - possible corruption or tampering`);
          return ResponseHandler.internalError('Document file appears to be corrupted');
        }
        if (error.message.includes('Failed to read document file')) {
          Logger.error(`File system error for document ${documentId} - file may be missing from storage`);
          return ResponseHandler.internalError('Document file is currently unavailable');
        }
      }
      
      return ResponseHandler.internalError('An error occurred while accessing the document');
    }
    
    // 7. Sanitize filename for Content-Disposition header
    const safeFilename = sanitizeFilename(documentFile.originalName);
    
    // 8. Set security and streaming headers
    const headers = new Headers();
    
    // Content type from document metadata
    headers.set('Content-Type', documentFile.mimeType);
    
    // Force download with original filename
    headers.set('Content-Disposition', `attachment; filename=\"${safeFilename}\"`);
    
    // File size for progress tracking
    headers.set('Content-Length', documentFile.buffer.length.toString());
    
    // Security headers
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // Prevent content sniffing
    headers.set('X-Content-Type-Options', 'nosniff');
    
    // Log successful download for audit trail
    Logger.info(`User ${user.email} downloaded document ${documentId} (${safeFilename}) from case ${documentMetadata.caseId}`);
    
    // 9. Stream file to client
    return new NextResponse(documentFile.buffer, {
      status: 200,
      headers
    });
    
  } catch (error) {
    // Log error details server-side but don't expose to client
    Logger.error('Document download failed:', error);
    
    return ResponseHandler.internalError('An error occurred while downloading the document');
  }
}

/**
 * Sanitize filename for safe use in Content-Disposition header
 * Removes/replaces characters that could cause security issues
 */
function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    // Replace path separators and dangerous chars with underscores
    .replace(/[/\\:*?"<>|]/g, '_')
    // Remove control characters
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    // Remove leading/trailing dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length to prevent header issues
    .substring(0, 255)
    // Fallback if filename becomes empty
    || 'document';
}

/**
 * Escape filename for Content-Disposition header (RFC 5987)
 * Handles international characters properly
 */
function escapeFilenameRFC5987(filename: string): string {
  // First sanitize the filename
  const sanitized = sanitizeFilename(filename);
  
  // Check if filename contains non-ASCII characters
  const hasNonASCII = /[^\\x00-\\x7F]/.test(sanitized);
  
  if (hasNonASCII) {
    // Use RFC 5987 encoding for international filenames
    const encoded = encodeURIComponent(sanitized);
    return `filename*=UTF-8''${encoded}`;
  } else {
    // Use simple quoted filename for ASCII
    return `filename=\"${sanitized}\"`;
  }
}