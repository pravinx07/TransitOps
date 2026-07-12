import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

// Fuel Logs
export const getFuelLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.fuelLog.findMany({
      include: { vehicle: { select: { regNo: true, model: true } } },
      orderBy: { date: "desc" },
    });
    sendSuccess(res, logs, "Fuel logs fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch fuel logs", 500, error);
  }
};

export const addFuelLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleId, date, liters, fuelCost, notes } = req.body;
    
    // Auto-calculate running cost in vehicle if needed, but not required strictly
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        date: new Date(date),
        liters: parseFloat(liters),
        fuelCost: parseFloat(fuelCost),
        notes,
      },
      include: { vehicle: { select: { regNo: true } } }
    });
    sendSuccess(res, log, "Fuel log added successfully", 201);
  } catch (error) {
    sendError(res, "Failed to add fuel log", 500, error);
  }
};

// Expenses
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { vehicle: { select: { regNo: true, model: true } } },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, expenses, "Expenses fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch expenses", 500, error);
  }
};

export const addExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripRef, vehicleId, date, toll, other, maintenance, status, notes } = req.body;
    const expense = await prisma.expense.create({
      data: {
        tripRef,
        vehicleId,
        toll: parseFloat(toll || 0),
        other: parseFloat(other || 0),
        maintenance: parseFloat(maintenance || 0),
        status: status || "PENDING",
        notes,
        ...(date ? { createdAt: new Date(date) } : {})
      },
      include: { vehicle: { select: { regNo: true } } }
    });
    sendSuccess(res, expense, "Expense added successfully", 201);
  } catch (error) {
    sendError(res, "Failed to add expense", 500, error);
  }
};

// Operational Cost
export const getOperationalCost = async (req: Request, res: Response): Promise<void> => {
  try {
    const fuelAgg = await prisma.fuelLog.aggregate({ _sum: { fuelCost: true } });
    const expAgg = await prisma.expense.aggregate({ _sum: { maintenance: true } });
    
    const totalCost = (fuelAgg._sum.fuelCost || 0) + (expAgg._sum.maintenance || 0);
    
    sendSuccess(res, {
      totalCost,
      breakdown: {
        fuel: fuelAgg._sum.fuelCost || 0,
        maintenance: expAgg._sum.maintenance || 0
      }
    }, "Operational cost calculated");
  } catch (error) {
    sendError(res, "Failed to calculate cost", 500, error);
  }
};
