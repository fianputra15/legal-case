# Document List API Documentation

## GET /api/cases/:id/documents

List all documents uploaded to a specific legal case with secure authorization and filtering options.

### Security Features
- **Authentication Required**: Valid JWT token in header or cookie
- **Case Authorization**: User must have access to the specified case  
- **No Internal Paths**: File system paths never exposed to clients
- **Audit Logging**: All access attempts logged for compliance
- **Same Error Pattern**: Non-existent and unauthorized cases return identical errors

### Request

**URL Pattern**: `/api/cases/{caseId}/documents`

**Method**: `GET`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
# OR
Cookie: auth-token=<JWT_TOKEN>
```

**Query Parameters** (all optional):

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| `status` | string | Filter by document status | `PENDING`, `PROCESSED`, `ARCHIVED`, `DELETED` |
| `documentType` | string | Filter by document type | `CONTRACT`, `EVIDENCE`, `CORRESPONDENCE`, etc. |
| `limit` | integer | Max documents returned (1-100) | Default: 50 |
| `offset` | integer | Skip documents for pagination | Default: 0 |

### Example Requests

#### Basic Request
```javascript
const response = await fetch('/api/cases/clcase123/documents', {
  credentials: 'include'
});
```

#### With Filters
```javascript
const response = await fetch('/api/cases/clcase123/documents?' + 
  'status=PROCESSED&documentType=CONTRACT&limit=10&offset=0', {
  credentials: 'include'
});
```

#### cURL Example
```bash
curl -H "Cookie: auth-token=your-jwt-token" \
  "http://localhost:3000/api/cases/clcase123/documents?limit=20"
```

### Response Examples

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cldoc789xyz",
      "originalName": "service-agreement.pdf",
      "size": 2048576,
      "mimeType": "application/pdf", 
      "documentType": "CONTRACT",
      "status": "PROCESSED",
      "uploadedBy": {
        "id": "cluser123",
        "firstName": "John",
        "lastName": "Smith"
      },
      "createdAt": "2026-01-18T10:30:00.000Z"
    },
    {
      "id": "cldoc456abc", 
      "originalName": "evidence-photo.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "documentType": "EVIDENCE", 
      "status": "PENDING",
      "uploadedBy": {
        "id": "cluser456",
        "firstName": "Jane",
        "lastName": "Doe"
      },
      "createdAt": "2026-01-18T09:15:00.000Z"
    }
  ],
  "message": "Documents retrieved successfully",
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Empty Case Response (200 OK)
```json
{
  "success": true,
  "data": [],
  "message": "Documents retrieved successfully",
  "pagination": {
    "total": 0,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
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

**400 Bad Request** - Invalid parameters:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Limit must be between 1 and 100"
  }
}
```

### Authorization Rules

| User Role | Access Rules |
|-----------|-------------|
| **CLIENT** | Can list documents from cases they own |
| **LAWYER** | Can list documents from cases where they have access |

### Security Considerations

#### 🔒 **Path Security**
- **No File Paths Exposed**: Internal storage paths never returned to clients
- **UUID File Names**: Actual stored filenames are secure UUIDs
- **Access Only via API**: Files cannot be accessed directly via filesystem

#### 🛡️ **Authorization Defense**
- **Server-Side Validation**: Case access re-verified on every request
- **Same Error Pattern**: Unauthorized and non-existent cases return identical 404s
- **No Information Leakage**: Error messages don't reveal case existence

#### 📝 **Audit & Compliance**
- **Access Logging**: All document listing attempts logged with user info
- **Parameter Validation**: All query parameters sanitized and validated
- **Error Logging**: Server errors logged for debugging without client exposure

### Pagination & Performance

#### **Efficient Pagination**:
- Uses `limit` + 1 pattern to detect if more results exist
- `hasMore` boolean indicates if additional pages available
- Maximum 100 documents per request to prevent resource exhaustion

#### **Database Optimization**:
- Indexed queries on `caseId`, `status`, `documentType`
- Efficient filtering at database level
- Ordered by `createdAt DESC` for recent-first listing

### Integration Example

```typescript
interface DocumentListResponse {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  documentType: string;
  status: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

async function getCaseDocuments(
  caseId: string,
  options?: {
    status?: string;
    documentType?: string;
    limit?: number;
    offset?: number;
  }
): Promise<DocumentListResponse[]> {
  const params = new URLSearchParams();
  
  if (options?.status) params.append('status', options.status);
  if (options?.documentType) params.append('documentType', options.documentType);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  
  const queryString = params.toString();
  const url = `/api/cases/${caseId}/documents${queryString ? '?' + queryString : ''}`;
  
  const response = await fetch(url, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch documents');
  }
  
  const result = await response.json();
  return result.data;
}

// Usage examples:
const allDocs = await getCaseDocuments('clcase123');
const contracts = await getCaseDocuments('clcase123', { 
  documentType: 'CONTRACT',
  status: 'PROCESSED' 
});
const paginated = await getCaseDocuments('clcase123', { 
  limit: 10, 
  offset: 20 
});
```

### Performance Notes

- **Recommended Limit**: 20-50 documents per request for optimal performance
- **Large Cases**: Use pagination for cases with 100+ documents  
- **Real-time Updates**: Consider WebSocket integration for live document lists
- **Caching**: Consider implementing Redis cache for frequently accessed cases