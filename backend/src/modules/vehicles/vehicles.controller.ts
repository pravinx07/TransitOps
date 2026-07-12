import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

// GET /api/vehicles
export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, search } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(type ? { type: String(type) } : {}),
        ...(status ? { status: String(status) as any } : {}),
        ...(search
          ? {
              OR: [
                { regNo: { contains: String(search), mode: "insensitive" } },
                { model: { contains: String(search), mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, vehicles, "Vehicles fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch vehicles", 500, error);
  }
};

// GET /api/vehicles/:id
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) {
      sendError(res, "Vehicle not found", 404);
      return;
    }
    sendSuccess(res, vehicle, "Vehicle fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch vehicle", 500, error);
  }
};

// POST /api/vehicles
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { regNo, model, type, capacity, odometer, avgCost, status } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { regNo } });
    if (existing) {
      sendError(res, "Validation failed", 400, { regNo: "Registration number already exists" });
      return;
    }

    const vehicle = await prisma.vehicle.create({
      data: { regNo, model, type, capacity, odometer, avgCost, status: status ?? "AVAILABLE" },
    });

    sendSuccess(res, vehicle, "Vehicle created successfully", 201);
  } catch (error) {
    sendError(res, "Failed to create vehicle", 500, error);
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { regNo, model, type, capacity, odometer, avgCost, status } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      sendError(res, "Vehicle not found", 404);
      return;
    }

    // Check regNo uniqueness if being changed
    if (regNo && regNo !== existing.regNo) {
      const conflict = await prisma.vehicle.findUnique({ where: { regNo } });
      if (conflict) {
        sendError(res, "Validation failed", 400, { regNo: "Registration number already exists" });
        return;
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(regNo !== undefined && { regNo }),
        ...(model !== undefined && { model }),
        ...(type !== undefined && { type }),
        ...(capacity !== undefined && { capacity }),
        ...(odometer !== undefined && { odometer }),
        ...(avgCost !== undefined && { avgCost }),
        ...(status !== undefined && { status }),
      },
    });

    sendSuccess(res, updated, "Vehicle updated successfully");
  } catch (error) {
    sendError(res, "Failed to update vehicle", 500, error);
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      sendError(res, "Vehicle not found", 404);
      return;
    }
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, "Vehicle deleted successfully");
  } catch (error) {
    sendError(res, "Failed to delete vehicle", 500, error);
  }
};
