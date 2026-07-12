import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding (auth-only)...");

  // Clear existing User data
  await prisma.user.deleteMany();

  // Create Users with different roles
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      name: "John Fleet Manager",
      email: "manager@transitops.com",
      password: hashedPassword,
      role: Role.FLEET_MANAGER,
    },
  });

  await prisma.user.create({
    data: {
      name: "Alex Driver User",
      email: "driver@transitops.com",
      password: hashedPassword,
      role: Role.DRIVER,
    },
  });

  await prisma.user.create({
    data: {
      name: "Sarah Safety Officer",
      email: "safety@transitops.com",
      password: hashedPassword,
      role: Role.SAFETY_OFFICER,
    },
  });

  await prisma.user.create({
    data: {
      name: "Fred Finance Analyst",
      email: "finance@transitops.com",
      password: hashedPassword,
      role: Role.FINANCIAL_ANALYST,
    },
  });

  console.log("Users seeded successfully!");
  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error("Error seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
