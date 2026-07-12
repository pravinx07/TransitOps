import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, region } = req.query;

    const vehicleWhere: any = {};
    if (type && type !== "All") {
      vehicleWhere.type = { equals: type as string, mode: "insensitive" };
    }
    if (status && status !== "All") {
      vehicleWhere.status = status as any;
    }
    if (region && region !== "All") {
      vehicleWhere.region = { equals: region as string, mode: "insensitive" };
    }

    // Vehicles metrics (filtered if type/status provided)
    const totalVehicles = await prisma.vehicle.count({ where: vehicleWhere });
    const availableVehicles = await prisma.vehicle.count({ where: { ...vehicleWhere, status: status && status !== "All" ? status : "AVAILABLE" } });
    const vehiclesInShop = await prisma.vehicle.count({ where: { ...vehicleWhere, status: status && status !== "All" ? status : "IN_SHOP" } });
    const vehiclesOnTrip = await prisma.vehicle.count({ where: { ...vehicleWhere, status: status && status !== "All" ? status : "ON_TRIP" } });
    const retiredVehicles = await prisma.vehicle.count({ where: { ...vehicleWhere, status: status && status !== "All" ? status : "RETIRED" } });

    // Drivers metrics
    const driversOnDuty = await prisma.driver.count({ where: { status: "ON_TRIP" } }); 
    const totalDrivers = await prisma.driver.count();

    // Since we don't have a trips model yet, we will mock trips based on ON_TRIP vehicles for the UI
    const mockTripsCount = vehiclesOnTrip;
    const pendingTripsCount = Math.floor(availableVehicles * 0.2); // mock pending

    const fleetUtilization = totalVehicles > 0 ? Math.round((vehiclesOnTrip / totalVehicles) * 100) : 0;

    // Recent "Trips" - mock based on on_trip vehicles
    const onTripVehiclesData = await prisma.vehicle.findMany({
      where: { ...vehicleWhere, status: "ON_TRIP" },
      take: 5,
    });

    const recentTrips = onTripVehiclesData.map((v, idx) => ({
      id: `TR-${1000 + idx}`,
      tripRef: `TR-${1000 + idx}`,
      vehicle: v.regNo,
      driver: "Assigned Driver", // since we don't have vehicle-driver mapping
      status: "On Trip",
      eta: "45 min"
    }));

    const metrics = {
      activeVehicles: totalVehicles,
      availableVehicles,
      vehiclesInMaintenance: vehiclesInShop,
      activeTrips: mockTripsCount,
      pendingTrips: pendingTripsCount,
      driversOnDuty,
      fleetUtilization,
      recentTrips,
      vehicleStatusDistribution: {
        available: availableVehicles,
        onTrip: vehiclesOnTrip,
        inShop: vehiclesInShop,
        retired: retiredVehicles
      }
    };

    sendSuccess(res, metrics, "Dashboard metrics fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch dashboard metrics", 500, error);
  }
};
