# Authorization System Documentation

## Overview

This document describes the server-side authorization system implemented for the legal case management application. The system enforces strict access control rules to ensure users can only access and modify resources they are authorized to use.

## Core Components

### 1. AuthorizationService (`src/server/auth/authorization.ts`)

Main service class containing authorization logic:

#### Key Methods:
- `canAccessCase(user, caseId)` - Checks if user can access a specific case
- `isCaseOwner(user, caseId)` - Checks if user owns a specific case  
- `hasPermission(user, caseId, permission)` - Checks specific permissions (read/write/delete)
- `getAccessibleCaseIds(user)` - Returns all case IDs accessible to user

### 2. AuthMiddleware Extensions (`src/server/auth/middleware.ts`)

Extended middleware with authorization helpers:

- `requireCaseAccess(request, caseId)` - Middleware requiring case access
- `requireCaseOwnership(request, caseId)` - Middleware requiring case ownership

## Authorization Rules

### User Roles & Permissions

#### CLIENT Role
- ✅ Can access only their own cases (where user.id === case.ownerId)
- ✅ Can create new cases (becomes owner)
- ✅ Can modify their own cases
- ✅ Can delete their own cases
- ❌ Cannot access other users' cases

#### LAWYER Role  
- ✅ Can access cases granted to them via CaseAccess table
- ✅ Can read case details for granted cases
- ❌ Cannot modify cases they don't own
- ❌ Cannot delete cases they don't own
- ❌ Can create new cases (becomes owner)


### Access Control Matrix

| Action | CLIENT (Own Case) | CLIENT (Other Case) | LAWYER (Granted) | LAWYER (Not Granted)  |
|--------|:-----------------:|:------------------:|:----------------:|:-------------------:|
| Read   | ✅                | ❌                 | ✅               | ❌                  |
| Create | ✅                | N/A                | ✅               | N/A                 |
| Update | ✅                | ❌                 | ❌               | ❌                  |
| Delete | ✅                | ❌                 | ❌               | ❌                  |

## Error Handling & Security

### Error Semantics

#### 401 Unauthorized
- User is not authenticated
- Missing or invalid JWT token
- Token has expired

#### 403 Forbidden  
- User is authenticated but lacks required permissions
- Attempting to modify case they don't own
- Insufficient role privileges

#### 404 Not Found
- Case does not exist OR user has no access to it
- **Important**: Used to prevent resource enumeration attacks
- Users cannot determine if a case exists if they can't access it

### Security Features

#### Resource Enumeration Prevention
```typescript
// Returns 404 for both non-existent and inaccessible cases
const authResult = await AuthMiddleware.requireCaseAccess(request, caseId);
if (authResult instanceof NextResponse) {
  return authResult; // Could be 404 even if case exists
}
```

#### Database-Level Security
- All queries filtered by user access rights
- No direct database queries without authorization checks
- Proper indexing on access control fields

## Usage Examples

### Basic Case Access Check

```typescript
import { AuthorizationService } from '@/server/auth/authorization';

// Manual authorization check
const accessCheck = await AuthorizationService.canAccessCase(user, caseId);
if (!accessCheck.allowed) {
  return ResponseHandler.forbidden('Access denied');
}
```

### Middleware-Based Protection

```typescript
// Require case access (most common)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await AuthMiddleware.requireCaseAccess(request, params.id);
  if (authResult instanceof NextResponse) {
    return authResult; // Handles all error cases
  }
  
  const { user } = authResult;
  // User is guaranteed to have access to the case
}

// Require case ownership (for modifications)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await AuthMiddleware.requireCaseOwnership(request, params.id);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  // User is guaranteed to own the case
}
```

### Role-Based Access Control

### Listing Accessible Resources

```typescript
export async function GET(request: NextRequest) {
  const authResult = await AuthMiddleware.requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { user } = authResult;
  
  // Get only cases this user can access
  const accessibleCaseIds = await AuthorizationService.getAccessibleCaseIds(user);
  const cases = await caseService.getCasesByIds(accessibleCaseIds);
  
  return ResponseHandler.success({ cases });
}
```

## Best Practices

### 1. Always Use Server-Side Authorization
```typescript
// ❌ Wrong - Never rely on client-side logic
if (userRole === 'lawyer') {
  // Dangerous - client can manipulate this
}

// ✅ Correct - Always verify on server
const authResult = await AuthMiddleware.requireRole(request, ['LAWYER']);
```

### 2. Fail Securely
```typescript
// ✅ Returns 404 to prevent information leakage
const authResult = await AuthMiddleware.requireCaseAccess(request, caseId);
if (authResult instanceof NextResponse) {
  return authResult; // Could be 404 even if case exists
}
```

### 3. Use Appropriate Error Codes
```typescript
// Authentication required
if (!user) return ResponseHandler.unauthorized('Login required');

// User exists but lacks permission  
if (!canAccess) return ResponseHandler.forbidden('Access denied');

// Resource doesn't exist OR user can't access it
if (!found) return ResponseHandler.notFound('Not found');
```

### 4. Log Security Events
```typescript
// Log successful access
Logger.info(`Case ${caseId} accessed by user ${user.email}`);

// Log failed access attempts
Logger.warn(`Unauthorized access attempt to case ${caseId} by user ${user.email}`);
```

## Database Schema Integration

The authorization system works with these key database relationships:

```sql
-- Case ownership
cases.ownerId -> users.id

-- Lawyer case access grants  
case_access.caseId -> cases.id
case_access.lawyerId -> users.id (where role = 'LAWYER')

-- User roles
users.role IN ('CLIENT', 'LAWYER')
```

This ensures all authorization rules are enforced at the database level with proper foreign key constraints and indexes for performance.

## Testing Authorization

Each authorization rule should be tested with:

1. **Positive cases**: Authorized users can access resources
2. **Negative cases**: Unauthorized users are blocked  
3. **Edge cases**: Non-existent resources, invalid tokens
4. **Security cases**: Resource enumeration attempts

The authorization system provides a robust foundation for secure multi-tenant legal case management.