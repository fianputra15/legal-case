import { PrismaClient, CaseStatus } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const client = await prisma.user.findFirst({
    where: { email: "client@example.com" },
  });

  if (!client) {
    throw new Error("Client user not found. Please run user seed first.");
  }

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: "Contract Dispute - ABC Corp",
      description:
        "Client needs assistance with a contract dispute regarding service delivery terms.",
      category: "CORPORATE_LAW",
      status: CaseStatus.OPEN,
      priority: 3, // High priority
      ownerId: client.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      title: "Property Purchase Legal Review",
      description:
        "Legal review required for residential property purchase in downtown area.",
      category: "REAL_ESTATE",
      status: CaseStatus.OPEN,
      priority: 2, // Medium priority
      ownerId: client.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      title: "Employment Termination Dispute",
      description: "Client disputes unfair termination and seeks legal advice.",
      category: "CORPORATE_LAW",
      status: CaseStatus.OPEN,
      priority: 3,
      ownerId: client.id,
    },
  });

  const case4 = await prisma.case.create({
    data: {
      title: "Contract Breach Review",
      description: "Review contract breach and potential legal actions.",
      category: "CORPORATE_LAW",
      status: CaseStatus.OPEN,
      priority: 1,
      ownerId: client.id,
    },
  });

  const case5 = await prisma.case.create({
    data: {
      title: "Divorce Settlement Consultation",
      description:
        "Legal consultation regarding divorce settlement and asset division.",
      category: "FAMILY_LAW",
      status: CaseStatus.OPEN,
      priority: 2,
      ownerId: client.id,
    },
  });

  const case6 = await prisma.case.create({
    data: {
      title: "Business Partnership Agreement",
      description:
        "Drafting and reviewing partnership agreement for new startup.",
      category: "INTELLECTUAL_PROPERTY",
      status: CaseStatus.OPEN,
      priority: 1,
      ownerId: client.id,
    },
  });

  const case7 = await prisma.case.create({
    data: {
      title: "Intellectual Property Protection",
      description: "Trademark registration and IP protection strategy.",
      category: "INTELLECTUAL_PROPERTY",
      status: CaseStatus.OPEN,
      priority: 2,
      ownerId: client.id,
    },
  });

  const case8 = await prisma.case.create({
    data: {
      title: "Debt Collection Case",
      description:
        "Assistance required for recovering outstanding business debts.",
      category: "OTHER",
      status: CaseStatus.OPEN,
      priority: 3,
      ownerId: client.id,
    },
  });

  const case9 = await prisma.case.create({
    data: {
      title: "Tenant Eviction Process",
      description:
        "Legal guidance needed for tenant eviction due to contract violation.",
      category: "REAL_ESTATE",
      status: CaseStatus.OPEN,
      priority: 2,
      ownerId: client.id,
    },
  });

  const case10 = await prisma.case.create({
    data: {
      title: "Company Incorporation Setup",
      description: "Legal setup and compliance for new company incorporation.",
      category: "CORPORATE_LAW",
      status: CaseStatus.OPEN,
      priority: 1,
      ownerId: client.id,
    },
  });

  const case11 = await prisma.case.create({
    data: {
      title: "Consumer Protection Complaint",
      description: "Filing a complaint related to consumer rights violation.",
      category: "CORPORATE_LAW",
      status: CaseStatus.OPEN,
      priority: 3,
      ownerId: client.id,
    },
  });

  const case12 = await prisma.case.create({
    data: {
      title: "Inheritance Dispute Resolution",
      description:
        "Legal dispute regarding inheritance and estate distribution.",
      category: "FAMILY_LAW",
      status: CaseStatus.OPEN,
      priority: 2,
      ownerId: client.id,
    },
  });

  console.log("Database seeded successfully!");
  console.log("Sample credentials:");
  console.log("Lawyer: lawyer@legal.com / lawyer123");
  console.log("Client: client@example.com / client123");
  console.log({
    case1,
    case2,
    case3,
    case4,
    case5,
    case6,
    case7,
    case8,
    case9,
    case10,
    case11,
    case12,
  })
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
