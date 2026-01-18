# Server-Side Authorization Implementation

## Core Authorization Helpers

### 1. `canAccessCase(user, caseId): Promise<boolean>`

**Purpose**: Determines if a user can access a specific case

**Rules**:
- **ADMIN**: Full access to all cases (administrative privileges)
- **CLIENT**: Can only access cases they own (`ownerId === user.id`)
- **LAWYER**: Can access cases explicitly granted via `CaseAccess` table

**Security Features**:
- Single optimized database query with role-based conditions
- Returns consistent `false` for non-existent and unauthorized cases
- Logs unauthorized access attempts for security monitoring
- Fails secure (returns `false` on any error)

```typescript
// Usage
const hasAccess = await AuthorizationService.canAccessCase(user, caseId);
if (!hasAccess) {
  return ResponseHandler.notFound('Case not found'); // 404 prevents enumeration
}
```

### 2. `isCaseOwner(user, caseId): Promise<boolean>`

**Purpose**: Determines if a user owns a specific case (has modification rights)

**Rules**:
- **ADMIN**: Considered owner of all cases (administrative override)
- **CLIENT**: Must be actual owner (`ownerId === user.id`)
- **LAWYER**: Cannot own cases (can only have access granted)

**Security Features**:
- Explicit role-based ownership logic
- Admin verification still checks case existence
- Logs ownership violation attempts
- Fails secure on errors

```typescript
// Usage
const isOwner = await AuthorizationService.isCaseOwner(user, caseId);
if (!isOwner) {
  return ResponseHandler.forbidden('Only case owners can perform this action');
}
```

## Error Semantics Strategy

### 🔐 Security-First Error Design

#### **401 Unauthorized**
- **When**: User is not authenticated
- **Cause**: Missing, invalid, or expired JWT token
- **Response**: Generic authentication required message
- **Security**: Safe to reveal - no sensitive information

#### **403 Forbidden** 
- **When**: User is authenticated but lacks required permissions
- **Cause**: Insufficient role privileges for specific action
- **Response**: Clear permission denial message
- **Security**: User already has some access, safe to be specific

#### **404 Not Found**
- **When**: Resource doesn't exist OR user has no access to it
- **Cause**: Case doesn't exist or authorization failed
- **Response**: Generic "not found" message
- **Security**: **Critical** - prevents resource enumeration attacks

### 🛡️ Resource Enumeration Prevention

**Problem**: Attackers could discover case IDs by observing different error responses:
- `403 Forbidden` → "Case exists but I can't access it"
- `404 Not Found` → "Case doesn't exist"

**Solution**: Always return `404` for unauthorized access attempts:

```typescript
const canAccess = await AuthorizationService.canAccessCase(user, caseId);
if (!canAccess) {
  // Return 404 regardless of whether case exists
  return ResponseHandler.notFound('Case not found');
}
```

## Route Handler Security Patterns

### Pattern 1: Read Operations (GET)
```typescript
export async function GET_Case(request: NextRequest, { params }: { params: { id: string } }) {
  // 1. Authentication check (401 if not authenticated)
  const authResult = await AuthMiddleware.requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  // 2. Authorization check (404 to prevent enumeration)
  const canAccess = await AuthorizationService.canAccessCase(user, params.id);
  if (!canAccess) {
    return ResponseHandler.notFound('Case not found');
  }

  // 3. Proceed with authorized operation
  // ...
}
```

### Pattern 2: Modification Operations (PUT/PATCH)
```typescript
export async function PUT_Case(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await AuthMiddleware.requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  // Check both access and ownership
  const [canAccess, isOwner] = await Promise.all([
    AuthorizationService.canAccessCase(user, params.id),
    AuthorizationService.isCaseOwner(user, params.id)
  ]);

  if (!canAccess) {
    return ResponseHandler.notFound('Case not found');
  }

  if (!isOwner) {
    // 403 is appropriate here - user can see case but can't modify
    return ResponseHandler.forbidden('Only case owners can modify cases');
  }

  // Proceed with modification
  // ...
}
```

### Pattern 3: Listing Operations (GET /cases)
```typescript
export async function GET_Cases(request: NextRequest) {
  const authResult = await AuthMiddleware.requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  // Pre-filter results based on user permissions
  const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
  
  // Only fetch data for accessible cases
  const cases = await fetchCasesByIds(accessibleCaseIds);
  
  return ResponseHandler.success({ cases });
}
```

## Security Design Decisions

### 1. **Fail-Secure Architecture**
- All authorization methods return `false`/deny on errors
- Database connection issues don't grant unexpected access
- Logging captures all security-relevant events

### 2. **Performance-Optimized Queries**
- Single database query per authorization check
- Batch operations for listing scenarios
- Minimal data selection (only required fields)

### 3. **Consistent Error Responses**
- Same response time for authorized/unauthorized requests
- No information leakage through error messages
- Prevents timing-based attacks

### 4. **Comprehensive Audit Logging**
```typescript
// Successful access
Logger.info(`Case accessed: ${caseId} by ${user.email} (${user.role})`);

// Failed authorization
Logger.warn(`Access denied: User ${user.email} attempted to access case ${caseId}`);

// Critical actions
Logger.warn(`CASE DELETION: ${caseId} by ${user.email} at ${new Date().toISOString()}`);
```

### 5. **Role-Based Access Control (RBAC)**
- Clear separation of privileges by role
- Admin bypass with proper validation
- Explicit deny for undefined roles

### 6. **Database Security Integration**
```sql
-- Authorization rules enforced at query level
SELECT c.* FROM cases c
WHERE c.id = $1 
  AND (
    -- Client access: own cases only
    ($userRole = 'CLIENT' AND c.owner_id = $userId)
    -- Lawyer access: explicitly granted cases
    OR ($userRole = 'LAWYER' AND EXISTS (
      SELECT 1 FROM case_access ca 
      WHERE ca.case_id = c.id AND ca.lawyer_id = $userId
    ))
    -- Admin access: all cases
    OR $userRole = 'ADMIN'
  );
```

## Implementation Benefits

✅ **Security**: Resource enumeration protection, fail-secure design  
✅ **Performance**: Optimized database queries, batch operations  
✅ **Maintainability**: Reusable helpers, consistent patterns  
✅ **Auditability**: Comprehensive logging, clear permission trails  
✅ **Scalability**: Role-based design accommodates new user types  
✅ **Compliance**: Proper access controls for legal industry requirements  

This implementation ensures that authorization logic never relies on client-side code and provides robust protection against common web application security vulnerabilities.