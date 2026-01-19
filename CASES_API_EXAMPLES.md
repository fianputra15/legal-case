# Cases API - POST /api/cases

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