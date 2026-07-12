import { Router } from "express";
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from "./vehicles.controller";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { createVehicleSchema, updateVehicleSchema } from "../../validators/vehicle.validator";

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

// Read — any authenticated role
router.get("/", getVehicles);
router.get("/:id", getVehicleById);

// Write — Fleet Manager only
router.post("/", requireRole("FLEET_MANAGER"), validate(createVehicleSchema), createVehicle);
router.put("/:id", requireRole("FLEET_MANAGER"), validate(updateVehicleSchema), updateVehicle);
router.delete("/:id", requireRole("FLEET_MANAGER"), deleteVehicle);

export default router;
