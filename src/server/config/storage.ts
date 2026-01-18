/**
 * Secure File Storage Configuration
 * 
 * Defines security constraints and storage structure for document management
 */

import { randomUUID } from 'crypto';
import path from 'path';

// Storage configuration
export const STORAGE_CONFIG = {
  // Base storage directory (outside public folder for security)
  BASE_PATH: process.env.STORAGE_PATH || path.join(process.cwd(), 'storage'),
  
  // Subdirectories for organization and security
  DIRECTORIES: {
    DOCUMENTS: 'documents',
    QUARANTINE: 'quarantine', // For potentially unsafe files
    TEMP: 'temp',            // For upload processing
    ARCHIVE: 'archive'       // For archived documents
  },
  
  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    DOCUMENT: 50 * 1024 * 1024,    // 50MB for documents
    IMAGE: 10 * 1024 * 1024,       // 10MB for images
    DEFAULT: 25 * 1024 * 1024      // 25MB default
  },
  
  // Security settings
  SECURITY: {
    USE_UUID_NAMES: true,
    STORE_OUTSIDE_PUBLIC: true,
    VALIDATE_MIME_TYPES: true,
    SCAN_FOR_MALWARE: false, // Set to true when implementing virus scanning
    GENERATE_CHECKSUMS: true
  }
} as const;

// Allowed MIME types with security considerations
export const ALLOWED_MIME_TYPES = {
  // Documents (common legal document formats)
  DOCUMENTS: [
    'application/pdf',                    // PDF documents
    'application/msword',                 // DOC files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.ms-excel',           // XLS files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-powerpoint',      // PPT files
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'text/plain',                         // TXT files
    'application/rtf'                     // RTF files
  ],
  
  // Images (for evidence, scanned documents)
  IMAGES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff'
  ],
  
  // Archives (for bulk document uploads)
  ARCHIVES: [
    'application/zip',
    'application/x-rar-compressed'
  ]
} as const;

// Get all allowed MIME types
export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.DOCUMENTS,
  ...ALLOWED_MIME_TYPES.IMAGES,
  ...ALLOWED_MIME_TYPES.ARCHIVES
];

// Dangerous file extensions to never allow (even if MIME type passes)
export const FORBIDDEN_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.js', '.vbs', '.vbe', '.jar', '.app', '.deb',
  '.rpm', '.dmg', '.pkg', '.msi'
];

/**
 * Generate secure file storage path
 * Uses UUID for filename and organized folder structure
 */
export function generateSecureFilePath(originalFileName: string, caseId: string): {
  storedName: string;
  relativePath: string;
  fullPath: string;
} {
  const fileExtension = path.extname(originalFileName).toLowerCase();
  const uuid = randomUUID();
  
  // Create UUID-based filename with original extension
  const storedName = `${uuid}${fileExtension}`;
  
  // Organize by case ID (first 2 chars for distribution)
  const casePrefix = caseId.substring(0, 2);
  const relativePath = path.join(
    STORAGE_CONFIG.DIRECTORIES.DOCUMENTS,
    casePrefix,
    caseId,
    storedName
  );
  
  const fullPath = path.join(STORAGE_CONFIG.BASE_PATH, relativePath);
  
  return {
    storedName,
    relativePath,
    fullPath
  };
}

/**
 * Validate file security constraints
 */
export function validateFileUpload(
  originalFileName: string,
  mimeType: string,
  fileSize: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file extension
  const extension = path.extname(originalFileName).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed for security reasons`);
  }
  
  // Check MIME type
  if (!ALL_ALLOWED_MIME_TYPES.includes(mimeType as typeof ALL_ALLOWED_MIME_TYPES[number])) {
    errors.push(`File type ${mimeType} is not allowed`);
  }
  
  // Check file size
  const maxSize = getMaxFileSizeForMimeType(mimeType);
  if (fileSize > maxSize) {
    errors.push(`File size ${fileSize} bytes exceeds maximum allowed size ${maxSize} bytes`);
  }
  
  // Check filename for suspicious patterns
  if (containsSuspiciousPatterns(originalFileName)) {
    errors.push('Filename contains suspicious patterns');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get maximum file size for a given MIME type
 */
function getMaxFileSizeForMimeType(mimeType: string): number {
  if (ALLOWED_MIME_TYPES.IMAGES.includes(mimeType as typeof ALLOWED_MIME_TYPES.IMAGES[number])) {
    return STORAGE_CONFIG.MAX_FILE_SIZE.IMAGE;
  }
  
  if (ALLOWED_MIME_TYPES.DOCUMENTS.includes(mimeType as typeof ALLOWED_MIME_TYPES.DOCUMENTS[number])) {
    return STORAGE_CONFIG.MAX_FILE_SIZE.DOCUMENT;
  }
  
  return STORAGE_CONFIG.MAX_FILE_SIZE.DEFAULT;
}

/**
 * Check filename for suspicious patterns
 */
function containsSuspiciousPatterns(filename: string): boolean {
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /[<>:"|?*]/,      // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved Windows names
    /\x00/,           // Null byte
    /^\./,            // Hidden files (starting with dot)
    /\s{2,}/          // Multiple consecutive spaces
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(filename));
}

/**
 * Storage folder structure builder
 * Creates the necessary directory structure
 */
export const STORAGE_STRUCTURE = {
  // Root storage directory
  root: STORAGE_CONFIG.BASE_PATH,
  
  // Main directories
  documents: path.join(STORAGE_CONFIG.BASE_PATH, STORAGE_CONFIG.DIRECTORIES.DOCUMENTS),
  quarantine: path.join(STORAGE_CONFIG.BASE_PATH, STORAGE_CONFIG.DIRECTORIES.QUARANTINE),
  temp: path.join(STORAGE_CONFIG.BASE_PATH, STORAGE_CONFIG.DIRECTORIES.TEMP),
  archive: path.join(STORAGE_CONFIG.BASE_PATH, STORAGE_CONFIG.DIRECTORIES.ARCHIVE),
  
  // Function to get case-specific directory
  getCaseDirectory: (caseId: string) => {
    const casePrefix = caseId.substring(0, 2);
    return path.join(
      STORAGE_CONFIG.BASE_PATH,
      STORAGE_CONFIG.DIRECTORIES.DOCUMENTS,
      casePrefix,
      caseId
    );
  }
} as const;