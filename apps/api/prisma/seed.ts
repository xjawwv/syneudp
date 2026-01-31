import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: "mysql",
      name: "MySQL",
      engine: "mysql",
      tier: "shared",
      ratePerHour: 7.53424657534,
      description: "Managed MySQL Database",
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      engine: "postgresql",
      tier: "shared",
      ratePerHour: 7.53424657534,
      description: "Advanced Relational Database",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      engine: "mongodb",
      tier: "shared",
      ratePerHour: 7.53424657534,
      description: "NoSQL Document Database",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { ratePerHour: product.ratePerHour, name: product.name, description: product.description },
      create: product,
    });
  }
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
