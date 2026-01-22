# Prisma Database Setup Guide

## Overview

This project uses **Prisma ORM** with **PostgreSQL** for database management. The schema is designed for a legal case management system with proper relationships, indexes, and type safety.

## Database Schema Design

### Key Entities

1. **User** - System users (Lawyer, Client)
2. **Case** - Legal cases with categories and status tracking
3. **CaseAccess** - Junction table for lawyer-case access control
4. **Document** - File attachments for cases
5. **Message** - Communication within cases

### Enums Used

- `UserRole`: LAWYER, CLIENT
- `CaseStatus`: OPEN, CLOSED
- `CaseCategory`: CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, etc.
- `DocumentStatus`: PENDING, PROCESSED, ARCHIVED, DELETED

### Key Design Decisions

1. **CUID for IDs**: Using Prisma's cuid() for better distribution and URL safety
2. **Cascade Deletes**: Cases cascade delete their documents and messages
3. **Unique Constraints**: Email uniqueness, stored document names
4. **Indexes**: Strategic indexes on frequently queried fields (email, status, dates)
5. **Soft Relations**: CaseAccess allows many-to-many lawyer-case relationships

## Database Options

### Option 1: PostgreSQL (Recommended)

#### Local PostgreSQL Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb legal_workspace_dev

# Update .env
DATABASE_URL="postgresql://username:password@localhost:5432/legal_workspace_dev"
```

#### Cloud PostgreSQL (Production)
- **Neon**: Free tier with serverless PostgreSQL
- **Railway**: Easy deployment with PostgreSQL
- **Supabase**: PostgreSQL with additional features
- **AWS RDS**: Production-grade managed PostgreSQL

### Option 2: Prisma Dev (Development)

```bash
# Start local Prisma PostgreSQL
npx prisma dev

# This creates a DATABASE_URL automatically in .env
```

### Option 3: SQLite (Testing/Simple Development)

If you prefer SQLite for development:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
}
```

2. Update `prisma.config.ts`:
```typescript
export default defineConfig({
  datasource: {
    url: "file:./dev.db"
  }
});
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install prisma @prisma/client bcryptjs @types/bcryptjs tsx dotenv
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update the DATABASE_URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/legal_workspace_dev"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Run Migrations
```bash
npm run db:migrate
```
This creates the database schema and migration files.

### 5. Seed Database (Optional)
```bash
npm run db:seed
```

This creates sample data:
- Lawyer user: lawyer@legalfirm.com / lawyer123
- Client user: client@example.com / client123

## Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Pull schema from existing DB
npm run db:pull

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database and re-seed
npm run db:reset
```

## Database Relationships

### User Relationships
- **ownedCases**: Cases owned by the user (1:many)
- **accessibleCases**: Cases accessible to lawyers (many:many via CaseAccess)
- **uploadedDocuments**: Documents uploaded by user (1:many)
- **sentMessages**: Messages sent by user (1:many)

### Case Relationships
- **owner**: The client who owns the case (many:1)
- **lawyerAccess**: Lawyers with access to the case (many:many)
- **documents**: Documents attached to the case (1:many)
- **messages**: Messages within the case (1:many)

### Key Indexes
- `users.email` - Fast user lookup
- `users.role` - Role-based queries
- `cases.ownerId` - Cases by owner
- `cases.status` - Status filtering
- `cases.category` - Category filtering
- `cases.createdAt` - Date sorting
- `case_access.caseId + lawyerId` - Access control
- `documents.caseId` - Documents by case
- `messages.caseId` - Messages by case

## Migration Strategy

### Development
```bash
npm run db:migrate
```
Creates migration files and applies them.

### Production
```bash
npx prisma migrate deploy
```
Applies pending migrations (no prompts).

### Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Name your migration descriptively
4. Review generated SQL in `prisma/migrations/`
5. Commit migration files to version control

## Best Practices

1. **Always use migrations** in production
2. **Backup database** before major migrations
3. **Test migrations** in staging environment
4. **Use transactions** for complex operations
5. **Index frequently queried fields**
6. **Use proper TypeScript types** from Prisma

## Troubleshooting

### Migration Issues
```bash
# Reset migrations (development only)
npm run db:reset

# Manual migration reset
npx prisma migrate reset --force
```

### Connection Issues
1. Verify DATABASE_URL in .env
2. Ensure PostgreSQL is running
3. Check database exists
4. Verify user permissions

### Type Issues
```bash
# Regenerate Prisma client
npm run db:generate
```

## Production Considerations

1. **Connection Pooling**: Configure appropriate pool size
2. **SSL**: Enable SSL for cloud databases
3. **Backups**: Set up automated backups
4. **Monitoring**: Monitor query performance
5. **Indexes**: Add indexes based on query patterns
6. **Migrations**: Use `prisma migrate deploy` in CI/CD