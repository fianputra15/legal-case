# Cases API Documentation

## GET /api/cases - List Cases with Filtering and Pagination

### Overview
Retrieves cases accessible to the authenticated user with support for filtering, searching, and pagination.

### Authentication & Authorization
- **Required**: Valid authentication token (JWT in cookie or Authorization header)
- **Authorization Rules**:
  - **CLIENT**: Only sees their own cases (where they are the owner)
  - **LAWYER**: Only sees cases they have been granted access to via CaseAccess table
  - **ADMIN**: Sees all cases in the system
- **401 Unauthorized**: If not authenticated

### Endpoint
```
GET /api/cases
```

### Query Parameters

#### Pagination
- `page` (number, optional): Page number (default: 1, minimum: 1)
- `limit` (number, optional): Items per page (default: 10, minimum: 1, maximum: 100)

#### Filtering
- `search` (string, optional): Search by case title (case-insensitive partial match)
- `status` (string, optional): Filter by case status
  - Valid values: `OPEN`, `IN_PROGRESS`, `UNDER_REVIEW`, `AWAITING_CLIENT`, `CLOSED`, `ARCHIVED`
- `category` (string, optional): Filter by case category
  - Valid values: `CRIMINAL_LAW`, `CIVIL_LAW`, `CORPORATE_LAW`, `FAMILY_LAW`, `IMMIGRATION_LAW`, `INTELLECTUAL_PROPERTY`, `LABOR_LAW`, `REAL_ESTATE`, `TAX_LAW`, `OTHER`

### Example Requests

#### Basic Request (Default Pagination)
```bash
curl -X GET "http://localhost:3000/api/cases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### With Pagination
```bash
curl -X GET "http://localhost:3000/api/cases?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### With Search
```bash
curl -X GET "http://localhost:3000/api/cases?search=contract" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### With Status Filter
```bash
curl -X GET "http://localhost:3000/api/cases?status=OPEN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### With Category Filter
```bash
curl -X GET "http://localhost:3000/api/cases?category=CORPORATE_LAW" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Combined Filters
```bash
curl -X GET "http://localhost:3000/api/cases?page=1&limit=10&search=dispute&status=OPEN&category=CIVIL_LAW" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Structure

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "clx1a2b3c4d5e6f7g8h9i0j1",
        "title": "Contract Dispute Resolution",
        "category": "CORPORATE_LAW",
        "status": "OPEN",
        "description": "Client needs assistance with breach of contract claim",
        "priority": 2,
        "ownerId": "clx9y8x7w6v5u4t3s2r1q0p9",
        "createdAt": "2026-01-19T10:30:00.000Z",
        "updatedAt": "2026-01-19T10:30:00.000Z"
      },
      {
        "id": "clx2b3c4d5e6f7g8h9i0j1k2",
        "title": "Family Custody Matter",
        "category": "FAMILY_LAW",
        "status": "IN_PROGRESS",
        "priority": 3,
        "ownerId": "clx9y8x7w6v5u4t3s2r1q0p9",
        "createdAt": "2026-01-18T14:20:00.000Z",
        "updatedAt": "2026-01-19T09:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    },
    "userRole": "CLIENT",
    "appliedFilters": {
      "status": "OPEN"
    }
  }
}
```

#### Empty Results Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cases": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    },
    "userRole": "CLIENT",
    "appliedFilters": {
      "search": "nonexistent"
    }
  }
}
```

#### Out-of-Range Page Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cases": [],
    "pagination": {
      "page": 5,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    },
    "userRole": "CLIENT",
    "appliedFilters": {},
    "message": "Page 5 is out of range. Total pages available: 2"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid Query Parameters
```json
{
  "success": false,
  "error": "Validation failed: Expected number, received nan"
}
```

#### 400 Bad Request - Invalid Status
```json
{
  "success": false,
  "error": "Validation failed: Invalid enum value. Expected 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'AWAITING_CLIENT' | 'CLOSED' | 'ARCHIVED', received 'invalid_status'"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to retrieve cases"
}
```

## Prisma Query Examples

### Basic Query with Authorization
```typescript
// For CLIENT role - only own cases
const cases = await prisma.case.findMany({
  where: {
    id: { in: accessibleCaseIds }, // Pre-filtered by authorization
    ownerId: userId
  },
  orderBy: { createdAt: 'desc' }
});

// For LAWYER role - cases with granted access
const cases = await prisma.case.findMany({
  where: {
    id: { in: accessibleCaseIds }, // Pre-filtered by authorization
    lawyerAccess: {
      some: { lawyerId: userId }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

### With Filtering and Pagination
```typescript
const whereClause = {
  id: { in: accessibleCaseIds },
  ...(filters.search && {
    title: {
      contains: filters.search,
      mode: 'insensitive'
    }
  }),
  ...(filters.status && { status: filters.status }),
  ...(filters.category && { category: filters.category })
};

