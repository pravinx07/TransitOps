import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as dashboardController from "./dashboard.controller";

const router = Router();

router.use(authenticate);

router.get("/metrics", dashboardController.getDashboardMetrics);

export default router;
