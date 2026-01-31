import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing products
  await prisma.product.deleteMany({});

  await prisma.product.createMany({
    data: [
      {
        id: "mysql",
        name: "MySQL",
        engine: "mysql",
        tier: "shared",
        ratePerHour: 0, // Dynamic System Pricing
        description: "Managed MySQL Database",
      },
      {
        id: "postgresql",
        name: "PostgreSQL",
        engine: "postgresql",
        tier: "shared",
        ratePerHour: 0, // Dynamic System Pricing
        description: "Advanced Relational Database",
      },
      {
        id: "mongodb",
        name: "MongoDB",
        engine: "mongodb",
        tier: "shared",
        ratePerHour: 0, // Dynamic System Pricing
        description: "NoSQL Document Database",
      },
    ],
    skipDuplicates: true,
  });
  console.log("Seed data updated: Using IDR values (800).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
