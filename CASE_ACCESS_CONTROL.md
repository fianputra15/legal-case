# Case Access Control Implementation

## ✅ **Endpoints Implemented**

### **POST /api/cases/:id/access** - Grant Lawyer Access
**Purpose**: Allow case owners to grant lawyers access to their cases

### **DELETE /api/cases/:id/access** - Revoke Lawyer Access  
**Purpose**: Allow case owners to revoke lawyers' access to their cases

## 🔒 **Access Control Logic**

### **Authorization Requirements**
1. **Authentication**: Valid JWT token required (401 if missing)
2. **Role Restriction**: Only `CLIENT` role users can grant/revoke access
3. **Ownership**: User must own the case (checked via `isCaseOwner()`)
4. **Target Validation**: Lawyer must exist and have `LAWYER` role

### **Multi-Layer Security Flow**
```typescript
// 1. Authentication Check
const authResult = await AuthMiddleware.requireAuth(request);

// 2. Role Check (CLIENT only)
if (user.role !== 'CLIENT') {
  return ResponseHandler.forbidden('Only case owners can grant/revoke lawyer access');
}

// 3. Ownership Check
const isOwner = await AuthorizationService.isCaseOwner(user, caseId);

// 4. Target User Validation (for grants)
const lawyer = await userRepository.findById(lawyerId);
if (lawyer.role !== 'lawyer') {
  return { success: false, message: 'User must have LAWYER role to be granted case access' };
}

// 5. Duplicate Prevention
const hasAccess = await caseRepository.hasAccess(caseId, lawyerId);
if (hasAccess) {
  return { success: false, message: 'Lawyer already has access to this case' };
}
```

## 📋 **Business Rules**

### **Grant Access Rules**
1. ✅ Only case owners (CLIENT role) can grant access
2. ✅ Target user must exist in the system
3. ✅ Target user must have `LAWYER` role
4. ✅ Target user must have active account
5. ✅ Prevents duplicate access entries (unique constraint)
6. ✅ Database uses unique constraint on `(caseId, lawyerId)`

### **Revoke Access Rules**
1. ✅ Only case owners (CLIENT role) can revoke access
2. ✅ Target user must exist in the system
3. ✅ Lawyer must currently have access to the case
4. ✅ Graceful handling if access doesn't exist

## 🔧 **Database Implementation**

### **Prisma Schema (CaseAccess)**
```sql
model CaseAccess {
  id        String   @id @default(cuid())
  caseId    String
  lawyerId  String
  grantedAt DateTime @default(now())

  // Relations
  case   Case @relation("CaseAccess", fields: [caseId], references: [id], onDelete: Cascade)
  lawyer User @relation("LawyerAccess", fields: [lawyerId], references: [id], onDelete: Cascade)

  @@unique([caseId, lawyerId]) // Prevents duplicate access
  @@map("case_access")
}
```

### **Repository Methods**
```typescript
// Grant access with duplicate prevention
async grantAccess(caseId: string, lawyerId: string): Promise<boolean> {
  try {
    await prisma.caseAccess.create({
      data: { caseId, lawyerId },
    });
    return true;
  } catch (error) {
    if (error?.code === 'P2002') { // Unique constraint violation
      return false; // Access already exists
    }
    throw error;
  }
}

// Revoke access with existence check
async revokeAccess(caseId: string, lawyerId: string): Promise<boolean> {
  const result = await prisma.caseAccess.deleteMany({
    where: { caseId, lawyerId },
  });
  return result.count > 0; // Returns true if access was revoked
}

// Check existing access
async hasAccess(caseId: string, lawyerId: string): Promise<boolean> {
  const access = await prisma.caseAccess.findFirst({
    where: { caseId, lawyerId },
  });
  return !!access;
}
```

## 📨 **Request/Response Examples**

### **Grant Access Request**
```bash
curl -X POST "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1/access" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_OWNER_JWT_TOKEN" \
  -d '{
    "lawyerId": "clx2b3c4d5e6f7g8h9i0j1k2"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Access granted successfully",
  "data": {
    "caseId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "lawyerId": "clx2b3c4d5e6f7g8h9i0j1k2",
    "grantedBy": "clx9y8x7w6v5u4t3s2r1q0p9",
    "grantedAt": "2026-01-19T16:30:00.000Z"
  }
}
```

