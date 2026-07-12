import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fleet Utilization
    const totalVehicles = await prisma.vehicle.count();
    const vehiclesOnTrip = await prisma.vehicle.count({ where: { status: "ON_TRIP" } });
    const fleetUtilization = totalVehicles > 0 ? Math.round((vehiclesOnTrip / totalVehicles) * 100) : 0;

    // 2. Operational Cost (Fuel + Maintenance)
    const fuelLogs = await prisma.fuelLog.aggregate({ _sum: { fuelCost: true, liters: true } });
    const expenses = await prisma.expense.aggregate({ _sum: { maintenance: true, toll: true, other: true } });
    
    const totalFuelCost = fuelLogs._sum.fuelCost || 0;
    const totalMaintenance = expenses._sum.maintenance || 0;
    const operationalCost = totalFuelCost + totalMaintenance;

    // 3. Fuel Efficiency (Total Distance / Total Fuel)
    // For simplicity, we use the sum of all odometers as total distance
    const vehiclesAgg = await prisma.vehicle.aggregate({ _sum: { odometer: true, avgCost: true } });
    const totalDistance = vehiclesAgg._sum.odometer || 0;
    const totalFuelLiters = fuelLogs._sum.liters || 0;
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(1) : "0.0";

    // 4. Vehicle ROI = [Revenue - (Maintenance + Fuel)] / Acquisition Cost
    // We mock revenue as it's not in the DB, let's assume a fixed revenue rate per km (e.g. 50 per km)
    const totalRevenue = totalDistance * 50; 
    const acquisitionCost = vehiclesAgg._sum.avgCost || 100000; // fallback to 100k if 0
    const roi = acquisitionCost > 0 
      ? (((totalRevenue - operationalCost) / acquisitionCost) * 100).toFixed(1)
      : "0.0";

    // 5. Monthly Expenses (Real Data from FuelLogs and Expenses)
    const allFuelLogs = await prisma.fuelLog.findMany({ select: { date: true, fuelCost: true } });
    const allExpenses = await prisma.expense.findMany({ select: { createdAt: true, maintenance: true, toll: true, other: true } });

    const monthMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months to 0
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m < 0) m += 12;
      monthMap[monthNames[m]] = 0;
    }

    allFuelLogs.forEach(log => {
      const month = monthNames[log.date.getMonth()];
      if (monthMap[month] !== undefined) {
        monthMap[month] += log.fuelCost;
      }
    });

    allExpenses.forEach(exp => {
      const month = monthNames[exp.createdAt.getMonth()];
      if (monthMap[month] !== undefined) {
        monthMap[month] += (exp.maintenance + (exp.toll || 0) + (exp.other || 0));
      }
    });

    const monthlyExpensesData = Object.entries(monthMap).map(([month, cost]) => ({
      month,
      cost
    }));

    // 6. Top Costliest Vehicles
    const topVehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        expenses: true
      }
    });

    const costliestVehicles = topVehicles.map(v => {
      const vFuel = v.fuelLogs.reduce((acc, log) => acc + log.fuelCost, 0);
      const vExp = v.expenses.reduce((acc, exp) => acc + exp.maintenance, 0);
      return {
        regNo: v.regNo,
        model: v.model,
        totalCost: vFuel + vExp
      };
    }).sort((a, b) => b.totalCost - a.totalCost).slice(0, 3);

    sendSuccess(res, {
      fuelEfficiency,
      fleetUtilization,
      operationalCost,
      roi,
      monthlyExpenses: monthlyExpensesData,
      costliestVehicles
    }, "Analytics fetched successfully");
  } catch (error) {
    sendError(res, "Failed to fetch analytics", 500, error);
  }
};
