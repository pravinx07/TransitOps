import { Request as Req, Response as Res } from 'express';
import { PrismaClient, TripStatus, DriverStatus, VehicleStatus } from '@prisma/client';

const prisma = new PrismaClient();

const sendSuccess = (res: Res, data: any, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res: Res, message: string, statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

export const getTrips = async (req: Req, res: Res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, trips, 'Trips retrieved successfully');
  } catch (error) {
    console.error('Error fetching trips:', error);
    return sendError(res, 'Failed to retrieve trips');
  }
};

export const createTrip = async (req: Req, res: Res) => {
  try {
    const { source, destination, cargoWeight, plannedDistance, vehicleId, driverId } = req.body;

    // Validation
    if (!source || !destination || !cargoWeight || !plannedDistance || !vehicleId || !driverId) {
      return sendError(res, 'All fields are required', 400);
    }

    // Check capacity
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);
    
    if (cargoWeight > vehicle.capacityKg) {
      return sendError(res, `Capacity exceeded. Maximum is ${vehicle.capacityKg} kg.`, 400);
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.status === 'SUSPENDED') {
      return sendError(res, 'Driver not available or suspended', 400);
    }

    // Generate Trip Number
    const tripCount = await prisma.trip.count();
    const tripNumber = `TR${String(tripCount + 1).padStart(3, '0')}`;

    const trip = await prisma.trip.create({
      data: {
        tripNumber,
        source,
        destination,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        vehicleId,
        driverId,
        status: 'DRAFT',
      },
      include: { driver: true, vehicle: true }
    });

    return sendSuccess(res, trip, 'Trip created successfully', 201);
  } catch (error) {
    console.error('Error creating trip:', error);
    return sendError(res, 'Failed to create trip');
  }
};

export const updateTripStatus = async (req: Req, res: Res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(TripStatus).includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const currentTrip = await prisma.trip.findUnique({ where: { id } });
    if (!currentTrip) return sendError(res, 'Trip not found', 404);

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { status },
      include: { driver: true, vehicle: true }
    });

    // Update driver and vehicle status based on trip status
    if (status === 'DISPATCHED') {
      if (currentTrip.driverId) {
        await prisma.driver.update({ where: { id: currentTrip.driverId }, data: { status: 'ON_TRIP' } });
      }
      if (currentTrip.vehicleId) {
        await prisma.vehicle.update({ where: { id: currentTrip.vehicleId }, data: { status: 'ON_TRIP' } });
      }
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (currentTrip.driverId) {
        await prisma.driver.update({ where: { id: currentTrip.driverId }, data: { status: 'AVAILABLE' } });
      }
      if (currentTrip.vehicleId) {
        await prisma.vehicle.update({ where: { id: currentTrip.vehicleId }, data: { status: 'AVAILABLE' } });
      }
    }

    return sendSuccess(res, updatedTrip, 'Trip status updated');
  } catch (error) {
    console.error('Error updating trip status:', error);
    return sendError(res, 'Failed to update trip status');
  }
};