// Get total count
const total = await prisma.case.count({ where: whereClause });

// Get paginated results
const cases = await prisma.case.findMany({
  where: whereClause,
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit
});
```

## Edge Case Handling

### 1. Empty Results
- **Scenario**: No cases match the filters or user has no accessible cases
- **Response**: Returns empty array with proper pagination metadata
- **Status Code**: 200 OK

### 2. Out-of-Range Pages
- **Scenario**: Requested page number exceeds available pages
- **Response**: Returns empty cases array but keeps requested page number in response
- **Additional Field**: `message` explaining the situation
- **Status Code**: 200 OK

### 3. Invalid Query Parameters
- **Scenario**: Invalid values for page, limit, status, or category
- **Response**: Returns validation error message
- **Status Code**: 400 Bad Request

### 4. Performance Considerations
- **Authorization Pre-filtering**: Case IDs are filtered by authorization service first
- **Database Indexing**: Queries use indexed fields (ownerId, status, category)
- **Pagination Limits**: Maximum 100 items per page to prevent performance issues
- **Search Optimization**: Uses database-level case-insensitive search

### 5. Security Features
- **No Data Leakage**: Users can only see cases they're authorized to access
- **Input Validation**: All query parameters are validated against strict schemas  
- **SQL Injection Protection**: Uses Prisma's type-safe query builder
- **Error Handling**: Internal errors don't expose sensitive information

## POST /api/cases - Create New Case

## Overview
Creates a new legal case. Only authenticated users with CLIENT role can create cases.

## Authentication & Authorization
- **Required**: Valid authentication token (JWT in cookie or Authorization header)
- **Role**: Only users with `CLIENT` role can create cases
- **403 Forbidden**: If authenticated user is not a CLIENT
- **401 Unauthorized**: If not authenticated

## Request

### Endpoint
```
POST /api/cases
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>" // if using header auth
}
```

### Request Body

#### Required Fields
- `title` (string): Case title (1-255 characters)
- `category` (string): Case category - must be one of:
  - `CRIMINAL_LAW`
  - `CIVIL_LAW` 
  - `CORPORATE_LAW`
  - `FAMILY_LAW`
  - `IMMIGRATION_LAW`
  - `INTELLECTUAL_PROPERTY`
  - `LABOR_LAW`
  - `REAL_ESTATE`
  - `TAX_LAW`
  - `OTHER`

#### Optional Fields
- `status` (string): Case status (defaults to `OPEN`) - one of:
  - `OPEN`
  - `IN_PROGRESS`
  - `UNDER_REVIEW` 
  - `AWAITING_CLIENT`
  - `CLOSED`
  - `ARCHIVED`
- `description` (string): Case description

#### Example Request Body
```json
{
  "title": "Contract Dispute Resolution",
  "category": "CORPORATE_LAW",
  "status": "OPEN",
  "description": "Client needs assistance with breach of contract claim against vendor"
}
```

#### Minimal Request Body
```json
{
  "title": "Family Custody Matter",
  "category": "FAMILY_LAW"
}
```

## Responses

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "title": "Contract Dispute Resolution",
    "category": "CORPORATE_LAW", 
    "status": "OPEN",
    "description": "Client needs assistance with breach of contract claim against vendor",
    "priority": 2,
    "ownerId": "clx9y8x7w6v5u4t3s2r1q0p9",
    "createdAt": "2026-01-19T10:30:00.000Z",
    "updatedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid JSON
```json
{
  "success": false,
  "error": "Invalid JSON format"
}
```

#### 400 Bad Request - Validation Error
```json
{
  "success": false, 
  "error": "Validation failed: Title is required, Invalid category"
}
```

#### 400 Bad Request - Missing Required Fields
```json
{
  "success": false,
  "error": "Validation failed: Title is required"
}
```

#### 400 Bad Request - Invalid Category
```json
{
  "success": false,
  "error": "Invalid category. Must be one of: CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### 403 Forbidden - Non-client Role
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create case"
}
```

## cURL Examples

### Basic Case Creation
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Personal Injury Claim",
    "category": "CIVIL_LAW"
  }'
```

### Full Case Creation with Optional Fields
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Employment Discrimination Case",
    "category": "LABOR_LAW",
    "status": "OPEN", 
    "description": "Client facing workplace discrimination based on age"
  }'
```

## Business Rules

1. **Role Restriction**: Only CLIENT role users can create cases
2. **Ownership**: The authenticated client automatically becomes the case owner
3. **Default Status**: If no status is provided, defaults to "OPEN"
4. **Auto-Generated Fields**: 
   - `id`: Unique case identifier (CUID)
   - `priority`: Defaults to 2 (medium)
   - `createdAt`: Current timestamp
   - `updatedAt`: Current timestamp
5. **Validation**: All inputs are validated against predefined schemas
6. **Security**: Internal errors are not exposed to prevent information leakage