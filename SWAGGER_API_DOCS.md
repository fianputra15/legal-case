# API Documentation with Swagger UI

## 📚 Overview

The Legal Case Management API now includes comprehensive OpenAPI/Swagger documentation accessible through a web interface.

## 🚀 Accessing Swagger UI

### Local Development
```
http://localhost:3000/api/docs
```

### Production
```
https://your-domain.com/api/docs
```

## 🔧 Setup

The Swagger documentation is automatically available once you start your Next.js development server:

```bash
npm run dev
```

## 📖 Documentation Features

### Documented Endpoints

#### **Authentication**
- `POST /api/auth/login` - User login with role-based examples
- `GET /api/auth/me` - Get current user information  
- `POST /api/auth/logout` - User logout

#### **Cases** (Example)
- `GET /api/cases` - List accessible cases
- `POST /api/cases` - Create new case

### Security Documentation

#### **Authentication Methods**
1. **Bearer Token** (Authorization header)
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **HTTP-Only Cookie** (Automatic after login)
   ```
   Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### **Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist or access denied)
- `500` - Internal Server Error

## 🧪 Testing APIs in Swagger UI

### Step 1: Authentication
1. Navigate to `POST /api/auth/login`
2. Click **"Try it out"**
3. Use one of the example credentials:
   ```json
   {
     "email": "client@example.com",
     "password": "client123"
   }
   ```
4. Execute the request
5. The authentication cookie will be set automatically

### Step 2: Test Protected Endpoints
1. Navigate to any protected endpoint (e.g., `GET /api/auth/me`)
2. Click **"Try it out"**
3. Execute - should work automatically with the cookie

### Manual Token Authorization
If you prefer to use Bearer tokens:
1. Click the **"Authorize"** button at the top
2. Enter your JWT token in the Bearer Auth field
3. Click **"Authorize"**

## 🔧 Configuration

### Environment Variables
```env
# Required for JWT tokens
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Database connection
DATABASE_URL="postgres://..."
```

### Swagger Configuration
The OpenAPI specification is defined in:
```
src/server/config/swagger.ts
```

### Adding New Endpoint Documentation

Add JSDoc comments above your route handlers:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     tags:
 *       - YourTag
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function GET(request: NextRequest) {
  // Your implementation
}
```

## 📊 Schema Definitions

### Core Schemas Available
- `User` - User entity with role information
- `Case` - Legal case with status, priority, etc.
- `LoginRequest` - Login credentials
- `LoginResponse` - Authentication response
- `ErrorResponse` - Standard error format

### Custom Response Components
- `UnauthorizedError` - 401 responses
- `ForbiddenError` - 403 responses  
- `NotFoundError` - 404 responses
- `InternalServerError` - 500 responses

## 🛡️ Security Features

### Resource Enumeration Prevention
The API returns `404` for both non-existent resources and unauthorized access to prevent attackers from discovering resource IDs.

### Role-Based Examples
Documentation includes examples for different user roles (CLIENT, LAWYER, ADMIN) showing how responses vary based on permissions.

### Authentication Flow Documentation
Clear documentation of the authentication flow:
1. Login with credentials
2. Receive HTTP-only cookie
3. Cookie sent automatically with subsequent requests
4. No token management required on frontend

## 🔍 Additional Endpoints

The OpenAPI spec automatically discovers routes in:
- `./app/api/**/*.ts` - All API routes
- `./src/server/examples/*.ts` - Example implementations

## 📝 Raw OpenAPI Specification

Access the raw JSON specification at:
```
http://localhost:3000/api/docs/spec
```

This can be imported into other API tools like Postman or Insomnia.

## 🚀 Production Deployment

For production:
1. Update the server URL in `swagger.ts`
2. Ensure proper CORS settings for the docs endpoints
3. Consider authentication for the docs themselves if needed
4. The documentation will be available at your production URL + `/api/docs`

The Swagger UI is now fully integrated and ready for development and testing!