# Legal Case Management System

A comprehensive web application for managing legal cases, built with Next.js and designed for law firms and legal professionals.

## Features

- **User Management**: Role-based access control for Clients and Lawyers
- **Case Management**: Create, edit, and track legal cases with status workflows
- **Document Management**: Upload, organize, and download case-related documents
- **Access Control**: Secure case access with lawyer request/approval system
- **Real-time Updates**: Dynamic case status management with business rule enforcement

## Authentication Architecture

This application uses **JWT tokens stored in secure HttpOnly cookies** for authentication. This hybrid approach combines the benefits of both JWT and session-based authentication.

### Why JWT in HttpOnly Cookies?

**Our Choice**: We chose JWT tokens stored in HttpOnly cookies because it provides the best balance of security, scalability, and developer experience for a legal case management system.

### Security Benefits

✅ **XSS Protection**: HttpOnly cookies prevent client-side JavaScript access, eliminating XSS-based token theft  
✅ **CSRF Protection**: SameSite=Strict cookie attribute prevents cross-site request forgery  
✅ **Automatic Transport**: Cookies are automatically sent with requests, no manual header management  
✅ **Secure Transmission**: Secure flag ensures HTTPS-only transmission in production  
✅ **Controlled Expiration**: Server-side cookie expiration with automatic cleanup  

### Implementation Details

```typescript
// JWT Generation and Cookie Setting
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
  expiresIn: "1h"
});

cookies().set("token", token, {
  httpOnly: true,                    // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict",               // Prevents CSRF attacks
  maxAge: 60 * 60,                  // 1 hour expiration
  path: "/",                        // Available app-wide
});
```

### Tradeoffs Analysis

| Aspect | JWT in HttpOnly Cookies | Pure Sessions | JWT in LocalStorage |
|--------|-------------------------|---------------|-------------------|
| **Security** | ✅ High | ✅ High | ❌ Vulnerable to XSS |
| **Scalability** | ✅ Stateless | ❌ Requires session store | ✅ Stateless |
| **Performance** | ✅ No DB lookups | ❌ DB lookup per request | ✅ No server state |
| **Mobile/SPA** | ✅ Works everywhere | ⚠️ Complex for SPA | ✅ Simple for SPA |
| **Token Revocation** | ⚠️ Manual tracking | ✅ Immediate | ❌ No server control |
| **CSRF Protection** | ✅ Built-in | ✅ Built-in | ⚠️ Needs manual CSRF |
| **Implementation** | ✅ Simple | ⚠️ Complex setup | ✅ Very simple |

### Why Not Pure Sessions?

❌ **Scaling Complexity**: Requires Redis/database for session storage across multiple servers  
❌ **Mobile App Support**: Complex to implement for mobile applications  
❌ **Performance**: Database lookup required for every request  
❌ **Microservices**: Difficult to share authentication across services  

### Why Not JWT in LocalStorage?

❌ **XSS Vulnerability**: Client-side storage accessible to JavaScript  
❌ **CSRF Protection**: Requires manual implementation  
❌ **Token Management**: Complex refresh token logic needed  
❌ **Security Best Practices**: Violates OWASP security recommendations  

### Our Security Measures

1. **Short Token Expiration**: 1-hour JWT lifespan reduces exposure window
2. **Secure Cookie Attributes**: HttpOnly, Secure, SameSite protection
3. **Environment-based Security**: Production-only secure flag
4. **Automatic Cleanup**: Expired cookies automatically removed
5. **Server-side Validation**: Every request validates JWT signature and expiration

### Production Considerations

For production deployment, consider these enhancements:

- **Refresh Tokens**: Implement refresh token rotation for longer sessions
- **Token Blacklisting**: Redis-based blacklist for immediate revocation
- **Rate Limiting**: Protect authentication endpoints from brute force
- **Audit Logging**: Track authentication events and security incidents
- **Session Monitoring**: Monitor for suspicious authentication patterns

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: JWT tokens in HttpOnly cookies
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **File Storage**: Supabase Storage
- **API Documentation**: Swagger/OpenAPI

## Environment Setup

Create a `.env.local` file with the required environment variables:

```env
# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secure_jwt_secret_key

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/legal_db"

# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Database Setup and Seeding

### Database Migration

First, set up your database schema:

```bash
# Apply database migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

### User Seeding

Create initial users for testing and development:

```bash
# Seed initial users (lawyer and client)
npm run db:seed
```

This will create:
- **Lawyer Account**: `lawyer@legal.com` / `lawyer123`
- **Client Account**: `client@example.com` / `client123`

### Case Data Seeding

Generate sample cases for development and testing:

```bash
# Generate 12 sample legal cases
npm run db:case-seed
```

This creates diverse cases across different legal categories:
- **Corporate Law**: Contract disputes, business incorporation, consumer protection
- **Real Estate**: Property purchase reviews, tenant eviction processes
- **Family Law**: Divorce settlements, inheritance disputes
- **Intellectual Property**: Trademark registration, IP protection
- **Other**: Debt collection, general legal matters

### Complete Database Reset

To reset the entire database with fresh data:

```bash
# Reset database and reseed with users + cases
npm run db:reset
```

### Database Management

Additional database commands:

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Pull schema from existing database
npm run db:pull

# View current migrations
npx prisma migrate status
```

### Customizing Seeds

To modify seed data:

1. **Add More Users**: Edit `prisma/seed.ts`
   ```typescript
   // Add additional lawyers or clients
   await prisma.user.create({
     data: {
       email: 'new-lawyer@firm.com',
       passwordHash: await bcrypt.hash('password123', 12),
       firstName: 'Alice',
       lastName: 'Johnson',
       role: UserRole.LAWYER,
     },
   });
   ```

2. **Generate More Cases**: Edit `prisma/case.seed.ts`
   ```typescript
   // Add more case examples
   await prisma.case.create({
     data: {
       title: "New Case Title",
       description: "Detailed case description",
       category: "CRIMINAL_LAW", // Available categories in schema
       status: CaseStatus.OPEN,
       priority: 2,
       ownerId: client.id,
     },
   });
   ```

3. **Available Legal Categories**:
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

### Development Workflow

Typical development setup:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 3. Set up database
npm run db:migrate

# 4. Seed initial data
npm run db:seed
npm run db:case-seed

# 5. Start development server
npm run dev
```

## API Documentation

The application includes comprehensive API documentation with Swagger UI:

- **Development**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Authentication**: Cookie-based authentication for API testing
- **Interactive Testing**: Try all endpoints directly from the Swagger UI

## Project Structure

This project follows Feature-Sliced Design (FSD) architecture:

```
src/
├── app/              # Next.js app router
├── features/         # Feature-based modules (case-create, case-edit, etc.)
├── shared/           # Shared utilities, UI components, and types
├── entities/         # Business entities (user, case, document)
├── widgets/          # Composite UI components
└── views/            # Page-level components
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Prisma Documentation](https://www.prisma.io/docs) - database toolkit and ORM
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
