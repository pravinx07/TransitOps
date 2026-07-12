import { Router } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

const router = Router();

// Settings routes require authentication
router.use(authenticate);

// Everyone can view settings
router.get("/", getSettings);

// Only FLEET_MANAGER can update settings
router.put("/", requireRole("FLEET_MANAGER"), updateSettings);

export default router;
