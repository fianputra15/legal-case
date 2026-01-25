# Authorization System Documentation

## Overview

The Legal Case Management System uses a **JWT-based authentication system** with secure **HttpOnly cookies** to manage user sessions and protect routes. This approach provides robust security against XSS and CSRF attacks while maintaining excellent user experience.

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Middleware    │    │   API Routes    │
│                 │    │                 │    │                 │
│ • Login Form    │───▶│ • JWT Verify    │───▶│ • Protected     │
│ • Auto Redirect │    │ • Route Guard   │    │   Endpoints     │
│ • Session Check │    │ • Cookie Check  │    │ • User Context  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Authentication Flow

### 1. User Login (`POST /api/auth/login`)

```typescript
// Request
{
  "email": "user@example.com",
  "password": "userpassword"
}

// Response (Success)
{
  "message": "Login successful"
}
// + Sets HttpOnly cookie: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Security Features:**
- ✅ Constant-time password verification (prevents timing attacks)
- ✅ JWT token with 1-hour expiration
- ✅ HttpOnly cookie (prevents JavaScript access)
- ✅ Secure flag (HTTPS only in production)
- ✅ SameSite=strict (CSRF protection)

### 2. Route Protection (Middleware)

```typescript
// Protected paths
const protectedPaths = ["/", "/case", "/messages"];

// Automatic redirection
if (!token || !jwt.verify(token)) {
  redirect("/login");
}
```

**Protected Routes:**
- `/` - Browse cases (home page)
- `/case/*` - All case-related pages
- `/messages` - Messaging system
- `/my-cases` - User's cases (implicit)

### 3. Session Validation (`GET /api/auth/me`)

```typescript
// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "cmkpizd280000fssdv9ltu6v6",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CLIENT|LAWYER|ADMIN",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z"
    }
  }
}
```

## Role-Based Access Control (RBAC)

### User Roles

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **CLIENT** | • Create cases<br/>• View own cases<br/>• Upload documents<br/>• Grant lawyer access | Case Owner |
| **LAWYER** | • Request case access<br/>• View granted cases<br/>• Download documents<br/>• Browse public cases | Access Requester |
| **ADMIN** | • System management<br/>• View all cases<br/>• User management | Full System Access |

### Permission Matrix

| Action | CLIENT | LAWYER | ADMIN |
|--------|---------|---------|-------|
| Browse Cases | ✅ | ✅ | ✅ |
| Create Case | ✅ | ❌ | ✅ |
| Edit Own Case | ✅ | ❌ | ✅ |
| Request Access | ❌ | ✅ | ✅ |
| Grant Access | ✅ (own cases) | ❌ | ✅ |
| Download Documents | ✅ (own/granted) | ✅ (granted) | ✅ |
| Upload Documents | ✅ (own cases) | ❌ | ✅ |

## Security Implementation

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "12345",
    "iat": 1643723400,
    "exp": 1643727000
  },
  "signature": "HMACSHA256(base64(header) + '.' + base64(payload), secret)"
}
```

### Cookie Configuration

```typescript
// Production-ready cookie settings
{
  httpOnly: true,           // Prevents XSS attacks
  secure: NODE_ENV === "production",  // HTTPS only
  sameSite: "strict",       // CSRF protection
  maxAge: 60 * 60,         // 1 hour expiration
  path: "/"                // App-wide availability
}
```

## API Integration

### Client-Side Authentication Hook

```typescript
// Usage in React components
const { user, isLoading, isAuthenticated } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginRedirect />;
```

### Automatic Session Management

```typescript
// apiClient automatically handles:
// - Cookie attachment
// - 401 response handling
// - Automatic logout on token expiration
```

## Security Best Practices

### 🛡️ Implemented Protections

1. **XSS Prevention**
   - HttpOnly cookies prevent JavaScript access
   - Content Security Policy headers
   - Input sanitization

2. **CSRF Protection**
   - SameSite=strict cookies
   - Origin validation
   - Double-submit cookie pattern

3. **Session Security**
   - Short token expiration (1 hour)
   - Secure cookie transmission
   - Automatic logout on expiry

4. **Password Security**
   - Bcrypt hashing with salt rounds
   - Constant-time comparison
   - No password storage in client state

### 🔒 Environment Variables

```env
# Required for JWT signing
JWT_SECRET=your-super-secure-256-bit-secret

# Database connection
DATABASE_URL=your-database-connection-string
```

## Error Handling

### Authentication Errors

| Error Code | Scenario | Response |
|------------|----------|----------|
| `401` | Missing token | `{ "error": "Unauthorized" }` |
| `401` | Invalid/expired token | `{ "error": "Invalid or expired token" }` |
| `401` | Wrong credentials | `{ "error": "Invalid credentials" }` |
| `404` | User not found | `{ "error": "User not found" }` |

### Automatic Redirects

```typescript
// Middleware handles automatic redirects
Unauthorized + Protected Route → "/login"
Authenticated + "/login" → "/"
```

## Development vs Production

### Development Mode
```typescript
// Cookie settings
{
  secure: false,        // HTTP allowed
  sameSite: "lax"      // More permissive for dev
}
```

### Production Mode
```typescript
// Cookie settings
{
  secure: true,         // HTTPS required
  sameSite: "strict"   // Maximum security
}
```

## Monitoring & Logging

### Security Events Logged
- ✅ Login attempts (success/failure)
- ✅ Token validation failures
- ✅ Unauthorized access attempts
- ✅ Session expiration events

### Performance Metrics
- ✅ Authentication response times
- ✅ Middleware execution time
- ✅ Session validation frequency

## Migration & Updates

### Token Refresh Strategy
Currently using **short-lived tokens** (1 hour) with **automatic logout**. Future enhancements may include:

1. **Refresh Token Pattern**
   - Long-lived refresh tokens
   - Automatic token renewal
   - Improved user experience

2. **Remember Me Functionality**
   - Extended session duration
   - Secure device identification
   - Optional user preference

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loops**
   ```bash
   # Check middleware matcher configuration
   # Verify JWT_SECRET is set correctly
   ```

2. **Session Not Persisting**
   ```bash
   # Verify cookie domain settings
   # Check HTTPS configuration in production
   ```

3. **Token Validation Errors**
   ```bash
   # Ensure JWT_SECRET matches across environments
   # Check token expiration settings
   ```

---

## Quick Reference

### Environment Setup
```bash
# Required environment variables
JWT_SECRET=your-secret-here
NODE_ENV=production|development
DATABASE_URL=your-db-url
```

### API Endpoints
```
POST /api/auth/login     # User authentication
GET  /api/auth/me        # Current user info
POST /api/auth/logout    # Session termination
```

### Protected Routes
```
/                        # Home page
/case/*                 # Case management
/messages               # Messaging system
```

This authorization system provides enterprise-grade security while maintaining excellent developer experience and user convenience.