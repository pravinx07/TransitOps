import { z } from "zod";

const VehicleStatusEnum = z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]);

export const createVehicleSchema = z.object({
  body: z.object({
    regNo: z.string().min(1, "Registration number is required"),
    model: z.string().min(1, "Model is required"),
    type: z.string().min(1, "Type is required"),
    capacity: z.string().min(1, "Capacity is required"),
    odometer: z.number({ message: "Odometer must be a number" }).int().min(0),
    avgCost: z.number({ message: "Avg cost must be a number" }).int().min(0),
    status: VehicleStatusEnum.optional(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    regNo: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
    capacity: z.string().min(1).optional(),
    odometer: z.number().int().min(0).optional(),
    avgCost: z.number().int().min(0).optional(),
    status: VehicleStatusEnum.optional(),
  }),
  params: z.object({ id: z.string() }),
});
