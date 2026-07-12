-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capacityKg" DOUBLE PRECISION NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "tripNumber" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "cargoWeight" DOUBLE PRECISION NOT NULL,
    "plannedDistance" DOUBLE PRECISION NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "vehicleId" TEXT,
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_tripNumber_key" ON "Trip"("tripNumber");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
