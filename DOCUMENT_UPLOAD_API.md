# Document Upload API Documentation

## POST /api/cases/:id/documents

Upload a document to a specific legal case with secure validation and authorization.

### Security Features
- **Authentication Required**: Must be logged in with valid JWT token
- **Authorization Check**: User must have access to the specified case
- **File Validation**: MIME type, size, and filename security checks
- **Secure Storage**: Files renamed with UUID, stored outside public directory
- **Audit Trail**: All uploads logged with user attribution

### Request

**URL Pattern**: `/api/cases/{caseId}/documents`

**Method**: `POST`

**Headers**:
```
Content-Type: multipart/form-data
Cookie: auth-token=<JWT_TOKEN>
```

**Form Data Fields**:
- `file` (File, required): Document file to upload
- `documentType` (string, optional): Type of document (CONTRACT, EVIDENCE, CORRESPONDENCE, etc.)

### Supported File Types & Limits

| File Type | MIME Type | Extension | Max Size |
|-----------|-----------|-----------|----------|
| PDF | `application/pdf` | `.pdf` | 25MB |
| Word Document | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` | 25MB |
| PNG Image | `image/png` | `.png` | 25MB |
| JPEG Image | `image/jpeg` | `.jpg`, `.jpeg` | 25MB |

### Example Requests

#### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('documentType', 'CONTRACT');

const response = await fetch('/api/cases/clabcd123/documents', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Include auth cookies
});

const result = await response.json();
```

#### cURL
```bash
curl -X POST \
  -H "Cookie: auth-token=your-jwt-token" \
  -F "file=@/path/to/document.pdf" \
  -F "documentType=EVIDENCE" \
  http://localhost:3000/api/cases/clabcd123/documents
```

### Response Examples

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "cldoc789xyz",
    "originalName": "contract-v2.pdf",
    "size": 2048576,
    "mimeType": "application/pdf",
    "documentType": "CONTRACT",
    "status": "PENDING",
    "uploadedAt": "2026-01-18T10:30:00.000Z",
    "uploadedBy": {
      "id": "user123",
      "name": "John Smith"
    }
  },
  "message": "Document uploaded successfully"
}
```

#### Error Responses

**401 Unauthorized** - Not authenticated:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**404 Not Found** - Case doesn't exist or no access:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND", 
    "message": "Case not found or access denied"
  }
}
```

**400 Bad Request** - Invalid file:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "File type 'application/exe' not allowed. Supported types: PDF, DOCX, PNG, JPEG"
  }
}
```

**400 Bad Request** - File too large:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST", 
    "message": "File size 30MB exceeds maximum allowed size of 25MB"
  }
}
```

**400 Bad Request** - No file provided:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "No file provided - field name must be \"file\""
  }
}
```

**500 Internal Server Error** - Server error:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An error occurred while uploading the document"
  }
}
```

### Authorization Rules

| User Role | Access Rules |
|-----------|-------------|
| **ADMIN** | Can upload to any case |
| **CLIENT** | Can upload to cases they own |
| **LAWYER** | Can upload to cases where they have explicit access granted |

### Security Notes

1. **File Validation**: All files validated for type, size, and filename safety
2. **Path Traversal Protection**: Filenames sanitized, no user-controlled paths
3. **Secure Storage**: Files stored with UUID names outside web directory
4. **No File Path Exposure**: API never returns filesystem paths to clients
5. **Audit Logging**: All uploads logged with user, timestamp, and case info
6. **Error Message Safety**: No stack traces or sensitive info in error responses

### Document Types

Available `documentType` values:
- `CONTRACT` - Legal contracts and agreements
- `EVIDENCE` - Evidence materials and exhibits
- `CORRESPONDENCE` - Letters, emails, communications
- `LEGAL_BRIEF` - Legal briefs and memoranda
- `COURT_FILING` - Court documents and filings
- `IDENTIFICATION` - ID documents and certificates
- `FINANCIAL_RECORD` - Financial statements and records
- `OTHER` - Other document types (default)

### Integration Example

```typescript
// TypeScript example with proper error handling
async function uploadCaseDocument(
  caseId: string, 
  file: File, 
  documentType?: string
): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (documentType) {
    formData.append('documentType', documentType);
  }
  
  try {
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Upload failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
}
```

### Rate Limiting

Consider implementing rate limiting for document uploads:
- Max 10 uploads per minute per user
- Max 100MB total upload size per hour per user
- Temporary cooldown for repeated failed uploads