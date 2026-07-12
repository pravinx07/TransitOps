import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as financeController from "./finance.controller";

const router = Router();

// Protect all finance routes
router.use(authenticate);

// Fuel Logs
router.get("/fuel", financeController.getFuelLogs);
router.post("/fuel", requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"), financeController.addFuelLog);

// Expenses
router.get("/expenses", financeController.getExpenses);
router.post("/expenses", requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"), financeController.addExpense);

// Operational Cost
router.get("/operational-cost", financeController.getOperationalCost);

export default router;
