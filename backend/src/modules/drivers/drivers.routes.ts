import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as driversController from "./drivers.controller";

const router = Router();

// Only protected routes for drivers
router.use(authenticate);

// Drivers specific routes
router.get("/available", driversController.getAvailableDrivers);

// CRUD operations
router.get("/", driversController.getAllDrivers);
router.post("/", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.createDriver);
router.get("/:id", driversController.getDriverById);
router.put("/:id", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.updateDriver);
router.post("/:id/incident", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.reportIncident);
router.delete("/:id", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), driversController.deleteDriver);

export default router;
