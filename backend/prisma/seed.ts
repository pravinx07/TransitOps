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

  // Clear existing Vehicle data
  await prisma.vehicle.deleteMany();

  // Seed Vehicles matching mockup
  await prisma.vehicle.create({
    data: {
      regNo: "GJ01AB1234",
      model: "VAN-05",
      type: "Van",
      capacity: "500 kg",
      odometer: 74000,
      avgCost: 620000,
      status: "AVAILABLE",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNo: "GJ01AB4915",
      model: "TRUCK-11",
      type: "Truck",
      capacity: "5 Ton",
      odometer: 182000,
      avgCost: 2450000,
      status: "ON_TRIP",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNo: "GJ01AB7720",
      model: "MINI-03",
      type: "Mini",
      capacity: "1 Ton",
      odometer: 66000,
      avgCost: 410000,
      status: "IN_SHOP",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNo: "GJ01AB1008",
      model: "VAN-01",
      type: "Van",
      capacity: "750 kg",
      odometer: 241900,
      avgCost: 590000,
      status: "RETIRED",
    },
  });

  console.log("Vehicles seeded successfully!");
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
