import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        id: "mysql-basic",
        name: "MySQL Basic",
        engine: "mysql",
        tier: "basic",
        ratePerHour: 0.05,
        description: "1 vCPU, 1GB RAM, 10GB Storage",
      },
      {
        id: "mysql-pro",
        name: "MySQL Pro",
        engine: "mysql",
        tier: "pro",
        ratePerHour: 0.15,
        description: "2 vCPU, 4GB RAM, 50GB Storage",
      },
      {
        id: "postgresql-basic",
        name: "PostgreSQL Basic",
        engine: "postgresql",
        tier: "basic",
        ratePerHour: 0.05,
        description: "1 vCPU, 1GB RAM, 10GB Storage",
      },
      {
        id: "postgresql-pro",
        name: "PostgreSQL Pro",
        engine: "postgresql",
        tier: "pro",
        ratePerHour: 0.15,
        description: "2 vCPU, 4GB RAM, 50GB Storage",
      },
    ],
    skipDuplicates: true,
  });
  console.log("Seed data created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
