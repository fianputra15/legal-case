/**
 * Document Upload API Route
 * POST /api/cases/[id]/documents
 * 
 * Secure document upload with authorization and validation
 * 
 * @swagger
 * /api/cases/{id}/documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload document to case
 *     description: |
 *       Upload a document file to a specific legal case. Requires authentication and case access authorization.
 *       Files are validated for type, size, and security before storage with UUID-based naming.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Case ID to upload document to
 *         schema:
 *           type: string
 *           example: "clabcd123xyz"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload (PDF, DOCX, PNG, JPEG)
 *               documentType:
 *                 type: string
 *                 enum: [CONTRACT, EVIDENCE, CORRESPONDENCE, LEGAL_BRIEF, COURT_FILING, IDENTIFICATION, FINANCIAL_RECORD, OTHER]
 *                 description: Type of document being uploaded
 *                 default: OTHER
 *           examples:
 *             pdf_contract:
 *               summary: PDF Contract
 *               value:
 *                 file: "[Binary PDF file]"
 *                 documentType: "CONTRACT"
 *             evidence_image:
 *               summary: Evidence Photo
 *               value:
 *                 file: "[Binary JPEG file]"
 *                 documentType: "EVIDENCE"
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "cldoc789xyz"
 *                     originalName:
 *                       type: string
 *                       example: "contract-v2.pdf"
 *                     size:
 *                       type: integer
 *                       example: 2048576
 *                     mimeType:
 *                       type: string
 *                       example: "application/pdf"
 *                     documentType:
 *                       type: string
 *                       example: "CONTRACT"
 *                     status:
 *                       type: string
 *                       example: "PENDING"
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-18T10:30:00.000Z"
 *                     uploadedBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user123"
 *                         name:
 *                           type: string
 *                           example: "John Smith"
 *                 message:
 *                   type: string
 *                   example: "Document uploaded successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_file_type:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "File type 'application/exe' not allowed. Supported types: PDF, DOCX, PNG, JPEG"
 *               file_too_large:
 *                 summary: File too large
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "File size 30MB exceeds maximum allowed size of 25MB"
 *               no_file:
 *                 summary: No file provided
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "No file provided - field name must be \"file\""
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Case not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Case not found or access denied"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentType, DocumentStatus } from '../../../../../../prisma/generated/client';
import { AuthorizationService } from '@/server/auth/authorization';
import { DocumentService } from '@/server/services/document.service';
import { ResponseHandler } from '@/server/utils/response';
import { Logger } from '@/server/utils/logger';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { UserService } from '@/server/services';
import { UserRepository } from '@/server/db/repositories/user.repository';

const userService = new UserService(new UserRepository());

// Configure allowed file types for this endpoint (subset of all supported types)
const UPLOAD_ALLOWED_MIME_TYPES = [
  'application/pdf',           // PDF documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/png',                 // PNG images
  'image/jpeg'                 // JPEG images
] as const;

// Maximum file size: 25MB (reasonable for legal documents)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// interface UploadFileData {
//   file: File;
//   documentType?: DocumentType;
// }

/**
 * POST /api/cases/[id]/documents - Upload document to case
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    
    // 1. Authenticate user
    // Retrieve the "token" cookie from the request
    const token = (await cookies()).get("token")?.value;

    // If there is no token, return 401 Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);

    // If no user is found, return 404 Not Found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // 2. Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.badRequest('Invalid case ID');
    }
    
    // 3. Check case access authorization
    const canAccess = await AuthorizationService.canAccessCase(user, caseId);
    if (!canAccess) {
      // Use same error for non-existent and unauthorized cases (security)
      return ResponseHandler.notFound('Case not found or access denied');
    }
    
    // 4. Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.log(error);
      return ResponseHandler.badRequest('Invalid form data - must be multipart/form-data');
    }
    
    // 5. Extract file from form data
    const file = formData.get('file') as File;
    if (!file) {
      return ResponseHandler.badRequest('No file provided - field name must be "file"');
    }
    
    // 6. Extract optional document type
    const documentTypeStr = formData.get('documentType') as string;
    let documentType: DocumentType = DocumentType.OTHER;
    
    if (documentTypeStr && Object.values(DocumentType).includes(documentTypeStr as DocumentType)) {
      documentType = documentTypeStr as DocumentType;
    }
    
    // 7. Validate file properties
    const validation = validateUploadFile(file);
    if (!validation.isValid) {
      return ResponseHandler.badRequest(validation.error!);
    }
    
    // 8. Convert File to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 9. Upload document using secure service
    const document = await DocumentService.uploadDocument({
      originalName: file.name,
      buffer,
      mimeType: file.type,
      size: file.size,
      caseId,
      uploadedById: user.id,
      documentType
    });
    
    // 10. Log successful upload for audit
    Logger.info(`Document uploaded successfully: ${document.id} by user ${user.email} to case ${caseId}`);
    
    // 11. Return clean response (no filesystem paths exposed)
    return ResponseHandler.created({
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      mimeType: document.mimeType,
      documentType: document.documentType,
      status: document.status,
      uploadedAt: document.createdAt,
      uploadedBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      }
    });
    
  } catch (error) {
    // Log error details server-side but don't expose to client
    Logger.error('Document upload failed:', error);
    
    // Return user-friendly error message
    if (error instanceof Error) {
      // Handle known validation errors
      if (error.message.includes('Invalid file upload:')) {
        return ResponseHandler.badRequest(error.message);
      }
      
      // Handle storage errors
      if (error.message.includes('Failed to upload document:')) {
        return ResponseHandler.internalError('Document upload failed - please try again');
      }
    }
    
    return ResponseHandler.internalError('An error occurred while uploading the document');
  }
}

/**
 * GET /api/cases/[id]/documents - List documents for case
 * 
 * @swagger
 * /api/cases/{id}/documents:
 *   get:
 *     tags: [Documents]
 *     summary: List case documents
 *     description: |
 *       Retrieve a list of documents uploaded to a specific case. Requires authentication 
 *       and case access authorization. Returns only safe metadata without exposing file paths.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Case ID to list documents for
 *         schema:
 *           type: string
 *           example: "clcase123abc"
 *       - in: query
 *         name: status
 *         description: Filter by document status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSED, ARCHIVED, DELETED]
 *           example: "PROCESSED"
 *       - in: query
 *         name: documentType
 *         description: Filter by document type
 *         schema:
 *           type: string
 *           enum: [CONTRACT, EVIDENCE, CORRESPONDENCE, LEGAL_BRIEF, COURT_FILING, IDENTIFICATION, FINANCIAL_RECORD, OTHER]
 *           example: "CONTRACT"
 *       - in: query
 *         name: limit
 *         description: Maximum number of documents to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *           example: 20
 *       - in: query
 *         name: offset
 *         description: Number of documents to skip for pagination
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 10
 *     responses:
 *       200:
 *         description: List of case documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "cldoc789xyz"
 *                       originalName:
 *                         type: string
 *                         example: "contract-v2.pdf"
 *                       size:
 *                         type: integer
 *                         example: 2048576
 *                       mimeType:
 *                         type: string
 *                         example: "application/pdf"
 *                       documentType:
 *                         type: string
 *                         example: "CONTRACT"
 *                       status:
 *                         type: string
 *                         example: "PROCESSED"
 *                       uploadedBy:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "cluser123"
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-18T10:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_case_id:
 *                 summary: Invalid case ID
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "Invalid case ID"
 *               invalid_limit:
 *                 summary: Invalid limit parameter
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "Limit must be between 1 and 100"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Case not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Case not found or access denied"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    
    // Retrieve the "token" cookie from the request
    const token = (await cookies()).get("token")?.value;

    // If there is no token, return 401 Unauthorized
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the JWT using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Query the database to find the user by ID
    const user = await userService.getUserById(decoded.userId);

    // If no user is found, return 404 Not Found
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // 2. Validate case ID format
    if (!caseId || typeof caseId !== 'string' || caseId.trim().length === 0) {
      return ResponseHandler.badRequest('Invalid case ID');
    }
    
    // 3. Check case access authorization
    const canAccess = await AuthorizationService.canAccessCase(user, caseId);
    if (!canAccess) {
      // Use same error for non-existent and unauthorized cases (security)
      return ResponseHandler.notFound('Case not found or access denied');
    }
    
    // 4. Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const documentTypeParam = searchParams.get('documentType');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // 5. Validate and parse parameters
    let status: DocumentStatus | undefined;
    if (statusParam && Object.values(DocumentStatus).includes(statusParam as DocumentStatus)) {
      status = statusParam as DocumentStatus;
    }
    
    let documentType: DocumentType | undefined;
    if (documentTypeParam && Object.values(DocumentType).includes(documentTypeParam as DocumentType)) {
      documentType = documentTypeParam as DocumentType;
    }
    
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 100) : 50;
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10) || 0, 0) : 0;
    
    if (limitParam && (isNaN(limit) || limit < 1 || limit > 100)) {
      return ResponseHandler.badRequest('Limit must be between 1 and 100');
    }
    
    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return ResponseHandler.badRequest('Offset must be 0 or greater');
    }
    
    // 6. Get case documents using service
    const documents = await DocumentService.getCaseDocuments(caseId, {
      status,
      documentType,
      limit: limit + 1, // Get one extra to check if there are more
      offset
    });
    
    // 7. Check if there are more documents (for pagination)
    const hasMore = documents.length > limit;
    const documentsToReturn = hasMore ? documents.slice(0, limit) : documents;
    
    // 8. Transform documents to safe response format (no internal paths)
    const safeDocuments = documentsToReturn.map(doc => ({
      id: doc.id,
      originalName: doc.originalName,
      size: doc.size,
      mimeType: doc.mimeType,
      documentType: doc.documentType,
      status: doc.status,
      uploadedBy: {
        id: doc.uploadedBy.id,
        firstName: doc.uploadedBy.firstName,
        lastName: doc.uploadedBy.lastName
      },
      createdAt: doc.createdAt
    }));
    
    return ResponseHandler.success(safeDocuments, 'Documents retrieved successfully', {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: documentsToReturn.length, // Note: This is limited count, not total in DB
      pages: Math.ceil(documentsToReturn.length / limit)
    });
    
  } catch (error) {
    // Log error details server-side but don't expose to client
    Logger.error('Document listing failed:', error);
    
    return ResponseHandler.internalError('An error occurred while retrieving documents');
  }
}

/**
 * Validate uploaded file against security constraints
 */