### **Revoke Access Request**
```bash
curl -X DELETE "http://localhost:3000/api/cases/clx1a2b3c4d5e6f7g8h9i0j1/access" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CLIENT_OWNER_JWT_TOKEN" \
  -d '{
    "lawyerId": "clx2b3c4d5e6f7g8h9i0j1k2"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Access revoked successfully",
  "data": {
    "caseId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "lawyerId": "clx2b3c4d5e6f7g8h9i0j1k2",
    "revokedBy": "clx9y8x7w6v5u4t3s2r1q0p9",
    "revokedAt": "2026-01-19T16:35:00.000Z"
  }
}
```

## ❌ **Error Responses**

### **Authentication Errors**
```json
// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required"
}
```

### **Authorization Errors**
```json
// 403 Forbidden - Wrong Role
{
  "success": false,
  "error": "Only case owners can grant lawyer access"
}

// 403 Forbidden - Not Owner
{
  "success": false,
  "error": "Only case owners can grant lawyer access"
}

// 404 Not Found - Case doesn't exist
{
  "success": false,
  "error": "Case not found"
}
```

### **Business Logic Errors**
```json
// 400 Bad Request - Lawyer not found
{
  "success": false,
  "error": "Lawyer not found"
}

// 400 Bad Request - Wrong role
{
  "success": false,
  "error": "User must have LAWYER role to be granted case access"
}

// 400 Bad Request - Duplicate access
{
  "success": false,
  "error": "Lawyer already has access to this case"
}

// 400 Bad Request - No existing access (revoke)
{
  "success": false,
  "error": "Lawyer does not have access to this case"
}

// 400 Bad Request - Inactive account
{
  "success": false,
  "error": "Lawyer account is not active"
}
```

## 🧪 **Authorization Test Matrix**

### **Grant Access Authorization**
| User Role | Case Owner | Target Role | Result |
|-----------|------------|-------------|---------|
| CLIENT (Owner) | ✅ Yes | LAWYER | ✅ 200 OK |
| CLIENT (Owner) | ✅ Yes | CLIENT | ❌ 400 Bad Request |
| CLIENT (Owner) | ✅ Yes | ADMIN | ❌ 400 Bad Request |
| CLIENT (Non-owner) | ❌ No | LAWYER | ❌ 403 Forbidden |
| LAWYER | N/A | LAWYER | ❌ 403 Forbidden |
| ADMIN | N/A | LAWYER | ❌ 403 Forbidden |

### **Edge Cases Handled**
```bash
# Non-existent case
POST /api/cases/nonexistent/access → 404 Not Found

# Non-existent lawyer
POST /api/cases/valid-case/access {"lawyerId": "nonexistent"} → 400 Bad Request

# Duplicate access grant
POST /api/cases/case123/access {"lawyerId": "lawyer123"} → 400 Bad Request (if already exists)

# Revoke non-existent access  
DELETE /api/cases/case123/access {"lawyerId": "lawyer123"} → 400 Bad Request (if no access)

# Invalid JSON
POST /api/cases/case123/access {invalid json} → 400 Bad Request

# Missing lawyerId
POST /api/cases/case123/access {} → 400 Bad Request
```

## 🛡️ **Security Features**

### **Input Validation**
- ✅ Case ID format validation
- ✅ JSON parsing with error handling  
- ✅ Schema validation using Zod
- ✅ Lawyer ID presence validation

### **Authorization Security**
- ✅ Multi-layer authorization (auth → role → ownership)
- ✅ Strict role enforcement (CLIENT only)
- ✅ Case existence verification
- ✅ Ownership verification via `isCaseOwner()`

### **Business Logic Security**
- ✅ Target user existence validation
- ✅ Target user role validation (LAWYER only)
- ✅ Target user status validation (active only)
- ✅ Duplicate access prevention
- ✅ Existing access verification (for revocation)

### **Database Security**
- ✅ Unique constraints prevent duplicate access
- ✅ Foreign key constraints ensure referential integrity
- ✅ Cascade deletes handle cleanup when users/cases are deleted
- ✅ Indexed queries for performance

### **Audit & Logging**
- ✅ All access grant/revoke attempts logged
- ✅ Failed authorization attempts logged with warnings
- ✅ Business logic failures logged with context
- ✅ Error cases logged for debugging

This implementation provides secure, flexible case access management while maintaining strict authorization controls and comprehensive validation at all levels.