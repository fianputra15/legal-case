# GET /api/cases/:id Implementation & Security Analysis

## ✅ **Implementation Overview**

### **Endpoint**: `GET /api/cases/:id`
**Purpose**: Retrieve a specific case by ID with proper authorization

### **Authorization Flow**
1. **Authentication Check**: Verify user has valid JWT token (returns 401 if not)
2. **Authorization Check**: Use `AuthorizationService.canAccessCase(user, caseId)` 
3. **Data Retrieval**: Fetch case data only if authorized
4. **Response**: Return case data or appropriate error

## 🔒 **Security Design Decisions**

### **Status Code Strategy: 404-First Security**

| Scenario | Status Code | Rationale |
|----------|-------------|-----------|
| **Not authenticated** | `401 Unauthorized` | Standard auth failure - no sensitive info exposed |
| **Case doesn't exist** | `404 Not Found` | Standard resource not found |
| **Case exists but no access** | `404 Not Found` | **SECURITY**: Prevents resource enumeration |
| **Valid access** | `200 OK` | Return case data |
| **Server error** | `500 Internal Error` | Generic error, no details exposed |

### **Why 404 Instead of 403?**

**❌ Using 403 Forbidden would leak information:**
```bash
# Attacker can determine which cases exist
GET /api/cases/case-123 → 403 Forbidden (case exists, no access)
GET /api/cases/case-999 → 404 Not Found (case doesn't exist)
```

**✅ Using 404 Not Found prevents enumeration:**
```bash
# Attacker cannot determine case existence
GET /api/cases/case-123 → 404 Not Found (exists but no access)
GET /api/cases/case-999 → 404 Not Found (doesn't exist)
```

### **Security Benefits**
1. **Resource Enumeration Prevention**: Attackers cannot discover which cases exist
2. **Data Leakage Prevention**: No distinction between "exists" and "no access"
3. **Consistent Response**: Same error for multiple failure scenarios
4. **Audit Trail**: All access attempts logged with detailed context

## 🔧 **Technical Implementation**

### **Authorization Usage**
```typescript
// Direct usage of canAccessCase for fine-grained control
const hasAccess = await AuthorizationService.canAccessCase(user, caseId);

if (!hasAccess) {
  // Security: Always return 404, never 403
  return ResponseHandler.notFound('Case not found');
}
```

### **Authorization Service Integration**
The `canAccessCase()` method handles:
- **Role-based access control**
- **Database query optimization** (single query with OR conditions)
- **Built-in security** (same response for non-existent/unauthorized cases)

```typescript
// AuthorizationService.canAccessCase() handles:
// - ADMIN: Full access to all cases
// - CLIENT: Access only to owned cases (ownerId === user.id)
// - LAWYER: Access to explicitly granted cases via CaseAccess table
```

### **Request Flow**
```
Request → Authentication Check → canAccessCase() → Database Query → Response
    ↓            ↓                     ↓               ↓           ↓
   401        Valid JWT         true/false        Case Data    200/404
```

## 📋 **Example Usage**

### **Successful Request**
```bash
curl -X GET "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "title": "Contract Dispute Resolution",
    "category": "CORPORATE_LAW",
    "status": "OPEN",
    "description": "Client needs assistance with breach of contract claim",
    "priority": 2,
    "ownerId": "clx9y8x7w6v5u4t3s2r1q0p9",
    "createdAt": "2026-01-19T10:30:00.000Z",
    "updatedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

### **Unauthorized Access Attempt**
```bash
curl -X GET "http://localhost:3000/api/cases/someone-else-case-id" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Case not found"
}
```

### **Non-existent Case**
```bash
curl -X GET "http://localhost:3000/api/cases/nonexistent-case-id" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Case not found"
}
```

### **Unauthenticated Request**
```bash
curl -X GET "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1"
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

## 🛡️ **Edge Cases Handled**

### **1. Invalid Case ID Format**
```bash
GET /api/cases/
GET /api/cases/   
GET /api/cases/null
```
**Response**: `404 Not Found` (prevents errors, maintains security)

### **2. Race Conditions**
- Case deleted between authorization check and data fetch
- **Handled**: Additional null check after database query
- **Response**: `404 Not Found` with warning log

### **3. Database Errors**
- Connection issues, constraint violations, etc.
- **Handled**: Generic 500 error without exposing details
- **Security**: No internal error information leaked

## 📊 **Logging Strategy**

### **Security Events Logged**
```typescript
// Unauthorized access attempts (WARN level)
Logger.warn(`Access denied or case not found: User ${user.email} (${user.role}) attempted to access case ${caseId}`);

// Successful access (INFO level)
Logger.info(`Case ${caseId} successfully accessed by user ${user.email} (${user.role})`);

// Race conditions (WARN level)
Logger.warn(`Case ${caseId} disappeared between authorization and fetch for user ${user.email}`);

// Server errors (ERROR level)
Logger.error('Get case error:', error);
```

## ⚡ **Performance Considerations**

### **Optimizations**
1. **Single Authorization Query**: `canAccessCase()` uses one optimized database query
2. **Minimal Data Selection**: Authorization check selects only `id` field
3. **Early Validation**: Invalid case IDs rejected before database queries
4. **Efficient Logging**: Structured logging with relevant context

### **Database Query Pattern**
```sql
-- Optimized query used by canAccessCase()
SELECT id FROM cases 
WHERE id = ? AND (
  (role = 'CLIENT' AND ownerId = ?) OR
  (role = 'LAWYER' AND EXISTS(SELECT 1 FROM case_access WHERE caseId = ? AND lawyerId = ?)) OR
  (role = 'ADMIN')
)
```

## 🧪 **Testing Scenarios**

### **Authorization Matrix**
| User Role | Own Case | Other Client's Case | Granted Lawyer Case | Any Case (Admin) |
|-----------|----------|-------------------|-------------------|------------------|
| CLIENT    | ✅ 200   | ❌ 404            | ❌ 404            | ❌ 404           |
| LAWYER    | ❌ 404   | ❌ 404            | ✅ 200            | ❌ 404           |
| ADMIN     | ✅ 200   | ✅ 200            | ✅ 200            | ✅ 200           |

### **Security Test Cases**
```bash
# Test resource enumeration prevention
for id in case-1 case-2 case-3 nonexistent; do
  curl -s -H "Authorization: Bearer $CLIENT_TOKEN" \
    "http://localhost:3000/api/cases/$id" | jq .error
done
# Should return "Case not found" for all unauthorized/nonexistent cases
```

This implementation provides maximum security while maintaining usability and performance, following industry best practices for resource access control and information security.