function validateUploadFile(file: File): { 
  isValid: boolean; 
  error?: string;
} {
  // Check file existence
  if (!file || !file.name) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file size (client-side size, will be re-validated server-side)
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return { 
      isValid: false, 
      error: `File size ${Math.round(file.size / (1024 * 1024))}MB exceeds maximum allowed size of ${maxSizeMB}MB` 
    };
  }
  
  // Check MIME type
  if (!UPLOAD_ALLOWED_MIME_TYPES.includes(file.type as typeof UPLOAD_ALLOWED_MIME_TYPES[number])) {
    return { 
      isValid: false, 
      error: `File type '${file.type}' not allowed. Supported types: PDF, DOCX, PNG, JPEG` 
    };
  }
  
  // Check filename for basic security
  if (containsUnsafeCharacters(file.name)) {
    return { 
      isValid: false, 
      error: 'Filename contains invalid characters' 
    };
  }
  
  // Check for empty file
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }
  
  return { isValid: true };
}

/**
 * Check filename for unsafe characters
 */
function containsUnsafeCharacters(filename: string): boolean {
  // Basic checks for path traversal and unsafe characters
  const unsafePatterns = [
    /\.\./,           // Directory traversal
    /[<>:"|?*]/,      // Windows invalid chars
    /\x00/,           // Null byte
    /^\./,            // Hidden files
    /\/|\\/           // Path separators
  ];
  
  return unsafePatterns.some(pattern => pattern.test(filename));
}
