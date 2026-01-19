# PATCH /api/cases/:id - Implementation Guide

## ✅ **Implementation Overview**

### **Endpoint**: `PATCH /api/cases/:id`
**Purpose**: Partially update a case with ownership-based authorization

### **Authorization Requirements**
1. **Authentication**: Valid JWT token required (401 if missing)
2. **Role Restriction**: Only `CLIENT` role users can update cases (403 for lawyers/admins)
3. **Ownership**: User must own the case (403 if not owner, 404 if case doesn't exist)

## 🔒 **Security & Authorization Flow**

### **Multi-Level Authorization**
```typescript
// 1. Authentication check
const authResult = await AuthMiddleware.requireAuth(request);

// 2. Role check (CLIENT only)
if (user.role !== 'CLIENT') {
  return ResponseHandler.forbidden('Only case owners can update cases');
}

// 3. Ownership check
const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
if (!isOwner) {
  // Distinguish between non-existent and not-owned cases
  const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
  return hasAccess 
    ? ResponseHandler.forbidden('Only case owners can update cases')  // Exists but not owner
    : ResponseHandler.notFound('Case not found');                     // Doesn't exist
}
```

### **Status Code Strategy**
| Scenario | Status Code | Response Message | Security Consideration |
|----------|-------------|------------------|------------------------|
| Not authenticated | `401 Unauthorized` | "Authentication required" | Standard auth failure |
| Wrong role (LAWYER/ADMIN) | `403 Forbidden` | "Only case owners can update cases" | Role enforcement |
| Case doesn't exist | `404 Not Found` | "Case not found" | No information leakage |
| Not case owner | `403 Forbidden` | "Only case owners can update cases" | Clear ownership requirement |
| Invalid JSON | `400 Bad Request` | "Invalid JSON format" | Input validation |
| Validation failed | `400 Bad Request` | Specific validation message | User-friendly errors |
| Success | `200 OK` | Updated case data | Normal operation |

## 📋 **Allowed Updates**

### **Updatable Fields**
- **title** (string): Case title (1-255 characters, cannot be empty)
- **category** (enum): Case category from predefined list
- **status** (enum): Case status from predefined values
- **description** (string, optional): Case description

### **Validation Rules**
```typescript
{
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  category: z.enum(['CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'FAMILY_LAW', 'IMMIGRATION_LAW', 'INTELLECTUAL_PROPERTY', 'LABOR_LAW', 'REAL_ESTATE', 'TAX_LAW', 'OTHER']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_CLIENT', 'CLOSED', 'ARCHIVED']).optional(),
  description: z.string().optional()
}
```

## 📨 **Request Examples**

### **Update Title Only**
```bash
curl -X PATCH "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -d '{
    "title": "Updated Contract Dispute Resolution"
  }'
```

### **Update Status Only**
```bash
curl -X PATCH "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### **Update Multiple Fields**
```bash
curl -X PATCH "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -d '{
    "title": "Family Custody Settlement",
    "category": "FAMILY_LAW",
    "status": "UNDER_REVIEW",
    "description": "Updated description with recent developments"
  }'
```

### **Clear Description (Set to Empty)**
```bash
curl -X PATCH "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_JWT_TOKEN" \
  -d '{
    "description": ""
  }'
```

## 📤 **Response Examples**

### **Success Response (200 OK)**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "title": "Updated Contract Dispute Resolution",
    "category": "CORPORATE_LAW",
    "status": "IN_PROGRESS",
    "description": "Updated description with recent developments",
    "priority": 2,
    "ownerId": "clx9y8x7w6v5u4t3s2r1q0p9",
    "createdAt": "2026-01-19T10:30:00.000Z",
    "updatedAt": "2026-01-19T15:45:30.000Z"
  }
}
```

### **Error Responses**

#### **401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### **403 Forbidden - Wrong Role**
```json
{
  "success": false,
  "error": "Only case owners can update cases"
}
```

#### **403 Forbidden - Not Owner**
```json
{
  "success": false,
  "error": "Only case owners can update cases"
}
```

#### **404 Not Found**
```json
{
  "success": false,
  "error": "Case not found"
}
```

#### **400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": "Validation failed: Title must be less than 255 characters"
}
```

#### **400 Bad Request - Invalid Category**
```json
{
  "success": false,
  "error": "Invalid category. Must be one of: CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER"
}
```

#### **400 Bad Request - Empty Update**
```json
{
  "success": false,
  "error": "At least one field must be provided for update"
}
```

## 🔧 **Implementation Details**

### **Database Update Strategy**
```typescript
// Only update fields that are explicitly provided
const updateData: any = {};
if (data.title !== undefined) updateData.title = data.title;
if (data.category !== undefined) updateData.category = data.category;
if (data.status !== undefined) updateData.status = data.status;
if (data.description !== undefined) updateData.description = data.description;

// Prisma update with only changed fields
const case_ = await prisma.case.update({
  where: { id },
  data: updateData,
});
```

### **Partial Update Benefits**
1. **Efficiency**: Only updates specified fields
2. **Flexibility**: Can update single or multiple fields
3. **Safety**: Unchanged fields remain unmodified
4. **Bandwidth**: Smaller request payloads
5. **Atomicity**: All updates in single database transaction

## 🧪 **Test Scenarios**

### **Authorization Matrix**
| User Type | Own Case | Other Client's Case | Result |
|-----------|----------|-------------------|---------|
| CLIENT (Owner) | ✅ 200 OK | ❌ 403/404 | Update allowed only for own cases |
| CLIENT (Non-owner) | ❌ 403 Forbidden | ❌ 403/404 | Must own the case |
| LAWYER | ❌ 403 Forbidden | ❌ 403 Forbidden | Lawyers cannot update any cases |

### **Validation Test Cases**
```bash
# Valid single field update
PATCH /api/cases/123 { "title": "New Title" } → 200 OK

# Valid multiple field update  
PATCH /api/cases/123 { "title": "New Title", "status": "CLOSED" } → 200 OK

# Invalid empty title
PATCH /api/cases/123 { "title": "" } → 400 Bad Request

# Invalid category
PATCH /api/cases/123 { "category": "INVALID" } → 400 Bad Request

# Empty update (no fields)
PATCH /api/cases/123 {} → 400 Bad Request

# Title too long (>255 chars)
PATCH /api/cases/123 { "title": "very long title..." } → 400 Bad Request
```

## 🛡️ **Security Features**

1. **Role Enforcement**: Only CLIENT role can update cases
2. **Ownership Verification**: Must own the case to update it
3. **Input Validation**: All fields validated against strict schemas
4. **No Information Leakage**: Consistent error responses
5. **Audit Logging**: All update attempts logged with full context
6. **Race Condition Handling**: Additional checks prevent edge cases
7. **Partial Update Safety**: Only explicitly provided fields are updated

This implementation provides secure, flexible case updates while maintaining strict authorization controls and preventing common security vulnerabilities.