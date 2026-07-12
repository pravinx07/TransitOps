import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as analyticsController from "./analytics.controller";

const router = Router();

router.use(authenticate);

router.get("/", analyticsController.getAnalytics);

export default router;
