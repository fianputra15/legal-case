# Document Download Security Implementation

## GET /api/documents/:id/download

### Security Architecture

The document download endpoint implements multiple layers of security to ensure only authorized users can access files while preventing information leakage and timing attacks.

## 🔒 **Authorization Flow**

### **1. Authentication Check**
```typescript
const authResult = await AuthMiddleware.requireAuth(request);
```
- Validates JWT token from header or cookie
- Returns 401 immediately if not authenticated

### **2. Document Metadata Retrieval**  
```typescript
const documentMetadata = await DocumentService.getDocumentMetadata(documentId);
```
- Gets document info including `caseId` for authorization
- Uses try/catch to prevent error information leakage
- Returns generic 404 on any retrieval failure

### **3. Case Access Authorization**
```typescript
const canAccess = await AuthorizationService.canAccessCase(user, documentMetadata.caseId);
```
- **Critical Security Check**: Verifies user can access the document's parent case
- Server-side validation - never trusts client-side permissions
- Same authorization logic as case listing endpoints

### **4. Document Status Validation**
```typescript
if (documentMetadata.status === 'DELETED') {
  return 410; // Gone
}
```
- Handles soft-deleted documents with proper HTTP status
- Prevents access to archived/deleted content

## 🛡️ **Security Protections**

### **Information Leakage Prevention**

#### **Same Error Pattern**:
```typescript
// All these scenarios return identical 404 responses:
// - Document doesn't exist
// - User lacks case access  
// - Document metadata retrieval fails
return ResponseHandler.notFound('Document not found or access denied');
```

#### **No Server Path Exposure**:
- Internal file paths never included in responses
- UUID-based storage names not revealed
- Only original user filenames exposed (safely sanitized)

#### **Error Message Consistency**:
- Generic errors prevent system information disclosure
- Specific errors only logged server-side
- No stack traces or internal details in client responses

### **Timing Attack Prevention**

#### **Consistent Response Times**:
- Database queries execute regardless of document existence
- Authorization checks always performed
- Same code path for valid/invalid requests where possible

#### **No Early Returns on Invalid Data**:
- Full validation chain executed even for obviously invalid IDs
- Prevents timing-based document enumeration

### **File Integrity Protection**

#### **Checksum Verification**:
```typescript
// In DocumentService.getDocumentFile()
if (document.checksum) {
  const fileChecksum = createHash('sha256').update(buffer).digest('hex');
  if (fileChecksum !== document.checksum) {
    throw new Error('File integrity check failed - file may be corrupted');
  }
}
```

#### **Corruption Handling**:
- SHA-256 checksum validation on every download
- Specific error handling for integrity failures
- Audit logging for potential tampering attempts

## 📁 **File Streaming Security**

### **Safe Headers**
```typescript
// Content type from validated metadata
headers.set('Content-Type', documentFile.mimeType);

// Force download, prevent inline execution
headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);

// Security headers
headers.set('X-Content-Type-Options', 'nosniff');
headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
```

### **Filename Sanitization**
```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')  // Remove path separators
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')  // Remove control chars
    .replace(/^[.\s]+|[.\s]+$/g, '')  // Remove leading/trailing dots
    .substring(0, 255)  // Limit length
    || 'document';  // Fallback
}
```

### **Content Security**
- **No Inline Execution**: `Content-Disposition: attachment` forces download
- **MIME Type Validation**: Only pre-approved document types served
- **Content Sniffing Prevention**: `X-Content-Type-Options: nosniff`

## 📝 **Audit & Logging**

### **Security Events Logged**:
```typescript
// Unauthorized access attempts
Logger.warn(`User ${user.email} attempted unauthorized access to document ${documentId}`);

// Successful downloads
Logger.info(`User ${user.email} downloaded document ${documentId} (${filename})`);

// File integrity failures  
Logger.error(`File integrity check failed for document ${documentId} - possible tampering`);

// System errors (server-side only)
Logger.error('Document download failed:', error);
```

### **Audit Trail Includes**:
- User email and ID
- Document ID and filename  
- Case ID context
- Timestamp of access
- Success/failure status
- Error details (server logs only)

## ⚡ **Performance & Streaming**

### **Efficient File Delivery**:
- Direct buffer streaming (no temporary files)
- Proper `Content-Length` header for progress tracking
- Memory-efficient for large documents

### **Resource Protection**:
- File size limits enforced during upload
- Authorization checked before file read
- Proper error handling prevents resource leaks

## 🚨 **Error Handling**

### **HTTP Status Codes**:
- `200` - Successful download
- `400` - Invalid document ID format
- `401` - Authentication required
- `404` - Document not found OR access denied (security)
- `410` - Document has been deleted (soft delete)
- `500` - Server error (file corruption, system issues)

### **Graceful Degradation**:
- Missing files return user-friendly errors
- Corrupted files detected and reported
- System errors don't expose internal details
- Network interruptions handled by browser/client

## 🔍 **Security Testing Scenarios**

### **Access Control Tests**:
1. **Unauthenticated Access**: Should return 401
2. **Cross-Case Access**: User from Case A accessing Case B documents
3. **Deleted Document Access**: Should return 410 Gone
4. **Non-existent Document**: Should return 404 (same as unauthorized)

### **File Security Tests**:
1. **Filename Injection**: Malicious filenames should be sanitized
2. **MIME Type Spoofing**: Content-Type should match stored metadata
3. **Path Traversal**: No way to access files outside document storage
4. **Integrity Verification**: Corrupted files should be detected

### **Information Leakage Tests**:
1. **Error Consistency**: Same errors for unauthorized vs non-existent
2. **Timing Analysis**: No significant timing differences for invalid requests  
3. **Header Information**: No internal paths or system info exposed

The download endpoint provides secure, auditable, and performant document access while maintaining strict authorization controls and preventing common security vulnerabilities.