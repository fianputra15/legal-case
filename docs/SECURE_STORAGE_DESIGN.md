# Secure Document Storage Configuration

## Overview
This document outlines the secure file storage strategy for the legal case management system.

## 🏗️ Storage Architecture

### Directory Structure
```
storage/                    # Root storage directory (outside public/)
├── documents/             # Main document storage
│   ├── 01/               # Distribution folders (first 2 chars of case ID)
│   │   ├── clabcd123/    # Full case ID directory
│   │   │   ├── uuid1.pdf # UUID-based filenames with original extension
│   │   │   └── uuid2.docx
│   │   └── claefg456/
│   └── 02/
├── quarantine/           # Suspicious files awaiting review
├── temp/                 # Temporary files during upload
└── archive/              # Archived case documents
```

## 🔒 Security Design Decisions

### 1. **UUID-Based Filenames**
- **Decision**: All stored files use UUID names (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`)
- **Reasoning**: Prevents path traversal attacks, filename collisions, and information leakage
- **Implementation**: Original filename stored in database, UUID used for filesystem

### 2. **Storage Outside Public Directory**
- **Decision**: Files stored in `/storage` directory, not `/public`
- **Reasoning**: Prevents direct web access to documents
- **Implementation**: All file access through authenticated API routes only

### 3. **Case-Based Directory Organization**
- **Decision**: Files organized by case ID with distribution folders
- **Reasoning**: Improves filesystem performance, enables case-based access control
- **Implementation**: `/documents/{casePrefix}/{fullCaseId}/{uuid-filename}`

### 4. **MIME Type Validation**
- **Decision**: Strict allowlist of legal document MIME types
- **Reasoning**: Prevents malicious file uploads (executables, scripts)
- **Implementation**: Server-side validation before storage

### 5. **File Integrity Checking**
- **Decision**: SHA-256 checksums generated for all files
- **Reasoning**: Detect file corruption, tampering, or storage issues
- **Implementation**: Checksum stored in database, verified on access

## 📋 Allowed File Types

### Documents (Max: 50MB)
- `application/pdf` - PDF documents
- `application/msword` - Microsoft Word (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word (.docx)
- `application/vnd.ms-excel` - Excel (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel (.xlsx)
- `text/plain` - Text files
- `application/rtf` - Rich Text Format

### Images (Max: 10MB)
- `image/jpeg` - JPEG images
- `image/png` - PNG images
- `image/tiff` - TIFF images (scanned documents)
- `image/webp` - WebP images

### Archives (Max: 50MB)
- `application/zip` - ZIP archives
- `application/x-rar-compressed` - RAR archives

## 🚫 Security Restrictions

### Forbidden File Types
- Executables: `.exe`, `.bat`, `.cmd`, `.scr`
- Scripts: `.js`, `.vbs`, `.jar`
- System files: `.app`, `.deb`, `.rpm`, `.msi`

### Filename Validation
- No directory traversal sequences (`../`, `..\\`)
- No system reserved names (`CON`, `PRN`, `AUX`)
- No null bytes or control characters
- No leading dots (hidden files)

### Size Limits
- Documents: 50MB maximum
- Images: 10MB maximum
- Default: 25MB maximum

## 🔧 Implementation Files

### Database Schema
- **File**: `prisma/schema.prisma`
- **Model**: `Document` with enhanced security fields
- **Fields**: `originalName`, `storedName`, `relativePath`, `checksum`

### Configuration
- **File**: `src/server/config/storage.ts`
- **Purpose**: Storage paths, MIME types, security settings
- **Security**: File validation, path generation

### Service Layer
- **File**: `src/server/services/document.service.ts`
- **Purpose**: Secure document operations
- **Features**: Upload validation, integrity checking, access control

### Storage Initialization
- **File**: `src/server/utils/storage-init.ts`
- **Purpose**: Directory setup, health checks
- **Maintenance**: Cleanup routines, statistics

## 🛡️ Security Best Practices

1. **Defense in Depth**
   - MIME type validation
   - File extension checking
   - Filename pattern validation
   - File size limits

2. **Access Control**
   - All file access through authenticated APIs
   - User authorization checked before file operations
   - Case ownership verification

3. **Audit Trail**
   - All file operations logged
   - User actions tracked
   - Integrity checks recorded

4. **Data Protection**
   - Files stored with secure permissions
   - No direct filesystem access
   - Regular backup procedures

## 📝 Environment Variables

Add to `.env.local`:

```bash
# Storage configuration
STORAGE_PATH=/path/to/secure/storage

# Optional: Storage limits (bytes)
MAX_FILE_SIZE_DOCUMENT=52428800  # 50MB
MAX_FILE_SIZE_IMAGE=10485760     # 10MB

# Optional: Security settings
ENABLE_VIRUS_SCANNING=false
ENABLE_FILE_QUARANTINE=true
```

## 🚀 Getting Started

1. **Initialize Storage**:
   ```typescript
   import { initializeStorage } from '@/server/utils/storage-init';
   await initializeStorage();
   ```

2. **Health Check**:
   ```typescript
   import { checkStorageHealth } from '@/server/utils/storage-init';
   const health = await checkStorageHealth();
   ```

3. **Upload Document**:
   ```typescript
   import { DocumentService } from '@/server/services/document.service';
   const document = await DocumentService.uploadDocument({
     originalName: 'contract.pdf',
     buffer: fileBuffer,
     mimeType: 'application/pdf',
     size: fileBuffer.length,
     caseId: 'case123',
     uploadedById: 'user456'
   });
   ```

## 🔍 Monitoring & Maintenance

- **Regular integrity checks** for document corruption
- **Cleanup temporary files** older than 24 hours
- **Monitor disk space** usage
- **Audit file access** patterns
- **Backup storage** directory regularly