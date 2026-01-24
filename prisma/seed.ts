import { PrismaClient, UserRole } from './generated/client';
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
  await prisma.user.upsert({
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
  await prisma.user.upsert({
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