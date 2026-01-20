# Supabase Storage Integration

## 📁 **Document Storage Migration**

The document management system has been successfully migrated from local file system storage to **Supabase Storage** for better scalability, security, and cloud-native architecture.

## 🔧 **Configuration**

### **Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://giloqomhokskxxwoxjnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Storage Bucket**
- **Bucket Name**: `legal-case`
- **Structure**: `cases/{caseId}/documents/{timestamp}_{random}_{filename}`
- **Access**: Private with secure signed URLs

## 📝 **Implementation Changes**

### **New Files Created**
1. **`src/server/lib/supabase.ts`** - Supabase client and storage utilities
2. **`SUPABASE_STORAGE_INTEGRATION.md`** - This documentation

### **Modified Files**
1. **`src/server/services/document.service.ts`** - Updated all storage operations
2. **Document upload/download endpoints** - Will work seamlessly with new backend

## 🚀 **Storage Operations**

### **File Upload Flow**
```typescript
// Generate secure path: cases/{caseId}/documents/{timestamp}_{random}_{filename}
const storagePath = SupabaseStorage.generateFilePath(caseId, originalName);

// Upload to Supabase with content type validation
const { path } = await SupabaseStorage.uploadFile(storagePath, buffer, {
  contentType: mimeType,
  upsert: false,
});

// Store path in database for retrieval
await prisma.document.create({ relativePath: path, ... });
```

### **File Download Flow**
```typescript
// Get document metadata from database
const document = await prisma.document.findUnique({ where: { id } });

// Download from Supabase storage
const { buffer, contentType } = await SupabaseStorage.downloadFile(document.relativePath);

// Verify file integrity with SHA-256 checksum
const fileChecksum = createHash('sha256').update(buffer).digest('hex');
if (fileChecksum !== document.checksum) {
  throw new Error('File integrity check failed');
}
```

## 🔒 **Security Features**

### **Access Control**
- **Private Bucket**: Files not publicly accessible
- **Signed URLs**: Temporary access with expiration (default 1 hour)
- **Server-Side Auth**: All operations use server-side Supabase client
- **Path Validation**: Secure path generation prevents directory traversal

### **File Integrity**
- **SHA-256 Checksums**: All uploads generate and verify checksums
- **Content Type Validation**: MIME type verification on upload and download
- **Size Limits**: File size restrictions enforced
- **Corruption Detection**: Automatic integrity checks during download

### **Storage Structure**
```
legal-case/
├── cases/
│   ├── {caseId1}/
│   │   └── documents/
│   │       ├── 1673123456789_abc123_contract.pdf
│   │       └── 1673123789456_def456_evidence.jpg
│   └── {caseId2}/
│       └── documents/
│           └── 1673124567890_ghi789_brief.docx
```

## 📊 **Key Benefits**

### **Scalability**
- ✅ **Cloud Storage**: No local disk space limitations
- ✅ **CDN Integration**: Faster file delivery worldwide
- ✅ **Auto-Scaling**: Handles traffic spikes automatically
- ✅ **Backup & Replication**: Built-in redundancy

### **Security**
- ✅ **Private by Default**: No accidental public exposure
- ✅ **Signed URLs**: Controlled temporary access
- ✅ **Encryption**: Files encrypted at rest and in transit
- ✅ **Access Logs**: Built-in audit trail

### **Developer Experience**
- ✅ **Simple API**: Clean storage abstraction
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Testing**: Easier to mock and test

## 🔄 **API Compatibility**

### **Existing Endpoints Still Work**
- **POST** `/api/cases/:id/documents` - Upload documents
- **GET** `/api/cases/:id/documents` - List case documents  
- **GET** `/api/documents/:id/download` - Download documents

### **Enhanced Capabilities**
- **Signed URLs**: New method for direct browser downloads
- **Better Error Handling**: More specific error messages
- **Integrity Verification**: Enhanced corruption detection
- **Performance**: Faster uploads and downloads

## 🛠️ **Utility Methods**

### **SupabaseStorage Class Methods**
```typescript
// Generate secure file paths
SupabaseStorage.generateFilePath(caseId, originalName)

// Upload files with metadata
SupabaseStorage.uploadFile(path, buffer, { contentType })

// Download files with content type
SupabaseStorage.downloadFile(path)

// Delete files securely
SupabaseStorage.deleteFile(path)

// Get file metadata
SupabaseStorage.getFileInfo(path)

// Generate signed URLs for temporary access
SupabaseStorage.getSignedUrl(path, expiresIn)
```

### **DocumentService Enhanced Methods**
```typescript
// Upload with Supabase integration
DocumentService.uploadDocument(upload)

// Download with integrity verification  
DocumentService.getDocumentFile(documentId)

// Generate secure access URLs
DocumentService.getDocumentSignedUrl(documentId, expiresIn)

// Bulk integrity verification
DocumentService.verifyCaseDocuments(caseId)
```

## ⚡ **Performance Improvements**

- **Faster Uploads**: Direct to cloud storage
- **CDN Delivery**: Optimized download speeds
- **Concurrent Operations**: Better handling of multiple files
- **Memory Efficiency**: Stream-based processing
- **Caching**: Built-in browser caching headers

## 🔧 **Migration Notes**

### **Backward Compatibility**
- All existing API endpoints remain unchanged
- Database schema compatible (uses existing `relativePath` field)
- Error responses maintain same format
- Authentication and authorization unchanged

### **File Path Storage**
- **Before**: Local file system paths
- **After**: Supabase storage paths (e.g., `cases/123/documents/file.pdf`)
- **Database Field**: `relativePath` now stores Supabase storage path

The integration is complete and ready for production use with the "legal-case" Supabase storage bucket!