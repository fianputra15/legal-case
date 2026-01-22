import { PrismaClient, UserRole, CaseStatus } from '../../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');


  // Create sample lawyer
  const lawyerPasswordHash = await bcrypt.hash('lawyer123', 12);
  const lawyer = await prisma.user.upsert({
    where: { email: 'lawyer@legal.com' },
    update: {},
    create: {
      email: 'lawyer@legal.com',
      passwordHash: lawyerPasswordHash,
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.LAWYER,
    },
  });

  // Create sample client
  const clientPasswordHash = await bcrypt.hash('client123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientPasswordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.CLIENT,
    },
  });

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: 'Contract Dispute - ABC Corp',
      description: 'Client needs assistance with a contract dispute regarding service delivery terms.',
      category: 'CORPORATE_LAW',
      status: CaseStatus.OPEN,
      priority: 3, // High priority
      ownerId: client.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      title: 'Property Purchase Legal Review',
      description: 'Legal review required for residential property purchase in downtown area.',
      category: 'REAL_ESTATE',
      status: CaseStatus.IN_PROGRESS,
      priority: 2, // Medium priority
      ownerId: client.id,
    },
  });

  // Grant lawyer access to cases
  await prisma.caseAccess.create({
    data: {
      caseId: case1.id,
      lawyerId: lawyer.id,
    },
  });

  await prisma.caseAccess.create({
    data: {
      caseId: case2.id,
      lawyerId: lawyer.id,
    },
  });

  // Create sample messages
  await prisma.message.create({
    data: {
      content: 'Hello, I need help with my contract dispute. Can we schedule a consultation?',
      caseId: case1.id,
      senderId: client.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Hi Jane, I\'ve reviewed your case details. Let\'s schedule a call this week to discuss the contract terms.',
      caseId: case1.id,
      senderId: lawyer.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Sample credentials:');
  console.log('Lawyer: lawyer@legal.com / lawyer123');
  console.log('Client: client@example.com / client123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });