import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

// Get all drivers
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    // Rule 1: If License Expired -> Automatically Status Suspended
    await prisma.driver.updateMany({
      where: { 
        licenseExpiry: { lt: new Date() },
        status: { not: "SUSPENDED" }
      },
      data: { status: "SUSPENDED" }
    });

    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, drivers, "Drivers fetched successfully");
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Get available drivers (AVAILABLE + valid license)
export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    // Rule 1: Sync suspensions first
    await prisma.driver.updateMany({
      where: { 
        licenseExpiry: { lt: new Date() },
        status: { not: "SUSPENDED" }
      },
      data: { status: "SUSPENDED" }
    });

    const drivers = await prisma.driver.findMany({
      where: {
        status: "AVAILABLE",
        licenseExpiry: {
          gte: new Date() // License not expired
        }
      },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, drivers, "Available drivers fetched successfully");
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Get driver by ID
export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }

    return sendSuccess(res, driver, "Driver fetched successfully");
  } catch (error) {
    console.error("Error fetching driver:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Create driver
export const createDriver = async (req: Request, res: Response) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;

    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber }
    });

    if (existingDriver) {
      return sendError(res, "Driver with this license number already exists", 400);
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: new Date(licenseExpiry),
        contactNumber,
        safetyScore: safetyScore ?? 100,
        status: status || "AVAILABLE"
      }
    });

    return sendSuccess(res, driver, "Driver created successfully", 201);
  } catch (error) {
    console.error("Error creating driver:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Update driver
export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;

    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }

    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNumber }
      });
      if (existing) {
        return sendError(res, "Driver with this license number already exists", 400);
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        contactNumber,
        safetyScore,
        status
      }
    });

    return sendSuccess(res, updatedDriver, "Driver updated successfully");
  } catch (error) {
    console.error("Error updating driver:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Delete driver
export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const driver = await prisma.driver.findUnique({
      where: { id }
    });

    if (!driver) {
      return sendError(res, "Driver not found", 404);
    }

    // Usually we would check if driver has trips etc. and maybe just mark as INACTIVE
    // For now we do a hard delete as per simple spec
    await prisma.driver.delete({
      where: { id }
    });

    return sendSuccess(res, null, "Driver deleted successfully");
  } catch (error) {
    console.error("Error deleting driver:", error);
    return sendError(res, "Internal server error", 500);
  }
};

// Report Incident (Rule 5)
export const reportIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // LATE_DELIVERY, SPEED_VIOLATION, ACCIDENT

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) return sendError(res, "Driver not found", 404);

    let penalty = 0;
    if (type === 'LATE_DELIVERY') penalty = 5;
    else if (type === 'SPEED_VIOLATION') penalty = 15;
    else if (type === 'ACCIDENT') penalty = 30;
    else return sendError(res, "Invalid incident type", 400);

    const newScore = Math.max(0, driver.safetyScore - penalty);

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: { safetyScore: newScore }
    });

    return sendSuccess(res, updatedDriver, `Incident reported. Safety score decreased by ${penalty} points.`);
  } catch (error) {
    console.error("Error reporting incident:", error);
    return sendError(res, "Internal server error", 500);
  }
};
