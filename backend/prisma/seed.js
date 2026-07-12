"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Starting database seeding...");
    // Clear existing data
    await prisma.expense.deleteMany();
    await prisma.fuelLog.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    // Create Users with different roles
    const hashedPassword = await bcryptjs_1.default.hash("password123", 10);
    const manager = await prisma.user.create({
        data: {
            name: "John Fleet Manager",
            email: "manager@transitops.com",
            password: hashedPassword,
            role: client_1.Role.FLEET_MANAGER,
        },
    });
    const driverUser = await prisma.user.create({
        data: {
            name: "Alex Driver User",
            email: "driver@transitops.com",
            password: hashedPassword,
            role: client_1.Role.DRIVER,
        },
    });
    const safety = await prisma.user.create({
        data: {
            name: "Sarah Safety Officer",
            email: "safety@transitops.com",
            password: hashedPassword,
            role: client_1.Role.SAFETY_OFFICER,
        },
    });
    const finance = await prisma.user.create({
        data: {
            name: "Fred Finance Analyst",
            email: "finance@transitops.com",
            password: hashedPassword,
            role: client_1.Role.FINANCIAL_ANALYST,
        },
    });
    console.log("Users seeded successfully!");
    // Create Vehicles
    const van05 = await prisma.vehicle.create({
        data: {
            registrationNumber: "VAN05",
            name: "Van-05",
            type: "VAN",
            maxLoadCapacity: 500,
            odometer: 12500,
            acquisitionCost: 15000,
            status: client_1.VehicleStatus.AVAILABLE,
            region: "North",
        },
    });
    const truck01 = await prisma.vehicle.create({
        data: {
            registrationNumber: "TRK01",
            name: "Truck-01",
            type: "TRUCK",
            maxLoadCapacity: 5000,
            odometer: 45000,
            acquisitionCost: 55000,
            status: client_1.VehicleStatus.AVAILABLE,
            region: "West",
        },
    });
    const bus02 = await prisma.vehicle.create({
        data: {
            registrationNumber: "BUS02",
            name: "Bus-02",
            type: "BUS",
            maxLoadCapacity: 3500,
            odometer: 28000,
            acquisitionCost: 80000,
            status: client_1.VehicleStatus.IN_SHOP, // Workshop test state
            region: "East",
        },
    });
    console.log("Vehicles seeded successfully!");
    // Create Drivers
    const driver1 = await prisma.driver.create({
        data: {
            name: "Alex Mercer",
            licenseNumber: "LIC001",
            licenseCategory: "Heavy Rigid",
            licenseExpiry: new Date("2028-12-31T00:00:00.000Z"),
            contactNumber: "+1234567890",
            safetyScore: 98,
            status: client_1.DriverStatus.AVAILABLE,
        },
    });
    const driver2 = await prisma.driver.create({
        data: {
            name: "John Doe",
            licenseNumber: "LIC002",
            licenseCategory: "Medium Rigid",
            licenseExpiry: new Date("2027-06-30T00:00:00.000Z"),
            contactNumber: "+1987654321",
            safetyScore: 85,
            status: client_1.DriverStatus.AVAILABLE,
        },
    });
    const driverExpired = await prisma.driver.create({
        data: {
            name: "Jack Expired",
            licenseNumber: "LIC003",
            licenseCategory: "Light Rigid",
            licenseExpiry: new Date("2025-01-01T00:00:00.000Z"), // Expired
            contactNumber: "+1456789123",
            safetyScore: 90,
            status: client_1.DriverStatus.AVAILABLE,
        },
    });
    console.log("Drivers seeded successfully!");
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
//# sourceMappingURL=seed.js.map