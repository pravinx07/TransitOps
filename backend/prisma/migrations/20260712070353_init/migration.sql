/*
  Warnings:

  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FuelLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "FuelLog" DROP CONSTRAINT "FuelLog_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceLog" DROP CONSTRAINT "MaintenanceLog_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_vehicleId_fkey";

-- DropTable
DROP TABLE "Driver";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "FuelLog";

-- DropTable
DROP TABLE "MaintenanceLog";

-- DropTable
DROP TABLE "Trip";

-- DropTable
DROP TABLE "Vehicle";

-- DropEnum
DROP TYPE "DriverStatus";

-- DropEnum
DROP TYPE "MaintenanceStatus";

-- DropEnum
DROP TYPE "TripStatus";

-- DropEnum
DROP TYPE "VehicleStatus";

-- DropEnum
DROP TYPE "VehicleType";
